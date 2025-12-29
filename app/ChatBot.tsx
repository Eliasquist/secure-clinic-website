"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Product knowledge is now handled server-side via system instructions

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hei! 👋 Jeg er her for å svare på spørsmål om Secure Clinic Journal. Hva kan jeg hjelpe deg med?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput("");

        // Add user message
        const newMessages = [...messages, { role: "user", content: userMessage } as Message];
        setMessages(newMessages);

        setIsTyping(true);

        try {
            // Prepare history for API (map 'assistant' to 'model')
            const history = messages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{ text: msg.content }]
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: history
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: "Beklager, jeg opplevde en feil. Vennligst prøv igjen senere."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                className="chat-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Lukk chat" : "Åpne chat"}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <div className="chat-title">Produktassistent</div>
                                <div className="chat-status">Online</div>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message assistant typing">
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                                <span className="typing-dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Spør om produktet..."
                            className="chat-input"
                        />
                        <button type="submit" className="chat-send" disabled={!input.trim()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
