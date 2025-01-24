"use client";
import { useEffect, useState } from "react";
import socket from "../utils/socket";
import ChatWindow from "./ChatWindow";
import axios from "axios";

interface User {
    _id: string;
    name: string;
}

interface Message {
    senderId: string;
    message: string;
    timestamp: string;
}

interface Props {
    currentUser: User;
    selectedUser: User;
}

const ChatBox = ({ currentUser, selectedUser }: Props) => {

    const [message, setMessage] = useState("");

    const [chat, setChat] = useState<Message[]>([]);

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem("token"); // Retrieve token from localStorage

            const response = await axios.get(`http://localhost:2025/api/message/history?currentUserId=${currentUser._id}&selectedUserId=${selectedUser._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // if (!response.ok) throw new Error("Failed to fetch chat history");
            const chatHostory = response?.data?.messages;
            setChat(chatHostory);  // Set the fetched chat history
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    // console.log("chat", chat);

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

            setChat((prev) => [...prev, newMessage]); // Only add to chat when sending
            setMessage(""); // Clear the input field
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div>
            <h3>Chat with {selectedUser.name}</h3>
            <ChatWindow chat={chat} currentUser={currentUser} selectedUser={selectedUser} />
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
                        marginRight: "5px"
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
                        marginTop: "10px"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
