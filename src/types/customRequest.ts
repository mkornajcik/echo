import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface CustomRequest extends Request {
  userId?: number;
  token?: string | JwtPayload;
  user?: JwtPayload & {
    id: number;
    username: string;
    usertag: string;
  };
}
