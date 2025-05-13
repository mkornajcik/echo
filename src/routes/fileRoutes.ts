import { limiter } from "../middlewares/rateLimit";
import { protect } from "../controllers/authController";
import upload from "../multer";
import express from "express";
import * as fileController from "../controllers/fileController";

const router = express.Router();

router.use(protect);

// Post images
router.post("/post", limiter, upload.single("image"), fileController.createPost);

// Profile images
router.post("/profile/avatar", limiter, upload.single("image"), fileController.uploadAvatar);
router.post("/profile/cover", limiter, upload.single("image"), fileController.uploadCover);

// Message images
router.post("/:conversationId/message", limiter, upload.single("image"), fileController.uploadMessageImage);

export default router;
