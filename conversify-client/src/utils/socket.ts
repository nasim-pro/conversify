import { io } from "socket.io-client";

const socket = io("http://localhost:2025");  // Backend server URL

export default socket;
