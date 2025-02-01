"use client";
import { useState } from "react";
import { Phone, Video, MessageSquareMore } from "lucide-react";

import ChatWindow from "./ChatWindow";
import AudioCall from "./AudioCall";
import VideoCall from "./VideoCall";

interface User {
    _id: string;
    name: string;
}

interface Props {
    currentUser: User;
    selectedUser: User;
}

const Communication = ({ currentUser, selectedUser }: Props) => {
    const [showAudioCall, setShowAudioCall] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [showChat, setShpwChat] = useState(false);

    return (
        <div>
            {/* Header with call icons */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <h3>Communicate with {selectedUser.name}</h3>
                <div style={{ display: "flex", gap: "3rem" }}>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setShpwChat(true)
                            setShowAudioCall(false);
                            setShowVideoCall(false);
                        }}
                    >
                        <MessageSquareMore />
                    </div>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setShowAudioCall(true);
                            setShowVideoCall(false);
                            setShpwChat(false)
                        }}
                    >
                        <Phone />
                    </div>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setShowVideoCall(true);
                            setShowAudioCall(false);
                            setShpwChat(false)
                        }}
                    >
                        <Video />
                    </div>
                </div>
            </div>

            {/* Chat Window - only show when neither call is active */}
            {showChat && <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />}

            {/* Conditionally render audio or video call */}
            {showAudioCall && <AudioCall currentUser={currentUser} selectedUser={selectedUser} />}
            {showVideoCall && <VideoCall currentUser={currentUser} selectedUser={selectedUser} />}
        </div>
    );
};

export default Communication;
