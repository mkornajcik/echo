import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import AppError from "../utils/appError";
import { catchAsync } from "../utils/catchAsync";
import { CustomRequest } from "../types/customRequest";
import { createNotification } from "../utils/notifications";
import { NotificationType } from "@prisma/client";

// Create or find existing conversation - POST /api/messages/start-conversation/:targetUserId
export const startConversation = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const targetUserId = Number(req.params.targetUserId);

  if (!userId) {
    return res.status(400).json({ status: "error", message: "Authentication required" });
  }

  if (!targetUserId) {
    return res.status(400).json({ status: "error", message: "Invalid 'targetUserId'" });
  }

  if (userId === targetUserId) {
    return res.status(400).json({ status: "error", message: "You cannot message yourself" });
  }

  // Find conversation with both participants
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: targetUserId } } },
        { participants: { every: { userId: { in: [userId, targetUserId] } } } },
      ],
    },
    include: {
      participants: { select: { user: { select: { username: true, usertag: true } } } },
    },
  });

  if (existingConversation) {
    return res.status(200).json({
      status: "success",
      message: "Conversation found",
      data: { conversation: existingConversation },
    });
  }

  // Create conversation with both participants
  const newConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: {
      participants: { select: { user: { select: { username: true, usertag: true } } } },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Conversation created",
    data: { conversation: newConversation },
  });
});

// Get conversation - GET /api/messages/:conversationId
export const getConversation = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const conversationId = Number(req.params.conversationId);

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  if (!conversationId) {
    return res.status(401).json({ status: "error", message: "Invalid 'conversationId'" });
  }

  const activeConversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
              usertag: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { content: true, image: true, sender: { select: { username: true, usertag: true } } },
      },
    },
  });

  if (!activeConversation) {
    return res.status(404).json({ status: "error", message: "Conversation not found" });
  }

  // Check if user is a participant
  const isParticipant = activeConversation.participants.some((p) => p.user.id === userId);
  if (!isParticipant) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }

  res.status(200).json({ status: "success", data: { conversation: activeConversation } });
});

// Send message - POST /api/messages/:conversationId
export const sendMessage = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const conversationId = Number(req.params.conversationId);
  const { content } = req.body;

  if (!userId) {
    return res.status(400).json({ status: "error", message: "Authentication required" });
  }

  if (!conversationId) {
    return res.status(400).json({ status: "error", message: "Invalid 'conversationId'" });
  }
  // Validate input
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ status: "error", message: "'content' cannot be empty" });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        select: { userId: true },
      },
    },
  });

  // Check if conversation exists and user is a participant
  if (!conversation) {
    return res.status(400).json({ status: "error", message: "Conversation not found" });
  }

  if (!conversation.participants.some((p) => p.userId === userId)) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      senderId: userId,
      conversationId: conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
  });

  const other = await prisma.participant.findFirst({
    where: {
      conversationId,
      userId: { not: userId },
    },
    select: { userId: true },
  });

  if (other) {
    await createNotification({
      recipientId: other.userId,
      senderId: userId,
      type: NotificationType.MESSAGE,
      conversationId: conversationId,
    });
  }

  // Get socketio
  const io = req.app.get("socketio");

  // Emit message to all participants
  io.to(`conversation_${conversationId}`).emit("newMessage", {
    conversationId: conversationId,
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      sender: message.sender,
    },
  });

  // Update updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Update unread count
  await prisma.participant.updateMany({
    where: {
      conversationId,
      userId: { not: userId },
    },
    data: {
      unreadCount: { increment: 1 },
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      message: {
        content: message.content,
      },
    },
  });
});

export const markMessagesAsRead = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = Number(req.user?.id);
  const conversationId = Number(req.params.conversationId);

  if (!userId || !conversationId) {
    return next(new AppError("Invalid request parameters", 400, true));
  }

  // Find the messages to be marked as read
  const messagesToMarkAsRead = await prisma.message.findMany({
    where: {
      conversationId: conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    select: {
      id: true,
    },
  });

  const updateNotification = await prisma.notification.updateMany({
    where: {
      conversationId: conversationId,
      recipientId: userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  const messageIdsToMarkAsRead = messagesToMarkAsRead.map((message) => message.id);

  if (messageIdsToMarkAsRead.length > 0) {
    // Update the messages
    await prisma.message.updateMany({
      where: {
        id: { in: messageIdsToMarkAsRead },
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  // Reset unread count for the recipient
  await prisma.participant.updateMany({
    where: {
      conversationId: conversationId,
      userId: userId,
    },
    data: {
      unreadCount: 0,
    },
  });

  // Get socketio instance
  const io = req.app.get("socketio");

  io.to(`conversation_${conversationId}`).emit("messagesRead", {
    conversationId,
    messageIds: messageIdsToMarkAsRead,
    readerId: userId,
  });

  res.status(200).json({
    status: "success",
    message: "Messages marked as read",
    readMessageIds: messageIdsToMarkAsRead,
  });
});
