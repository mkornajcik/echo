import { NextFunction, Request, Response } from "express";
import prisma from "../prismaClient";
import { CustomRequest } from "../types/customRequest";
import { catchAsync } from "../utils/catchAsync";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Utility to validate and parse pagination params
function parsePaginationParams(rawLimit: any, rawPage: any, res: Response): { limit: number; page: number } | null {
  if (rawLimit !== undefined && rawLimit !== null && isNaN(Number(rawLimit))) {
    res.status(400).json({ status: "error", message: "'limit' must be a valid number" });
    return null;
  }
  if (rawPage !== undefined && rawPage !== null && isNaN(Number(rawPage))) {
    res.status(400).json({ status: "error", message: "'page' must be a valid number" });
    return null;
  }

  let limit = parseInt(rawLimit as string, 10) || DEFAULT_LIMIT;
  let page = parseInt(rawPage as string, 10) || 1;

  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (page < 1) page = 1;

  return { limit, page };
}

// Get posts on the home page - GET /api/feed/
export const getHome = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const pagination = parsePaginationParams(req.query.limit, req.query.page, res);
  if (!pagination) return;

  const { limit, page } = pagination;
  const skip = (page - 1) * limit;

  // Fetch posts and total count
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      take: limit,
      skip,
      orderBy: { id: "desc" },
      select: {
        text: true,
        image: true,
        user: { select: { username: true, usertag: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    }),
    prisma.post.count(),
  ]);

  // Build pagination
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    status: "success",
    meta: {
      total,
      totalPages,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    },
    data: { posts },
  });
});

// Get posts on the home page from following - GET /api/feed/following/
export const getHomeFollowing = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const currentUserId = (req as any).user?.id;

  if (!currentUserId) {
    return res.status(400).json({ status: "error", message: "Authentication required" });
  }

  const pagination = parsePaginationParams(req.query.limit, req.query.page, res);
  if (!pagination) return;

  const { limit, page } = pagination;
  const skip = (page - 1) * limit;

  // Fetch posts and total count
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      take: limit,
      skip,
      where: {
        user: {
          followers: {
            some: {
              followerId: currentUserId,
            },
          },
        },
      },
      select: {
        text: true,
        image: true,
        user: { select: { username: true, usertag: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
      orderBy: { id: "desc" },
    }),
    prisma.post.count({
      where: {
        user: {
          followers: {
            some: { followerId: currentUserId },
          },
        },
      },
    }),
  ]);

  // Build pagination
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    status: "success",
    meta: {
      total,
      totalPages,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
    },
    data: { posts },
  });
});
