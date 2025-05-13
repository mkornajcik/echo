import type { NextFunction, Response } from "express";
import prisma from "../prismaClient";
import type { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";
import type { Prisma } from "@prisma/client";

export type UserSearchResult = Prisma.UserGetPayload<{
  select: {
    username: true;
    usertag: true;

    _count: {
      select: {
        followers: true;
        following: true;
      };
    };
  };
}> & { isFollowing?: boolean };

export type PostSearchResult = Prisma.PostGetPayload<{
  select: {
    text: true;
    image: true;
    user: {
      select: {
        username: true;
        usertag: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
        reposts: true;
      };
    };
  };
}>;

// Search for posts and users - GET /api/search?q=query
export const search = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { q, type = "all" } = req.query;
  const query = typeof q === "string" ? q.trim() : "";
  const userId = req.user?.id;

  if (!userId) {
    return res.status(403).json({ status: "error", message: "Authentication required" });
  }

  if (!query) {
    return res.status(404).json({ status: "error", message: "Provide a valid query" });
  }

  // Create search objects for different result types
  let users: UserSearchResult[] = [];
  let posts: PostSearchResult[] = [];

  // Search based on the requested type
  if (type === "all" || type === "users") {
    users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { usertag: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        username: true,
        usertag: true,
        bio: true,
        location: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
      take: 20,
    });
  }

  if (type === "all" || type === "posts") {
    posts = await prisma.post.findMany({
      where: {
        text: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        text: true,
        image: true,
        user: {
          select: {
            username: true,
            usertag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }

  res.status(200).json({
    status: "success",
    query,
    data: {
      users: users,
      posts: posts,
    },
  });
});
