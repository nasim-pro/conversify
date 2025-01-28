import { useRef } from "react";
import socket from "../utils/socket";

const VideoCall = ({ currentUser, selectedUser }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
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
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

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
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
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
                    Start Call
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
                    End Call
                </button>
            </div>
            <div>
                <h4>Video Call</h4>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", borderRadius: "8px" }}
                />
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", borderRadius: "8px", marginTop: "10px" }}
                />
            </div>
        </div>
    );
};

export default VideoCall;
