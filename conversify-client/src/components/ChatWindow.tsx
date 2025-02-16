import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "../utils/socket";

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

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser }) => {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Message[]>([]);

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage
            const response = await axios.get(
                `http://localhost:2025/api/message/history?currentUserId=${currentUser._id}&selectedUserId=${selectedUser._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const chatHistory = response?.data?.messages;
            setChat(chatHistory); // Set the fetched chat history
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        fetchChatHistory();
        socket.emit("join_room", currentUser._id);

        socket.on("receive_message", (data: Message) => {
            setChat((prev) => [...prev, data]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [currentUser]);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                senderId: currentUser._id,
                message,
                timestamp: new Date().toISOString(),
            };

            socket.emit("send_message", {
                senderId: currentUser._id,
                receiverId: selectedUser._id,
                message,
            });

            setChat((prev) => [...prev, newMessage]); // Add to chat when sending
            setMessage(""); // Clear input field
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    return (
        <>
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
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    rows={4}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        width: "100%",
                        marginTop: "20px",
                    }}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: "10px 15px",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "block",
                        width: "100%",
                        boxSizing: "border-box",
                        marginTop: "10px",
                    }}
                >
                    Send
                </button>
            </div>
        </>

    );
};

export default ChatWindow;
