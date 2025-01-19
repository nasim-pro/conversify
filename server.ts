import express, { Request, Response } from "express";
import process from "node:process";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { userRouter } from "./user/routes/user.routes.ts";
import { connectToDb } from "./db-config/db.config.ts";
import { Message } from "./message/message.schema.ts";

connectToDb();

const PORT = process.env.PORT || 2025;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // Explicitly allow these origins
    methods: ["GET", "POST", "PUT", "DELETE"],
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
    return res.sendStatus(204); // No Content
  }

  next();
});

app.use(express.json());
app.use("/api", userRouter);
// app.use('/', (_req: Request, res: Response) => {
//     return res.status(200).send({ name: "Conversify", status: "Running", success: true });
// });

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user-specific room
  socket.on("join_room", (userId) => {
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

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(
  PORT,
  () => console.log(`Conversify server is running on port ${PORT}`),
);
