import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import { CustomRequest } from "../types/customRequest";
import { SuggestedUser } from "../types/suggestedUser";

type ResponseWithSuggestions = Response & {
  locals: {
    suggestedUsers?: SuggestedUser[];
  };
};

// Get 3 random users and suggest them to user
export const addSuggestions = async (req: Request, res: ResponseWithSuggestions, next: NextFunction) => {
  try {
    const customReq = req as CustomRequest;
    const currentUserId = customReq.user?.id;

    const suggestedUsers = await prisma.$queryRaw<SuggestedUser[]>`
      SELECT id, username, usertag, image
      FROM "User"
      WHERE id != ${currentUserId ?? -1}
      ORDER BY RANDOM()
      LIMIT 3
    `;

    res.locals.suggestedUsers = suggestedUsers;
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.locals.suggestedUsers = [];
  }
  next();
};
