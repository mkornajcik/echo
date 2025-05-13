import { Router } from "express";
import { protect } from "../controllers/authController";
import * as feedController from "../controllers/feedController";

const router = Router();

// Protect the routes
router.use(protect);

// Get feed
router.get("/", feedController.getHome);

// Get feed from following
router.get("/following", feedController.getHomeFollowing);

export default router;
