import dotenv from "dotenv";
import app from "./index";
import { Server } from "socket.io";

// Uncaught exception error
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception! Shutting down...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

// Get env
dotenv.config({ path: "./config.env" });

// Create HTTP server
const port = parseInt(process.env.PORT!, 10) || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${port}`);
});

// Set up socket.io
const io = new Server(server, {
  cors: { credentials: true },
});
app.set("socketio", io);

// Handle socket connections
io.on("connection", (socket) => {
  socket.on("joinConversation", ({ conversationId, userId }) => {
    const room = `conversation_${conversationId}`;
    socket.join(room);
  });
});

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully…`);
  io.close();
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled rejection error
process.on("unhandledRejection", (err: any) => {
  console.log("Unhandled rejection! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
