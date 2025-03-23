import { io } from "socket.io-client";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
console.log("apiBaseUrl", apiBaseUrl);

const socket = io(apiBaseUrl);  // Backend server URL

export default socket;
