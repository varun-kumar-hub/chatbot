import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- Configuration ---
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    raise ValueError("Missing environment variables. Check your .env file.")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

app = FastAPI()

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    chat_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    
# --- Helpers ---
def get_user_from_token(token: str):
    """
    Validates the Supabase JWT and returns the User ID.
    """
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
           raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

def fetch_context(chat_id: str, token: str, limit: int = 15):
    """
    Fetches the last N messages for context.
    Uses the user's token to respect RLS.
    """
    # Create a client with the user's token for RLS
    auth_client = create_client(SUPABASE_URL, SUPABASE_KEY, options={'headers': {'Authorization': f'Bearer {token}'}})
    
    response = auth_client.table('messages')\
        .select('*')\
        .eq('chat_id', chat_id)\
        .order('created_at', desc=True)\
        .limit(limit)\
        .execute()
    
    # Return reversed (chronological) history
    return response.data[::-1] if response.data else []

# --- Endpoints ---
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Context-Aware Chatbot API"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest, 
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    
    token = authorization.split(" ")[1]
    user_id = get_user_from_token(token) # Validate Auth
    
    chat_id = request.chat_id
    user_message = request.message
    
    # 1. Fetch Context
    history = fetch_context(chat_id, token)
    
    # 2. Build Gemini Prompt
    chat_session = model.start_chat(history=[])
    
    # Add history to model context properly
    # Gemini expects: [{'role': 'user', 'parts': ['msg']}, {'role': 'model', 'parts': ['msg']}]
    formatted_history = []
    for msg in history:
        role = 'user' if msg['sender'] == 'user' else 'model'
        formatted_history.append({'role': role, 'parts': [msg['content']]})
        
    # Start a chat instance with history
    try:
        chat_session = model.start_chat(history=formatted_history)
        
        # 3. Generate Response
        response = chat_session.send_message(user_message)
        ai_reply = response.text
        
        # 4. Save to Database (User Message)
        auth_client = create_client(SUPABASE_URL, SUPABASE_KEY, options={'headers': {'Authorization': f'Bearer {token}'}})
        
        auth_client.table('messages').insert({
            'chat_id': chat_id,
            'sender': 'user',
            'content': user_message
        }).execute()
        
        # 5. Save to Database (AI Message)
        auth_client.table('messages').insert({
            'chat_id': chat_id,
            'sender': 'ai',
            'content': ai_reply
        }).execute()
        
        return ChatResponse(reply=ai_reply)

    except Exception as e:
        print(f"Error generating response: {e}")
        # Even if AI fails, we might want to log the user message? 
        # For now, just return error.
        raise HTTPException(status_code=500, detail=str(e))
