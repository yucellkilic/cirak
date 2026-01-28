import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <form className="cirak-input-container" onSubmit={handleSubmit}>
            <input
                type="text"
                className="cirak-input"
                placeholder="Mesajınızı yazın..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="cirak-send-btn" aria-label="Gönder">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
            </button>
        </form>
    );
};

export default MessageInput;
