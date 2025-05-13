import { Router } from "express";
import { protect } from "../controllers/authController";
import * as searchController from "../controllers/searchController";
import { limiter } from "../middlewares/rateLimit";

const router = Router();

// Search (protected)
router.get("/", limiter, protect, searchController.search);

export default router;
