import { PutObjectCommand } from "@aws-sdk/client-s3";
import { CustomRequest } from "../types/customRequest";
import { processImage, processAvatar, processCover, processMessage } from "../utils/processImage";
import prisma from "../prismaClient";
import s3Client from "../s3";
import { createNotification } from "../utils/notifications";
import { NotificationType } from "@prisma/client";
import AppError from "../utils/appError";
import { Response, NextFunction } from "express";

export const createPost = async (req: CustomRequest, res: Response) => {
  try {
    const { text } = req.body;
    const imageFile = req.file;

    if (!text && !imageFile) {
      return res.status(400).json({
        status: "error",
        message: "Post must contain text or an image",
      });
    }

    if (!req.user?.id) {
      return res.status(400).json({
        status: "error",
        message: "Must be logged in.",
      });
    }

    let imageUrl = null;
    if (imageFile) {
      const processedImage = await processImage({
        buffer: imageFile.buffer,
        width: 500,
        quality: 80,
      });
      const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
      const fileKey = `uploads/${Date.now()}-${sanitizedFilename}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: fileKey,
          Body: processedImage,
          ContentType: "image/jpeg",
        })
      );

      imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    }

    const post = await prisma.post.create({
      data: {
        text: text,
        image: imageUrl,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      status: "success",
      data: { post },
    });
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create post",
    });
  }
};

export const uploadAvatar = async (req: CustomRequest, res: Response) => {
  try {
    const imageFile = req.file;
    const userId = req.user?.id;

    if (!imageFile) {
      return res.status(400).json({
        status: "error",
        message: "Must contain an image.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Must be logged in.",
      });
    }

    const processedImage = await processAvatar({
      buffer: imageFile.buffer,
      width: 200,
      height: 200,
      quality: 90,
    });
    const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
    const fileKey = `avatars/${Date.now()}-${sanitizedFilename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileKey,
        Body: processedImage,
        ContentType: "image/jpeg",
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload avatar",
    });
  }
};

export const uploadCover = async (req: CustomRequest, res: Response) => {
  try {
    const imageFile = req.file;
    const userId = req.user?.id;

    if (!imageFile) {
      return res.status(400).json({
        status: "error",
        message: "Must contain an image.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Must be logged in.",
      });
    }

    const processedImage = await processCover({
      buffer: imageFile.buffer,
      width: 600,
      height: 200,
      quality: 80,
    });
    const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
    const fileKey = `covers/${Date.now()}-${sanitizedFilename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileKey,
        Body: processedImage,
        ContentType: "image/jpeg",
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverImage: imageUrl },
    });

    res.status(201).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error uploading cover:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload cover",
    });
  }
};

export const uploadMessageImage = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const imageFile = req.file;
    const userId = req.user?.id;
    const conversationId = Number(req.params.conversationId);

    if (!conversationId) {
      return next(new AppError("No conversation ID found", 404, true));
    }

    if (!imageFile) {
      return res.status(400).json({
        status: "error",
        message: "Must contain an image.",
      });
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Must be logged in.",
      });
    }

    const processedImage = await processMessage({
      buffer: imageFile.buffer,
      width: 500,
      height: 500,
      quality: 90,
    });
    const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
    const fileKey = `messages/${Date.now()}-${sanitizedFilename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileKey,
        Body: processedImage,
        ContentType: "image/jpeg",
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    const message = await prisma.message.create({
      data: {
        image: imageUrl,
        senderId: userId,
        conversationId: conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    const other = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: userId },
      },
      select: { userId: true },
    });

    if (other) {
      await createNotification({
        recipientId: other.userId,
        senderId: userId,
        type: NotificationType.MESSAGE,
        conversationId: conversationId,
      });
    }

    const io = req.app.get("socketio");
    io.to(`conversation_${conversationId}`).emit("newMessage", {
      conversationId: conversationId,
      message: {
        id: message.id,
        image: message.image,
        createdAt: message.createdAt,
        senderId: message.senderId,
        sender: message.sender,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    await prisma.participant.updateMany({
      where: {
        conversationId,
        userId: { not: userId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    res.status(201).json({
      status: "success",
      data: { message },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload image",
    });
  }
};
