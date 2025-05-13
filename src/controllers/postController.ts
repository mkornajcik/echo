import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";
import { createNotification } from "../utils/notifications";
import { NotificationType } from "@prisma/client";

// One post - GET /api/posts/:id
export const getPost = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      _count: { select: { likes: true, reposts: true } },
      user: { select: { username: true, usertag: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        select: { text: true, user: { select: { username: true, usertag: true } } },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  res.status(200).json({ status: "success", data: { post } });
});

// Create post - POST /api/posts
export const createPost = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const text = req.body.text?.trim();

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }
  if (!text) {
    return res.status(400).json({ status: "error", message: "`text` is required" });
  }
  if (text.length > 280) {
    return res.status(400).json({ status: "error", message: "`text` must not exceed 280 characters" });
  }

  const post = await prisma.post.create({ data: { text, userId } });

  res.status(201).json({ status: "success", data: { post } });
});

// Delete post - DELETE /api/posts/:id
export const deletePost = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const deleteResult = await prisma.post.deleteMany({ where: { id: postId, userId } });
  if (deleteResult.count === 0) {
    const exists = await prisma.post.findUnique({ where: { id: postId } });
    if (!exists) {
      return res.status(404).json({ status: "error", message: "Post not found" });
    }
    return res.status(403).json({ status: "error", message: "Forbidden: cannot delete another user's post" });
  }

  // No content on successful delete
  res.status(204).send();
});

// Like/unlike post - POST /api/posts/:id/like
export const togglePostLike = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = Number(req.user?.id);

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { userId, postId } });
    if (post.userId !== userId) {
      await createNotification({
        recipientId: post.userId,
        senderId: userId,
        type: NotificationType.LIKE_POST,
        postId,
      });
    }
  }

  const updated = await prisma.post.findUnique({
    where: { id: postId },
    include: { _count: { select: { likes: true } } },
  });

  res.status(200).json({
    status: "success",
    data: {
      liked: !existing,
      count: updated?._count.likes ?? 0,
    },
  });
});

// Repost/unrepost post - POST /api/posts/:id/repost
export const togglePostRepost = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const postId = Number(req.params.id);
  const userId = Number(req.user?.id);

  if (!userId) {
    return res.status(401).json({ status: "error", message: "Authentication required" });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ status: "error", message: "Post not found" });
  }

  const existing = await prisma.postRepost.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.postRepost.delete({ where: { id: existing.id } });
  } else {
    await prisma.postRepost.create({ data: { userId, postId } });
    if (post.userId !== userId) {
      await createNotification({
        recipientId: post.userId,
        senderId: userId,
        type: NotificationType.REPOST_POST,
        postId,
      });
    }
  }

  const updated = await prisma.post.findUnique({
    where: { id: postId },
    include: { _count: { select: { reposts: true } } },
  });

  res.status(200).json({
    status: "success",
    data: {
      reposted: !existing,
      count: updated?._count.reposts ?? 0,
    },
  });
});
