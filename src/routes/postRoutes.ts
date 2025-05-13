import { Router } from "express";
import { protect } from "../controllers/authController";
import * as postController from "../controllers/postController";
import { limiter } from "../middlewares/rateLimit";

const router = Router();

// Post actions (protected)
router.use(protect);

// Create new post
router.post("/", limiter, postController.createPost);

// Get one post
router.get("/:id", postController.getPost);

// Delete post
router.delete("/:id", postController.deletePost);

// Like
router.post("/:id/like", postController.togglePostLike);

// Repost
router.post("/:id/repost", postController.togglePostRepost);

export default router;
