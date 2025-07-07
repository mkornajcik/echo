import { Router } from "express";
import authRoutes from "./authRoutes";
import commentRoutes from "./commentRoutes";
import feedRoutes from "./feedRoutes";
import fileRoutes from "./fileRoutes";
import messageRoutes from "./messageRoutes";
import notificationRoutes from "./notificationRoutes";
import postRoutes from "./postRoutes";
import searchRoutes from "./searchRoutes";
import userRoutes from "./userRoutes";
import viewRoutes from "./viewRoutes";
import { alerts } from "../controllers/viewController";
import { addSuggestions } from "../middlewares/suggestions";
import { addLatestFromFollowing } from "../middlewares/latest";
import prisma from "../prismaClient";

const router = Router();

// Endpoint for pinging the DB
router.get("/health", async (req, res) => {
  try {
    await prisma.keepAlive.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", message: "Database ping failed" });
  }
});

// Use alerts
router.use(alerts);

// Auth routes
router.use("/authentication", authRoutes);

// View routes
router.use("/", viewRoutes);

// File routes
router.use("/files", fileRoutes);

// Use suggestions and lastest posts
router.use(addSuggestions);
router.use(addLatestFromFollowing);

// ********** API routes **********

// Comment routes
router.use("/api/comments", commentRoutes);

// Feed routes
router.use("/api/feed", feedRoutes);

// Message routes
router.use("/api/messages", messageRoutes);

// Notification routes
router.use("/api/notifications", notificationRoutes);

// Post routes
router.use("/api/posts", postRoutes);

// Search routes
router.use("/api/search", searchRoutes);

// User routes
router.use("/api/profile", userRoutes);

export default router;
