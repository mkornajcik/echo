import { Router } from "express";
import { protect } from "../controllers/authController";
import * as userController from "../controllers/userController";
import { limiter } from "../middlewares/rateLimit";

const router = Router();

// User profiles & follows (protected)
router.use(protect);

// Get profile
router.get("/:id", userController.getProfile);

// Update profile
router.post("/update", limiter, userController.updateProfile);

// Get profile posts
router.get("/:id/posts", userController.getProfilePosts);

// Get profile comments
router.get("/:id/comments", userController.getProfileComments);

// Get profile likes
router.get("/:id/likes", userController.getProfileLikes);

// Get profile reposts
router.get("/:id/reposts", userController.getProfileReposts);

// Get profile followers
router.get("/:id/followers", userController.getFollowers);

// Get profile following
router.get("/:id/following", userController.getFollowing);

// Follow profile
router.post("/:id/follow", userController.followUser);

// Unfollow profile
router.delete("/:id/unfollow", userController.unfollowUser);

export default router;
