import { JwtPayload } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  id: number;
  username: string;
  usertag: string;
}
