import { useRef } from "react";
import socket from "../utils/socket";

const AudioCall = ({ currentUser, selectedUser }) => {
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnection = useRef(null);

    const servers = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302", // Google's free STUN server
            },
        ],
    };

    const startCall = async () => {
        peerConnection.current = new RTCPeerConnection(servers);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("candidate", { candidate: event.candidate, to: selectedUser._id });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (localAudioRef.current) localAudioRef.current.srcObject = stream;

            stream.getTracks().forEach((track) => {
                peerConnection.current?.addTrack(track, stream);
            });

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit("offer", { offer, to: selectedUser._id });
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localAudioRef.current) localAudioRef.current.srcObject = null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    };

    return (
        <div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={startCall}
                    style={{
                        padding: "10px",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Start Audio Call
                </button>
                <button
                    onClick={endCall}
                    style={{
                        padding: "10px",
                        backgroundColor: "#ff4d4d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    End Audio Call
                </button>
            </div>
            <div>
                <h4>Audio Call</h4>
                <audio
                    ref={localAudioRef}
                    autoPlay
                    controls
                    style={{ width: "100%", marginBottom: "10px" }}
                />
                <audio
                    ref={remoteAudioRef}
                    autoPlay
                    controls
                    style={{ width: "100%" }}
                />
            </div>
        </div>
    );
};

export default AudioCall;
