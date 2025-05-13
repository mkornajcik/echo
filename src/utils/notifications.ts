import prisma from "../prismaClient";
import { NotificationType } from "@prisma/client";
import AppError from "./appError";

interface CreateNotificationArgs {
  recipientId: number;
  senderId: number;
  type: NotificationType;
  postId?: number;
  commentId?: number;
  conversationId?: number;
}

export async function createNotification(args: CreateNotificationArgs): Promise<void> {
  if (args.recipientId === args.senderId) {
    return;
  }

  try {
    await prisma.notification.create({
      data: {
        recipientId: args.recipientId,
        senderId: args.senderId,
        type: args.type,
        postId: args.postId,
        commentId: args.commentId,
        conversationId: args.conversationId,
        read: false,
      },
    });
  } catch (error) {
    new AppError("Notification fail", 400, true);
  }
}
