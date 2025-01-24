import React, { useEffect, useRef } from "react";

interface Message {
    senderId: string;
    message: string;
    timestamp: number;
}

interface User {
    _id: string;
    name: string;
}

interface ChatWindowProps {
    chat: Message[];
    currentUser: User;
    selectedUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, selectedUser }) => {
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    return (
        <div
            style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "400px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {chat.map((msg, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        justifyContent: msg.senderId === currentUser._id ? "flex-end" : "flex-start",
                        margin: "5px 0",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "70%",
                            backgroundColor: msg.senderId === currentUser._id ? "#DCF8C6" : "#FFF",
                            padding: "10px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                    >
                        <strong>
                            {msg.senderId === currentUser._id ? "You" : selectedUser.name}
                        </strong>
                        <p style={{ margin: "5px 0" }}>{msg.message}</p>
                        <small style={{ fontSize: "0.8rem", color: "#666" }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </small>
                    </div>
                </div>
            ))}
            <div ref={chatEndRef}></div>
        </div>
    );
};

export default ChatWindow;
