import express, { NextFunction, Request, Response } from "express";
import path from "path";
import indexRoutes from "./routes/indexRoutes";
import cookieParser from "cookie-parser";
import AppError from "./utils/appError";
import cors from "cors";
import compression from "compression";
import errorHandler from "./middlewares/errorMiddleware";
import formatTime from "./middlewares/formatTime";
import helmet from "helmet";
import crypto from "crypto";
import hpp from "hpp";
import morgan from "morgan";

// Start express app
const app = express();

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(formatTime);

// Helmet
// generate a per-request nonce and configure CSP
app.use((req: Request, res: Response, next: NextFunction) => {
  // create a base64 nonce
  const nonce = crypto.randomBytes(16).toString("base64");
  // make it available to templates
  res.locals.nonce = nonce;

  // mount helmet.contentSecurityPolicy with the dynamic nonce
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdn.socket.io", `'nonce-${nonce}'`],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
      "img-src": [
        "'self'",
        "data:",
        "https://echouploadsbucket.s3.eu-north-1.amazonaws.com",
        "https://echo-uploads-marko.s3.eu-north-1.amazonaws.com",
      ],
    },
  })(req, res, next);
});

// Use HPP to prevent parameter pollution
app.use(hpp());

// Body parser to read into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

// Compression
app.use(compression());

// Morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Allow CORS
app.use(cors());
app.options("*", cors());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot locate ${req.originalUrl} on this server!`, 404, true));
});

// Error handling middleware
app.use(errorHandler);

export default app;
