import React from 'react';
import styles from '../styles/MessageBubble.module.css';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ sender, content }) => {
    const isUser = sender === 'user';

    return (
        <div className={`${styles.messageRow} ${isUser ? styles.userRow : styles.aiRow}`}>
            {!isUser && (
                <div className={styles.avatar}>
                    <Bot size={18} />
                </div>
            )}

            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                {content}
            </div>

            {isUser && (
                <div className={styles.avatar}>
                    <User size={18} />
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
