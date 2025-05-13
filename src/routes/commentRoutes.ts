import { Router } from "express";
import { protect } from "../controllers/authController";
import * as commentController from "../controllers/commentController";
import { limiter } from "../middlewares/rateLimit";

const router = Router();

// All comment actions require authentication
router.use(protect);

// Get all comments on a post
router.get("/:commentId", commentController.getOneComment);

// Get all comments on a post
router.get("/posts/:id/", commentController.getComments);

// Create a comment on a post
router.post("/posts/:id", limiter, commentController.createComment);

// Delete a comment
router.delete("/posts/:id/comment/:commentId", commentController.deleteComment);

// Like/unlike a comment
router.post("/posts/:postId/comment/:commentId/like", commentController.toggleCommentLike);

export default router;
