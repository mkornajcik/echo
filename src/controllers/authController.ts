import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import AppError from "../utils/appError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { CustomRequest } from "../types/customRequest";
import { AuthTokenPayload } from "../types/authTokenPayload";

import { catchAsync } from "../utils/catchAsync";

// Sign JWT token in
const signToken = (id: number) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined.");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

// Create and send JWT token
const createToken = (user: User, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  if (!process.env.JWT_COOKIE_EXPIRES_IN) {
    throw new Error("JWT_COOKIE_EXPIRES_IN not defined.");
  }
  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).json({ status: "success" });
};

// Register
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: req.body.email }, { username: req.body.username }, { usertag: req.body.usertag }],
    },
  });

  if (existingUser?.email === req.body.email) return next(new AppError("Email already in use", 400, true));
  if (existingUser?.username === req.body.username) return next(new AppError("Username already in use", 400, true));
  if (existingUser?.usertag === req.body.usertag) return next(new AppError("Usertag already in use", 400, true));

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
      usertag: req.body.usertag,
    },
  });
  createToken(newUser, 201, res);
});

// Login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Provide valid username and password", 400, true));
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return next(new AppError("Incorrect username or password", 401, true));
  }

  // Check password validity
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return next(new AppError("Incorrect username or password", 401, true));
  }

  // Create and send JWT token
  createToken(user, 200, res);
});

// Logout
export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

// Protect routes
export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  //Get the token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in.", 401, true));
  }

  //Validate the token
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined.");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthTokenPayload;

  //Check if the user exists
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401, true));
  }

  if (currentUser.passwordChangedAt && decoded.iat) {
    const changedTimestamp = Math.floor(currentUser.passwordChangedAt.getTime() / 1000);
    if (changedTimestamp > decoded.iat) {
      return next(new AppError("Password changed recently. Log in again.", 401, true));
    }
  }

  //Allow access to the protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Restrict for logged in users
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  // Initializer user as null to avoid errors
  res.locals.user = null;

  if (req.cookies.jwt) {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined.");
      }

      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET) as AuthTokenPayload;

      //Check if the user exists
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          usertag: true,
        },
      });

      if (!currentUser) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      res.clearCookie("jwt");
      return next();
    }
  }

  next();
};
