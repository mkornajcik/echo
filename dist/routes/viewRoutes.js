"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const viewController_1 = require("../controllers/viewController");
const viewsController = __importStar(require("../controllers/viewController"));
const suggestions_1 = require("../middlewares/suggestions");
const latest_1 = require("../middlewares/latest");
const router = (0, express_1.Router)();
router.get("/", authController_1.isLoggedIn, viewsController.getWelcome);
router.get("/about", viewsController.getAbout);
router.get("/terms", viewsController.getTerms);
router.get("/register", authController_1.isLoggedIn, viewController_1.getRegisterForm);
router.get("/login", authController_1.isLoggedIn, viewController_1.getLoginForm);
router.use(authController_1.protect);
router.use(suggestions_1.addSuggestions);
router.use(latest_1.addLatestFromFollowing);
router.get("/posts/:id", viewsController.getPost);
router.get("/feed", viewsController.getHome);
router.get("/feed/following", viewsController.getHomeFollowing);
router.get("/feed/more", viewsController.getMorePosts);
router.get("/notifications", viewsController.getNotifications);
router.get("/messages", viewsController.getMessages);
router.get("/messages/:conversationId", viewsController.getConversation);
router.post("/messages/start-conversation", viewsController.startConversation);
router.get("/search", viewsController.search);
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
exports.default = router;
