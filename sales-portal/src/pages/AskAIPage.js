import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleBottomCenterTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import api from '../services/api';

const AskAIPage = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your project or sales data.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/ai/ask', { question: input });
            const aiMessage = { role: 'assistant', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error asking AI:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-indigo-600" />
                    Ask AI Assistant
                </h1>
                <p className="text-gray-600">Get insights about your sales, products, and leaderboard instantly.</p>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-4 rounded-xl text-base shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-500 p-4 rounded-xl border border-gray-200 text-sm shadow-sm animate-pulse">
                                AI is analyzing data...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex space-x-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your sales data..."
                            className="flex-1 border border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`px-6 py-4 rounded-xl bg-indigo-600 text-white font-semibold transition-all shadow-md flex items-center gap-2 ${isLoading || !input.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-1'
                                }`}
                        >
                            <span>Send</span>
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskAIPage;
