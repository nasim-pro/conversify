import express, { Request, Response } from "express";
import process from "node:process";
import { createServer } from "node:http";
import { Server } from "socket.io";
// import { userRouter } from "./user/routes/user.routes.ts";
import { allRoute } from "./all-routes.ts";
import { connectToDb } from "./db-config/db.config.ts";
import { Message } from "./message/message.schema.ts";

connectToDb();
const users = {} as any;
const PORT = process.env.PORT || 2025;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000",], // Explicitly allow these origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

app.use((req: Request, res: Response, next: () => void) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins or specify
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Handle preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); 
  }
  next();
});

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).send({ success: true, backendStatus: 'Running' })
})
app.use("/api", allRoute);

io.on("connection", (socket) => {
 // console.log(`User connected: ${socket.id}`);
  // Join user-specific room
  socket.on("join_room", (userId) => {
    users[userId] = socket.id; // Store socket ID
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle sending messages and save to DB
  socket.on("send_message", async (data) => {
    const { senderId, receiverId, message } = data;
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    io.to(receiverId).emit("receive_message", {
      senderId,
      message,
      timestamp: newMessage.timestamp,
    });
  });

  // Handle WebRTC signaling for video/audio calls
  socket.on("offer", (data) => {
    const { to, offer } = data;
    // console.log("offer recived be", to, offer);
    
    // const receiverSocketId = users[to];
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("offer", { from: socket.id, offer });
    // }
    console.log("users[to]", users[to]);
    
    if (users[to]) {
      io.to(users[to]).emit("offer", { from: socket.id, offer });
    }
  });

  socket.on("answer", (data) => {
    const { to, answer } = data;
    // console.log("to, answer", to, answer);
    
    const receiverSocketId = users[to];
    console.log("receiverSocketId on offer", receiverSocketId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("answer", { from: socket.id, answer });
    }
  });

  socket.on("candidate", (data) => {
    const { to, candidate } = data;
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("candidate", { from: socket.id, candidate });
    }
  });


  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId]; // Remove user entry on disconnect
        break;
      }
    }
  });

});


server.listen(PORT, () => console.log(`Conversify server is running on port ${PORT}`));
