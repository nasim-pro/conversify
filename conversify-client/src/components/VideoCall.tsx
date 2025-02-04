import { useEffect, useRef } from "react";
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

    useEffect(() => {
        // First join room
        socket.emit("join_room", currentUser._id);
        // wait for offer event
        socket.on("offer", async ({ offer, from }) => {
            console.log("incoming offer", offer, "from", from);
            
            if (!peerConnection.current) startPeerConnection();
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach((track) => {
                peerConnection.current?.addTrack(track, stream);
            });

            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("answer", { answer, to: from });
        });

        socket.on("answer", async ({ answer }) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on("candidate", ({ candidate }) => {
            if (peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, []);

    const startPeerConnection = () => {
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
    };

    const startCall = async () => {
        startPeerConnection();

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

        // Stop the camera/microphone
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current?.srcObject) {
            remoteVideoRef.current.srcObject = null;
        }

        socket.emit("endCall", { to: selectedUser._id });
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
