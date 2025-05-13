import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests.",
});
