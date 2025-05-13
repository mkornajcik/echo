import { Router } from "express";
import { protect, isLoggedIn } from "../controllers/authController";
import { getRegisterForm, getLoginForm } from "../controllers/viewController";
import * as viewsController from "../controllers/viewController";
import { addSuggestions } from "../middlewares/suggestions";
import { addLatestFromFollowing } from "../middlewares/latest";

const router = Router();

// Welcome page
router.get("/", isLoggedIn, viewsController.getWelcome);

// About and Terms pages
router.get("/about", viewsController.getAbout);
router.get("/terms", viewsController.getTerms);

// Register and Login pages
router.get("/register", isLoggedIn, getRegisterForm);
router.get("/login", isLoggedIn, getLoginForm);

// Protect the routes
router.use(protect);

// Use middlewares
router.use(addSuggestions);
router.use(addLatestFromFollowing);

// Get one post
router.get("/posts/:id", viewsController.getPost);

// Feed pages
router.get("/feed", viewsController.getHome);
router.get("/feed/following", viewsController.getHomeFollowing);
router.get("/feed/more", viewsController.getMorePosts);

// Notifications
router.get("/notifications", viewsController.getNotifications);

// Messages
router.get("/messages", viewsController.getMessages);
router.get("/messages/:conversationId", viewsController.getConversation);
router.post("/messages/start-conversation", viewsController.startConversation);

// Search
router.get("/search", viewsController.search);

// Profile
router.get("/profile/:id", viewsController.getProfile);
router.get("/profile/:id/comments", viewsController.getProfileComments);
router.get("/profile/:id/likes", viewsController.getProfileLikes);
router.get("/profile/:id/reposts", viewsController.getProfileReposts);
router.get("/profile/:id/followers", viewsController.getProfileFollowers);
router.get("/profile/:id/following", viewsController.getProfileFollowing);
router.get("/profile/:userId/more", viewsController.getMoreProfilePosts);
router.get("/profile/:userId/comments/more", viewsController.getMoreProfileComments);
router.get("/profile/:userId/reposts/more", viewsController.getMoreProfileReposts);
router.get("/profile/:userId/likes/more", viewsController.getMoreProfileLikes);
export default router;
