import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { supabase } from '../supabaseClient';

const Dashboard = ({ session, onLogout }) => {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 0. Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true); // Always show on desktop
            else setShowSidebar(false); // Default hide on mobile
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Fetch Chats on Mount
    useEffect(() => {
        fetchChats();
    }, [session]);

    const fetchChats = async () => {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching chats:', error);
        else {
            setChats(data);
            if (data.length > 0 && !activeChatId) {
                setActiveChatId(data[0].id);
            }
        }
    };

    // 2. Fetch Messages when Active Chat Changes
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            return;
        }
        fetchMessages(activeChatId);
    }, [activeChatId]);

    const fetchMessages = async (chatId) => {
        setLoadingMessages(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data);
        setLoadingMessages(false);
    };

    const handleSelectChat = (id) => {
        setActiveChatId(id);
        if (isMobile) setShowSidebar(false);
    };

    const handleNewChat = async () => {
        // Create new chat in DB
        const { data, error } = await supabase
            .from('chats')
            .insert([{
                user_id: session.user.id,
                title: 'New Chat'
            }])
            .select();

        if (error) {
            console.error('Error creating chat:', error);
            return;
        }

        if (data && data.length > 0) {
            setChats([data[0], ...chats]); // Prepend
            setActiveChatId(data[0].id);
        }
    };

    const handleDeleteChat = async (id) => {
        const { error } = await supabase.from('chats').delete().eq('id', id);
        if (error) {
            console.error('Error deleting chat:', error);
            return;
        }

        const newChats = chats.filter(c => c.id !== id);
        setChats(newChats);

        if (activeChatId === id) {
            setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
        }
    };

    const handleSendMessage = async (text, file) => {
        if (!activeChatId) return;
        if (!text && !file) return;

        // Optimistic UI Update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            content: text || (file ? `[Uploading: ${file.name}]` : ""),
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // Call Backend API - Use Proxy
            const formData = new FormData();
            formData.append('chat_id', activeChatId);
            if (text) formData.append('message', text);
            if (file) formData.append('file', file);

            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Browser sets this automatically with boundary
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Failed to get AI response');
            }

            const data = await response.json();

            // Refresh messages to get the real DB IDs for both messages
            await fetchMessages(activeChatId);

            // Update Chat Title if it's the first message
            const currentChat = chats.find(c => c.id === activeChatId);
            if (currentChat && currentChat.title === 'New Chat' && text) {
                const newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
                await supabase.from('chats').update({ title: newTitle }).eq('id', activeChatId);
                fetchChats();
            }

        } catch (error) {
            console.error("Chat Error:", error);
            // Add error message to UI
            setMessages(prev => [...prev, {
                id: 'err-' + Date.now(),
                sender: 'ai',
                content: `Error: ${error.message || "Connection failed"}. Please try again.`,
                created_at: new Date().toISOString()
            }]);
        }
    };

    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onLogout={onLogout}
                userEmail={session.user.email}

                isOpen={showSidebar}
                isMobile={isMobile}
                onClose={() => setShowSidebar(false)}
            />
            <ChatWindow
                chat={activeChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={loadingMessages}

                isMobile={isMobile}
                onToggleSidebar={() => setShowSidebar(!showSidebar)}
            />
        </div>
    );
};

export default Dashboard;
