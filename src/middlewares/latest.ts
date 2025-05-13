import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import { CustomRequest } from "../types/customRequest";
import { LatestFromUser } from "../types/latestFromUser";

type ResponseWithLatest = Response & {
  locals: {
    latestFromUser?: LatestFromUser[];
  };
};

// Get the latest post from people that the user is following
export const addLatestFromFollowing = async (req: Request, res: ResponseWithLatest, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    const currentUserId = customReq.user?.id;

    if (!currentUserId) {
      res.locals.latestFromUser = [];
      return next();
    }

    const latestPosts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: currentUserId,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            usertag: true,
          },
        },
      },
      take: 1,
      distinct: ["userId"],
    });

    // Map to LatestFromUser type
    const latestFromUser = latestPosts.map((post) => ({
      id: post.user.id,
      username: post.user.username,
      usertag: post.user.usertag,
      postId: post.id,
      postText: post.text,
      postCreatedAt: post.createdAt,
    }));

    res.locals.latestFromUser = latestFromUser;
  } catch (error) {
    console.error("Error fetching latest from followed users:", error);
    res.locals.latestFromUser = [];
  }
  next();
};
