import prisma from "../prismaClient";
import type { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";
import type { Response, NextFunction } from "express";
import AppError from "../utils/appError";

// Get unread notifications count - GET /api/notifications/unread-count/
export const getUnreadCount = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const unreadCount = await prisma.notification.count({
    where: {
      recipientId: userId,
      read: false,
    },
  });

  res.status(200).json({ status: "success", unreadCount });
});

// Get unread message notifications count - GET /api/notifications/message/unread-count/
export const getMessageUnreadCount = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const unreadMessageCount = await prisma.notification.count({
    where: {
      recipientId: userId,
      type: "MESSAGE",
      read: false,
    },
  });

  res.status(200).json({ status: "success", unreadMessageCount });
});

// Get all notifications - GET /api/notifications/
export const getNotifications = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    where: { recipientId: userId },
    select: {
      createdAt: true,
      type: true,
      read: true,
      sender: { select: { username: true, usertag: true } },
      comment: { select: { text: true } },
    },
  });

  res.status(200).json({ status: "success", notifications });
});

// Get all unread notifications - GET /api/notifications/unread
export const getUnreadNotifications = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    where: { recipientId: userId, read: false },
    select: { createdAt: true, type: true, read: true, sender: { select: { username: true, usertag: true } } },
  });

  res.status(200).json({ status: "success", notifications });
});

// Mark all notifications as read - PATCH /api/notifications/read-all/
export const markAllNotificationsRead = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(new AppError("User not found", 401, true));

  await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  res.status(200).json({ status: "success", message: "All notifications marked as read" });
});
