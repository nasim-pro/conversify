import { useRef, useEffect } from "react";
import socket from "../utils/socket";

const AudioCall = ({ currentUser, selectedUser }) => {
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnection = useRef(null);

    const servers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" } // Google's free STUN server
        ],
    };

    /** 
     * Step 1: Start Call (Caller)
     * - Create RTCPeerConnection
     * - Get audio stream & add tracks
     * - Create & send an offer
     */
    const startCall = async () => {
        console.log("Starting call...");

        peerConnection.current = new RTCPeerConnection(servers);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("Sending ICE candidate from caller.");
                socket.emit("candidate", { candidate: event.candidate, to: selectedUser._id });
            }
        };

        peerConnection.current.ontrack = (event) => {
            console.log("Receiving remote audio stream.");
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

            console.log("Sending offer to:", selectedUser._id);
            socket.emit("offer", { offer, to: selectedUser._id });
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    /**
     * Step 2: End Call (Cleanup)
     * - Close RTCPeerConnection
     * - Stop media tracks
     * - Clear audio elements
     */
    const endCall = () => {
        console.log("Ending call...");

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localAudioRef.current) localAudioRef.current.srcObject = null;
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    };

    /**
     * Step 3: Handle Incoming Offer (Receiver)
     * - Create RTCPeerConnection
     * - Set remote description
     * - Create & send an answer
     */
    useEffect(() => {
        const handleOffer = async (data) => {
            console.log("Received offer from:", data.from);

            if (!peerConnection.current) {
                peerConnection.current = new RTCPeerConnection(servers);
            }

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate from receiver.");
                    socket.emit("candidate", { candidate: event.candidate, to: data.from });
                }
            };

            peerConnection.current.ontrack = (event) => {
                console.log("Receiving remote audio stream.");
                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                }
            };

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            console.log("Remote description set.");

            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            console.log("Sending answer to:", data.from);

            socket.emit("answer", { answer, to: data.from });
        };

        /**
         * Step 4: Handle Incoming Answer (Caller)
         * - Set remote description
         * - Ensure ICE candidates are sent
         */
        const handleAnswer = async (data) => {
            if (!peerConnection.current) {
                console.error("PeerConnection is missing when receiving answer!");
                return;
            }

            console.log("Received answer from:", data.from);
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));

            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate after receiving answer.");
                    socket.emit("candidate", { candidate: event.candidate, to: data.from });
                }
            };
        };

        /**
         * Step 5: Handle ICE Candidate Exchange (Both Peers)
         * - Add received ICE candidates
         */
        const handleCandidate = async (data) => {
            if (peerConnection.current) {
                console.log("Received ICE candidate, adding to connection.");
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
                console.error("PeerConnection not found when receiving ICE candidate!");
            }
        };

        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("candidate", handleCandidate);

        return () => {
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("candidate", handleCandidate);

            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
        };
    }, []);

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
                <audio ref={localAudioRef} autoPlay controls style={{ width: "100%", marginBottom: "10px" }} />
                <audio ref={remoteAudioRef} autoPlay controls style={{ width: "100%" }} />
            </div>
        </div>
    );
};

export default AudioCall;
