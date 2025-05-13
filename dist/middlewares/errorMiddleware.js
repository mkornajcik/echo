"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const limitError = (err) => {
    return new appError_1.default("Too many requests", 401, true);
};
const JWTError = (err) => {
    return new appError_1.default("Invalid token", 401, true);
};
const JWTExpiredError = (err) => {
    return new appError_1.default("Token expired", 401, true);
};
const duplicateKeyError = (err) => {
    const value = Object.values(err.keyValue)[0];
    const message = `Duplicate field: ${value}. Please use another value.`;
    return new appError_1.default(message, 400, true);
};
const sendDevError = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    console.error("Error", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong.",
        msg: err.message,
    });
};
const sendProdError = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        console.error("Error", err);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
    if (err.isOperational) {
        return res.status(err.statusCode).render("error", { title: "Something went wrong.", msg: err.message });
    }
    console.error("Error", err);
    return res.status(500).render("error", { title: "Something went wrong.", msg: "Please try again later." });
};
const ErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";
    if (process.env.NODE_ENV === "development") {
        sendDevError(err, req, res);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = Object.assign(Object.assign({}, err), { name: err.name });
        error.message = err.message;
        if (error.name === "JsonWebTokenError")
            error = JWTError(error);
        if (error.name === "TokenExpiredError")
            error = JWTExpiredError(error);
        if (error.code === "P2002")
            error = duplicateKeyError(error);
        if (error.status === "429")
            error = limitError(error);
        sendProdError(error, req, res);
    }
};
exports.default = ErrorHandler;
