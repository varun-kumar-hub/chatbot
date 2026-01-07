import React from 'react';
import styles from '../styles/MessageBubble.module.css';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ sender, content, fileUrl }) => {
    const isUser = sender === 'user';

    const renderAttachment = () => {
        if (!fileUrl) return null;

        // Simple heuristic to detect images from signed URL path
        // URL format: .../filename?token=...
        const cleanUrl = fileUrl.split('?')[0];
        const isImage = cleanUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
        const fileName = cleanUrl.split('/').pop();

        if (isImage) {
            return (
                <div className={styles.imageContainer}>
                    <img src={fileUrl} alt="attachment" className={styles.image} />
                </div>
            );
        }

        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                📄 {decodeURIComponent(fileName)}
            </a>
        );
    };

    return (
        <div className={`${styles.messageRow} ${isUser ? styles.userRow : styles.aiRow}`}>
            {!isUser && (
                <div className={styles.avatar}>
                    <Bot size={18} />
                </div>
            )}

            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                {renderAttachment()}
                {content && <div className={styles.text}>{content}</div>}
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
