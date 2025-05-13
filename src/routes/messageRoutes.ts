import { Router } from "express";
import { protect } from "../controllers/authController";
import * as messageController from "../controllers/messageController";

const router = Router();

// Messaging
router.use(protect);

router.post("/start-conversation/:targetUserId", messageController.startConversation);
router.get("/:conversationId", messageController.getConversation);

router.post("/:conversationId", messageController.sendMessage);
router.patch("/:conversationId/read", messageController.markMessagesAsRead);

export default router;
