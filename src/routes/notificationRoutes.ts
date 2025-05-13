import { Router } from "express";
import { protect } from "../controllers/authController";
import * as notificationController from "../controllers/notificationController";

const router = Router();

// Notifications
router.use(protect);

router.get("/", notificationController.getNotifications);
router.get("/unread", notificationController.getUnreadNotifications);
router.patch("/read-all", notificationController.markAllNotificationsRead);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/message/unread-count", notificationController.getMessageUnreadCount);

export default router;
