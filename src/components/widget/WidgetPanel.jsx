import React, { useState, useRef, useEffect } from 'react';
import MessageInput from './MessageInput';

const WidgetPanel = ({ onClose }) => {
    const [config, setConfig] = useState({
        name: "ÇIRAK",
        tagline: "Yükleniyor...",
        welcomeMessage: "Merhaba!",
        fallbackResponse: "Size nasıl yardımcı olabilirim?"
    });
    const [intents, setIntents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/public/config');
            const data = await res.json();
            setConfig(data.config);
            setIntents(data.intents);
            setMessages([{ id: 1, text: data.config.welcomeMessage, type: 'assistant' }]);
        } catch (error) {
            console.error('Widget load error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    };

    const findIntent = (query) => {
        const normalizedQuery = normalizeText(query);
        let bestMatch = null;
        let maxScore = 0;

        intents.forEach(intent => {
            let score = 0;
            intent.intent_keywords.forEach(keyword => {
                const normalizedKeyword = normalizeText(keyword);
                if (normalizedQuery.includes(normalizedKeyword)) {
                    score += normalizedKeyword.length;
                }
            });

            if (score > maxScore) {
                maxScore = score;
                bestMatch = intent;
            }
        });

        return bestMatch;
    };

    const handleSendMessage = (text) => {
        const userMsg = { id: Date.now(), text, type: 'user' };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            const matchedIntent = findIntent(text);

            if (matchedIntent) {
                const responseText = `${matchedIntent.primary_response}${matchedIntent.secondary_response ? '\n\n' + matchedIntent.secondary_response : ''}`;
                const assistantMsg = {
                    id: Date.now() + 1,
                    text: responseText,
                    type: 'assistant',
                    animate: true
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                const fallbackMsg = {
                    id: Date.now() + 1,
                    text: config.fallbackResponse,
                    type: 'assistant',
                    animate: true
                };
                setMessages(prev => [...prev, fallbackMsg]);
            }
        }, 500);
    };

    if (loading) return <div className="cirak-panel animate-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yükleniyor...</div>;

    return (
        <div className="cirak-panel animate-slide-up">
            <div className="cirak-header">
                <div className="cirak-header-info">
                    <h3>{config.name}</h3>
                    <p>{config.tagline}</p>
                </div>
                <button className="cirak-close-btn" onClick={onClose}>&times;</button>
            </div>

            <div className="cirak-message-area" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-row ${msg.type}`}>
                        <div className={`cirak-message-bubble ${msg.animate ? 'animate-fade-in' : ''}`}>
                            {msg.text.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="cirak-intent-menu">
                {intents.filter(i => i.is_active).map((intent) => (
                    <button
                        key={intent.intent_id}
                        className="cirak-intent-btn"
                        onClick={() => handleSendMessage(intent.title)}
                    >
                        {intent.title}
                    </button>
                ))}
            </div>

            <MessageInput onSend={handleSendMessage} />
        </div>
    );
};

export default WidgetPanel;
