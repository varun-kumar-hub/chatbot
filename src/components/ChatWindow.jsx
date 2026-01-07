import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash } from 'lucide-react';
import MessageBubble from './MessageBubble';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ chat, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');

        // Parent handles the async send
        onSendMessage(userMessage);
    };

    if (!chat) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✨</div>
                <h2>Context-Aware AI Chatbot</h2>
                <p>Select a chat or create a new one to start.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
                    (Ensure you have run the schema.sql in Supabase!)
                </p>
            </div>
        );
    }

    return (
        <div className={styles.chatWindow}>
            <header className={styles.header}>
                <Hash size={18} className={styles.headerIcon} />
                <h2 className={styles.title}>{chat.title || 'New Chat'}</h2>
            </header>

            <div className={styles.messageList}>
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} />
                ))}
                {isLoading && (
                    <div className={`${styles.typingIndicator} ${styles.aiTyper}`}>
                        <span>●</span><span>●</span><span>●</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <form className={styles.inputContainer} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
                        <Send size={18} />
                    </button>
                </form>
                <div className={styles.disclaimer}>
                    AI can make mistakes. Please verify important information.
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
