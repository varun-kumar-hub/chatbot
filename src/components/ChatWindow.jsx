import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Paperclip, X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import styles from '../styles/ChatWindow.module.css';

const ChatWindow = ({ chat, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() && !file) return;

        const userMessage = input;
        const userFile = file;

        setInput('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Parent handles the async send
        onSendMessage(userMessage, userFile);
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
                    <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} fileUrl={msg.file_url} />
                ))}
                {isLoading && (
                    <div className={`${styles.typingIndicator} ${styles.aiTyper}`}>
                        <span>●</span><span>●</span><span>●</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                {file && (
                    <div className={styles.filePreview}>
                        <span>📎 {file.name}</span>
                        <button onClick={() => setFile(null)} className={styles.removeFileBtn}><X size={14} /></button>
                    </div>
                )}
                <form className={styles.inputContainer} onSubmit={handleSubmit}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className={styles.attachBtn}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!input.trim() && !file}>
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
