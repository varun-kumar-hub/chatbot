import React from 'react';
import { MessageSquare, Plus, LogOut, Trash2, Edit2 } from 'lucide-react';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onLogout, userEmail }) => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <button className={styles.newChatBtn} onClick={onNewChat}>
                    <Plus size={20} />
                    <span>New Chat</span>
                </button>
            </div>

            <div className={styles.chatList}>
                <div className={styles.sectionTitle}>Recent</div>
                {chats.map(chat => (
                    <div
                        key={chat.id}
                        className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        <MessageSquare size={16} className={styles.chatIcon} />
                        <span className={styles.chatTitle}>{chat.title || 'New Chat'}</span>
                        {chat.id === activeChatId && (
                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                title="Delete Chat"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>U</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>User</span>
                        <span className={styles.userEmail}>{userEmail}</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} onClick={onLogout} title="Sign Out">
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
