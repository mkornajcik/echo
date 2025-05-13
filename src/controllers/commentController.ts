import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import prisma from "../prismaClient";
import { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";
import { createNotification } from "../utils/notifications";
import { NotificationType } from "@prisma/client";

// Get one comment - GET /api/comments/:commentId
export const getOneComment = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const commentId = parseInt(req.params.commentId);

  if (!commentId) {
    return res.status(404).json({ status: "error", message: "Comment with this ID was not found" });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, text: true, createdAt: true, user: { select: { username: true, usertag: true } } },
  });

  if (!comment) {
    return res.status(404).json({ status: "error", message: "Comment not found" });
  }

  return res.status(200).json({ status: "success", data: { comment } });
});

// Get all comments on post - GET /api/comments/posts/:id
export const getComments = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  const comments = await prisma.comment.findMany({
    where: { postId: postId },
    orderBy: { createdAt: "desc" },
    select: { id: true, text: true, createdAt: true, user: { select: { username: true, usertag: true } } },
  });

  if (!comments) {
    return res.status(404).json({ status: "error", message: "No comments on this post" });
  }

  return res.status(200).json({ status: "success", data: { comments } });
});

//Create a comment - POST /api/comments/posts/:id
export const createComment = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.id);
  const { commentText } = req.body;
  const userId = req.user?.id;

  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  if (!userId) {
    return res.status(404).json({ status: "error", message: "Authentication required" });
  }

  if (!commentText) {
    return res.status(404).json({ status: "error", message: "Comment text cannot be empty" });
  }

  if (commentText.length > 280) {
    return res.status(404).json({ status: "error", message: "Comment text cannot exceed 280 characters" });
  }

  const comment = await prisma.comment.create({
    data: {
      text: commentText,
      userId,
      postId: postId,
    },
  });

  if (post.userId !== userId) {
    await createNotification({
      recipientId: post.userId,
      senderId: userId,
      type: NotificationType.REPLY,
      postId: postId,
      commentId: comment.id,
    });
  }

  // Handle mentions
  const mentionRegex = /@([^\s@]+)/g;

  const rawMentions = commentText.match(mentionRegex) || [];
  const uniqueMentions: string[] = Array.from(new Set(rawMentions.map((m: string): string => m.slice(1))));

  // Find all mentioned users
  const mentionedUsers = await prisma.user.findMany({
    where: { usertag: { in: uniqueMentions } },
    select: { id: true, usertag: true },
  });

  // Create notifications
  await Promise.all(
    mentionedUsers.map(async (user) => {
      if (user.id !== userId) {
        await createNotification({
          recipientId: user.id,
          senderId: userId,
          type: NotificationType.TAG,
          postId,
          commentId: comment.id,
        });
      }
    })
  );

  res.status(201).json({ status: "success", message: "Comment created" });
});

// Delete comment - DELETE /api/comments/posts/:id/comment/:commentId
export const deleteComment = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(404).json({ status: "error", message: "Authentication required" });
  }

  const deletedComment = await prisma.comment.deleteMany({
    where: {
      id: Number(commentId),
      userId: userId,
    },
  });

  if (deletedComment.count === 0) {
    return res.status(404).json({ status: "error", message: "Comment not found or unauthorized" });
  }

  res.status(204).send();
});

// Like comment - POST /api/comments/posts/:id/comment/:commentId/like
export const toggleCommentLike = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);
  const userId = Number(req.user!.id);

  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) {
    return res.status(404).json({ status: "error", message: "Comment not found" });
  }

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId, commentId },
    },
  });

  if (existingLike) {
    await prisma.commentLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.commentLike.create({
      data: { userId, commentId },
    });

    if (post.userId !== userId) {
      await createNotification({
        recipientId: post.userId,
        senderId: userId,
        type: NotificationType.LIKE_COMMENT,
        postId: postId,
        commentId: comment.id,
      });
    }
  }

  const updatedComment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { _count: { select: { likes: true } } },
  });

  res.status(200).json({
    status: "success",
    data: { liked: !existingLike, count: updatedComment?._count.likes },
  });
});
