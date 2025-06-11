import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';


const formatAIResponse = (text) => {
    const sections = text.split('\n\n');
    return sections.map((section, idx) => {
        const lines = section.split('\n');
        return (
            <div key={idx} className="response-section">
                {lines.map((line, lineIdx) => {
                    if (line.match(/^\d+\./)) {
                        return <h3 key={lineIdx}>{line}</h3>;
                    } else if (line.startsWith('•')) {
                        return <li key={lineIdx} className="bullet-point">{line.substring(1).trim()}</li>;
                    } else if (line.startsWith('-')) {
                        return <li key={lineIdx} className="sub-bullet">{line.trim()}</li>;
                    } else if (line.endsWith(':')) {
                        return <h4 key={lineIdx}>{line}</h4>;
                    } else {
                        return <p key={lineIdx}>{line}</p>;
                    }
                })}
            </div>
        );
    });
};

const ChatInterface = ({ cropDetails }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMessage = newMessage.trim();
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setNewMessage('');
        setLoading(true);

        try {
            const response = await axios.post('https://agriculturebackend-production-c8fd.up.railway.app/api/crops/chat', {
                message: userMessage,
                cropDetails: {
                    crop_name: cropDetails.crop_name,
                    variety: cropDetails.variety,
                    soil_ph: cropDetails.soil_ph,
                    planting_date: cropDetails.planting_date,
                    growth_stage: cropDetails.growth_stage,
                    irrigation_type: cropDetails.irrigation_type,
                    field_size: cropDetails.field_size,
                    crop_age_days: cropDetails.crop_age_days,
                    days_until_harvest: cropDetails.days_until_harvest
                }
            });

            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: response.data.reply,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { 
                type: 'error', 
                content: 'Sorry, I had trouble processing that request.',
                timestamp: new Date().toLocaleTimeString()
            }]);
            console.error('Chat error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSuggestedQuestions = () => [
        `What are the critical care requirements for ${cropDetails.crop_name} at its current growth stage?`,
        `What pests should I watch out for in ${cropDetails.growth_stage} stage?`,
        `How should I adjust irrigation based on current conditions?`,
        `When should I apply the next fertilizer treatment?`,
        `What are the harvest indicators I should look for?`
    ];

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Crop Assistant - {cropDetails.crop_name}</h2>
                <p>Ask questions about your crop's care and management</p>
            </div>

            <div className="chat-messages">
                <div className="welcome-message">
                    <h3>Welcome to your personal farming assistant!</h3>
                    <p>I can help you with:</p>
                    <ul>
                        <li>Growing tips and best practices</li>
                        <li>Pest and disease management</li>
                        <li>Irrigation and fertilization schedules</li>
                        <li>Harvest timing and indicators</li>
                    </ul>
                </div>

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <div className="message-header">
                            <span className="message-sender">
                                {msg.type === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            {msg.timestamp && (
                                <span className="message-time">{msg.timestamp}</span>
                            )}
                        </div>
                        <div className="message-content">
                            {msg.type === 'ai' ? (
                                <div className="ai-response">
                                    {formatAIResponse(msg.content)}
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message loading">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="suggested-questions">
                <h4>Suggested Questions:</h4>
                <div className="questions-list">
                    {getSuggestedQuestions().map((question, index) => (
                        <button
                            key={index}
                            onClick={() => setNewMessage(question)}
                            className="question-button"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSendMessage} className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your question here..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !newMessage.trim()}>
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;