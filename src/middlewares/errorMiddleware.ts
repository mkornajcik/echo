import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

const limitError = (err: any) => {
  return new AppError("Too many requests", 401, true);
};

const JWTError = (err: any) => {
  return new AppError("Invalid token", 401, true);
};

const JWTExpiredError = (err: any) => {
  return new AppError("Token expired", 401, true);
};

const duplicateKeyError = (err: any) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field: ${value}. Please use another value.`;
  return new AppError(message, 400, true);
};

const sendDevError = (err: any, req: Request, res: Response) => {
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

const sendProdError = (err: any, req: Request, res: Response) => {
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: dont leak error details
    console.error("Error", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", { title: "Something went wrong.", msg: err.message });
  }
  // Programming/unknown error
  console.error("Error", err);
  return res.status(500).render("error", { title: "Something went wrong.", msg: "Please try again later." });
};

const ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  // Dev error - Prod error
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name };
    error.message = err.message;

    if (error.name === "JsonWebTokenError") error = JWTError(error);
    if (error.name === "TokenExpiredError") error = JWTExpiredError(error);
    if (error.code === "P2002") error = duplicateKeyError(error);
    if (error.status === "429") error = limitError(error);

    sendProdError(error, req, res);
  }
};

export default ErrorHandler;
