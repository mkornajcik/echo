"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMessageImage = exports.uploadCover = exports.uploadAvatar = exports.createPost = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const processImage_1 = require("../utils/processImage");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const s3_1 = __importDefault(require("../s3"));
const notifications_1 = require("../utils/notifications");
const client_1 = require("@prisma/client");
const appError_1 = __importDefault(require("../utils/appError"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { text } = req.body;
        const imageFile = req.file;
        if (!text && !imageFile) {
            return res.status(400).json({
                status: "error",
                message: "Post must contain text or an image",
            });
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(400).json({
                status: "error",
                message: "Must be logged in.",
            });
        }
        let imageUrl = null;
        if (imageFile) {
            const processedImage = yield (0, processImage_1.processImage)({
                buffer: imageFile.buffer,
                width: 500,
                quality: 80,
            });
            const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
            const fileKey = `uploads/${Date.now()}-${sanitizedFilename}`;
            yield s3_1.default.send(new client_s3_1.PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
                Body: processedImage,
                ContentType: "image/jpeg",
            }));
            imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        }
        const post = yield prismaClient_1.default.post.create({
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
    }
    catch (error) {
        console.error("Post creation error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to create post",
        });
    }
});
exports.createPost = createPost;
const uploadAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const imageFile = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const processedImage = yield (0, processImage_1.processAvatar)({
            buffer: imageFile.buffer,
            width: 200,
            height: 200,
            quality: 90,
        });
        const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
        const fileKey = `avatars/${Date.now()}-${sanitizedFilename}`;
        yield s3_1.default.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: processedImage,
            ContentType: "image/jpeg",
        }));
        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        const user = yield prismaClient_1.default.user.update({
            where: { id: userId },
            data: { image: imageUrl },
        });
        res.status(201).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to upload avatar",
        });
    }
});
exports.uploadAvatar = uploadAvatar;
const uploadCover = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const imageFile = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const processedImage = yield (0, processImage_1.processCover)({
            buffer: imageFile.buffer,
            width: 600,
            height: 200,
            quality: 80,
        });
        const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
        const fileKey = `covers/${Date.now()}-${sanitizedFilename}`;
        yield s3_1.default.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: processedImage,
            ContentType: "image/jpeg",
        }));
        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        const user = yield prismaClient_1.default.user.update({
            where: { id: userId },
            data: { coverImage: imageUrl },
        });
        res.status(201).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        console.error("Error uploading cover:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to upload cover",
        });
    }
});
exports.uploadCover = uploadCover;
const uploadMessageImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const imageFile = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const conversationId = Number(req.params.conversationId);
        if (!conversationId) {
            return next(new appError_1.default("No conversation ID found", 404, true));
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
        const processedImage = yield (0, processImage_1.processMessage)({
            buffer: imageFile.buffer,
            width: 500,
            height: 500,
            quality: 90,
        });
        const sanitizedFilename = imageFile.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
        const fileKey = `messages/${Date.now()}-${sanitizedFilename}`;
        yield s3_1.default.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: processedImage,
            ContentType: "image/jpeg",
        }));
        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
        const message = yield prismaClient_1.default.message.create({
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
        const other = yield prismaClient_1.default.participant.findFirst({
            where: {
                conversationId,
                userId: { not: userId },
            },
            select: { userId: true },
        });
        if (other) {
            yield (0, notifications_1.createNotification)({
                recipientId: other.userId,
                senderId: userId,
                type: client_1.NotificationType.MESSAGE,
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
        yield prismaClient_1.default.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        yield prismaClient_1.default.participant.updateMany({
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
    }
    catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to upload image",
        });
    }
});
exports.uploadMessageImage = uploadMessageImage;
