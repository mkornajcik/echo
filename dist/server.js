"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./index"));
const socket_io_1 = require("socket.io");
process.on("uncaughtException", (err) => {
    console.log("Uncaught exception! Shutting down...");
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});
dotenv_1.default.config({ path: "./config.env" });
const port = parseInt(process.env.PORT, 10) || 3000;
const server = index_1.default.listen(port, "0.0.0.0", () => {
    console.log(`Server running on 0.0.0.0:${port}`);
});
const io = new socket_io_1.Server(server, {
    cors: { credentials: true },
});
index_1.default.set("socketio", io);
io.on("connection", (socket) => {
    socket.on("joinConversation", ({ conversationId, userId }) => {
        const room = `conversation_${conversationId}`;
        socket.join(room);
    });
});
function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully…`);
    io.close();
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection! Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
