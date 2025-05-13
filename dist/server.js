"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./index"));
process.on("uncaughtException", (err) => {
    console.log("Uncaught exception! Shutting down...");
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});
dotenv_1.default.config({ path: "./config.env" });
console.log("NODE_ENV:", process.env.NODE_ENV);
const port = process.env.PORT || 3000;
const server = index_1.default.listen(port, () => {
    console.log(`Server started on http://127.0.0.1:${port}`);
});
process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection! Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
