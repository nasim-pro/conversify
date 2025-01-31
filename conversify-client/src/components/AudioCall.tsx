import { useRef, useEffect } from "react";
import socket from "../utils/socket";

const AudioCall = ({ currentUser, selectedUser }) => {
    // References for local and remote audio elements
    const localAudioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const peerConnection = useRef(null); // Store the RTCPeerConnection instance

    // STUN server configuration for NAT traversal
    const servers = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    /**
     * Function to create a new RTCPeerConnection instance
     * - Sets up ICE candidate handling
     * - Sets up track event to receive remote stream
     */
    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection(servers);

        // Handle ICE candidates (for NAT traversal)
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("candidate", { candidate: event.candidate, to: selectedUser._id });
            }
        };

        // Handle incoming remote media streams
        peerConnection.current.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0];
            }
        };
    };

    /**
     * Function to start an audio call
     * - Creates a new peer connection
     * - Captures local audio stream and adds it to the peer connection
     * - Creates and sends an offer to the remote user
     */
    const startCall = async () => {
        if (peerConnection.current) return; // Prevent multiple connections

        createPeerConnection(); // Initialize peer connection

        try {
            // Get the user's microphone audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Assign the local stream to the local audio element
            if (localAudioRef.current) localAudioRef.current.srcObject = stream;

            // Add the local stream tracks to the peer connection
            stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

            // Create an SDP offer and set it as the local description
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            // Send the offer to the selected user
            socket.emit("offer", { offer, to: selectedUser._id });
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    /**
     * Function to end an ongoing call
     * - Closes the peer connection
     * - Stops local and remote media streams
     */
    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop and clear local and remote media streams
        [localAudioRef, remoteAudioRef].forEach((ref) => {
            if (ref.current?.srcObject) {
                ref.current.srcObject.getTracks().forEach((track) => track.stop());
                ref.current.srcObject = null;
            }
        });
    };

    /**
     * Effect Hook: Handles incoming socket events for WebRTC signaling
     */
    useEffect(() => {
        /**
         * Handles incoming SDP offer from the caller
         * - Creates a new peer connection if not already established
         * - Sets the received offer streamas the remote description
         * - Captures local audio and adds it to the peer connection
         * - Creates and sends an SDP answer to the caller
         */
        const handleOffer = async (data) => {
            if (!peerConnection.current) createPeerConnection();

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));

            // Get the user's microphone audio stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (localAudioRef.current) localAudioRef.current.srcObject = stream;

            // Add local audio tracks to the peer connection
            stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

            // Create and send an SDP answer back to the caller
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit("answer", { answer, to: data.from });
        };

        /**
         * Handles incoming SDP answer from the receiver
         * - Sets the received answer as the remote description
         */
        const handleAnswer = async (data) => {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        };

        /**
         * Handles incoming ICE candidates
         * - Adds received ICE candidates to the peer connection
         */
        const handleCandidate = async (data) => {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        // Listen for WebRTC signaling events
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("candidate", handleCandidate);

        // Cleanup function to remove event listeners and close the connection on unmount
        return () => {
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("candidate", handleCandidate);
            endCall(); // Ensure the connection is properly closed
        };
    }, []);

    return (
        <div>
            {/* Buttons to start and end the audio call */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={startCall}
                    style={{ padding: "10px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    Start Audio Call
                </button>
                <button
                    onClick={endCall}
                    style={{ padding: "10px", backgroundColor: "#ff4d4d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    End Audio Call
                </button>
            </div>

            {/* Audio elements for local and remote streams */}
            <div>
                <h4>Audio Call</h4>
                <audio ref={localAudioRef} autoPlay controls style={{ width: "100%", marginBottom: "10px" }} />
                <audio ref={remoteAudioRef} autoPlay controls style={{ width: "100%" }} />
            </div>
        </div>
    );
};

export default AudioCall;
