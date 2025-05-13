import type { NextFunction, Response } from "express";
import AppError from "../utils/appError";
import prisma from "../prismaClient";
import type { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";
import { createNotification } from "../utils/notifications";
import { NotificationType } from "@prisma/client";

// Get the profile page - GET /api/profile/:id
export const getProfile = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const profileUser = await prisma.user.findUnique({
    where: { id: profileUserId },
    select: {
      createdAt: true,
      username: true,
      usertag: true,
      coverImage: true,
      image: true,
      bio: true,
      location: true,
      website: true,

      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!profileUser) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  res.status(200).json({ status: "success", user: profileUser });
});

// Get the profile page posts - GET /api/profile/:id/posts
export const getProfilePosts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const posts = await prisma.post.findMany({
    where: { userId: profileUserId },
    select: { createdAt: true, text: true, image: true, user: { select: { username: true, usertag: true } } },
  });

  if (!posts) {
    return res.status(404).json({ status: "error", message: "No posts found" });
  }

  return res.status(200).json({ status: "success", posts });
});

// Get the profile comments page - GET /api/profile/:id/comments
export const getProfileComments = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    select: { username: true, usertag: true, comments: { select: { createdAt: true, text: true, postId: true } } },
  });

  if (!user) {
    return res.status(404).json({ status: "error", message: "No user found" });
  }

  res.status(200).json({ status: "success", user });
});

// Get the profile likes page - GET /api/profile/:id/likes
export const getProfileLikes = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    select: {
      username: true,
      usertag: true,
      postLikes: { select: { postId: true, createdAt: true, post: { select: { text: true } } } },
      commentLikes: { select: { commentId: true, createdAt: true, comment: { select: { text: true } } } },
    },
  });

  if (!user) {
    return res.status(404).json({ status: "error", message: "No user found" });
  }

  res.status(200).json({ status: "success", user });
});

// Get the profile reposts page - GET /api/profile/:id/reposts
export const getProfileReposts = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    select: {
      username: true,
      usertag: true,
      postReposts: { select: { postId: true, createdAt: true, post: { select: { text: true } } } },
      commentReposts: { select: { commentId: true, createdAt: true, comment: { select: { text: true } } } },
    },
  });

  if (!user) {
    return res.status(404).json({ status: "error", message: "No user found" });
  }

  res.status(200).json({ status: "success", user });
});

// Get the followers page - GET /api/profile/:id/followers
export const getFollowers = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    select: {
      username: true,
      usertag: true,
      followers: { select: { follower: { select: { username: true, usertag: true } } } },
    },
  });

  if (!user) {
    return res.status(404).json({ status: "error", message: "No user found" });
  }

  res.status(200).json({ status: "success", user });
});

// Get the following page - GET /api/profile/:id/following
export const getFollowing = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const profileUserId = Number(req.params.id);
  const currentUserId = req.user?.id;

  if (!profileUserId) {
    return res.status(400).json({ status: "error", message: "Invalid profile ID" });
  }

  if (!currentUserId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(profileUserId) },
    select: {
      username: true,
      usertag: true,
      following: { select: { following: { select: { username: true, usertag: true } } } },
    },
  });

  if (!user) {
    return res.status(404).json({ status: "error", message: "No user found" });
  }

  res.status(200).json({ status: "success", user });
});

// Update user profile - POST /api/profile/update
export const updateProfile = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  const { username, bio, location, website } = req.body;

  if (!userId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  // Validate website URL
  if (website) {
    try {
      const parsedUrl = new URL(website);
      // enforce http(s) protocols only
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch (err) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid website URL. Format should be as follows: 'https://example.com/'" });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        bio,
        location,
        website,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
    });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("username")) {
      return res.status(409).json({ status: "error", message: "Username is already taken" });
    }
    return res.status(400).json({ status: "error", message: "Error updating profile" });
  }
});

// Follow user - POST /api/profile/:id/follow
export const followUser = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const followerId = req.user?.id;
  const followingId = Number(req.params.id);

  if (!followerId) {
    return res.status(404).json({ status: "error", message: "Couldn't find user" });
  }

  if (followerId === followingId) {
    return res.status(400).json({ status: "error", message: "You cannot follow yourself" });
  }

  // Check if the user is already following the target user
  const existingFollow = await prisma.follow.findFirst({
    where: { followerId, followingId },
  });

  if (existingFollow) {
    return res.status(400).json({
      status: "error",
      message: "Already following this user, use the 'unfollow' route if you wish to unfollow this profile",
    });
  }

  try {
    await prisma.follow.create({
      data: {
        follower: { connect: { id: followerId } },
        following: { connect: { id: followingId } },
      },
    });

    await createNotification({
      recipientId: followingId,
      senderId: followerId,
      type: NotificationType.NEW_FOLLOWER,
    });

    return res.status(200).json({ status: "success", message: "Followed successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "An error occurred while following" });
  }
});

// Unfollow user POST /api/profile/:id/unfollow
export const unfollowUser = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const followerId = req.user?.id;
  const followingId = Number(req.params.id);

  if (!followerId) {
    return res.status(404).json({ status: "error", message: "Couldn't find user" });
  }

  if (followerId === followingId) {
    return res.status(400).json({ status: "error", message: "You cannot unfollow yourself" });
  }

  // Check if the follow relationship exists
  const existingFollow = await prisma.follow.findFirst({
    where: { followerId, followingId },
  });
  if (!existingFollow) {
    return res.status(400).json({ status: "error", message: "You are not following this user" });
  }

  try {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    return res.status(200).json({ status: "success", message: "Unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "An error occurred while unfollowing" });
  }
});
