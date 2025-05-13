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
exports.markMessagesAsRead = exports.sendMessage = exports.getConversation = exports.startConversation = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = require("../utils/catchAsync");
const notifications_1 = require("../utils/notifications");
const client_1 = require("@prisma/client");
exports.startConversation = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const targetUserId = Number(req.params.targetUserId);
    if (!userId) {
        return res.status(400).json({ status: "error", message: "Authentication required" });
    }
    if (!targetUserId) {
        return res.status(400).json({ status: "error", message: "Invalid 'targetUserId'" });
    }
    if (userId === targetUserId) {
        return res.status(400).json({ status: "error", message: "You cannot message yourself" });
    }
    const existingConversation = yield prismaClient_1.default.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: targetUserId } } },
                { participants: { every: { userId: { in: [userId, targetUserId] } } } },
            ],
        },
        include: {
            participants: { select: { user: { select: { username: true, usertag: true } } } },
        },
    });
    if (existingConversation) {
        return res.status(200).json({
            status: "success",
            message: "Conversation found",
            data: { conversation: existingConversation },
        });
    }
    const newConversation = yield prismaClient_1.default.conversation.create({
        data: {
            participants: {
                create: [{ userId }, { userId: targetUserId }],
            },
        },
        include: {
            participants: { select: { user: { select: { username: true, usertag: true } } } },
        },
    });
    res.status(201).json({
        status: "success",
        message: "Conversation created",
        data: { conversation: newConversation },
    });
}));
exports.getConversation = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const conversationId = Number(req.params.conversationId);
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    if (!conversationId) {
        return res.status(401).json({ status: "error", message: "Invalid 'conversationId'" });
    }
    const activeConversation = yield prismaClient_1.default.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                select: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            usertag: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                select: { content: true, image: true, sender: { select: { username: true, usertag: true } } },
            },
        },
    });
    if (!activeConversation) {
        return res.status(404).json({ status: "error", message: "Conversation not found" });
    }
    const isParticipant = activeConversation.participants.some((p) => p.user.id === userId);
    if (!isParticipant) {
        return res.status(403).json({ status: "error", message: "Access denied" });
    }
    res.status(200).json({ status: "success", data: { conversation: activeConversation } });
}));
exports.sendMessage = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const conversationId = Number(req.params.conversationId);
    const { content } = req.body;
    if (!userId) {
        return res.status(400).json({ status: "error", message: "Authentication required" });
    }
    if (!conversationId) {
        return res.status(400).json({ status: "error", message: "Invalid 'conversationId'" });
    }
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ status: "error", message: "'content' cannot be empty" });
    }
    const conversation = yield prismaClient_1.default.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                select: { userId: true },
            },
        },
    });
    if (!conversation) {
        return res.status(400).json({ status: "error", message: "Conversation not found" });
    }
    if (!conversation.participants.some((p) => p.userId === userId)) {
        return res.status(403).json({ status: "error", message: "Access denied" });
    }
    const message = yield prismaClient_1.default.message.create({
        data: {
            content: content.trim(),
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
            content: message.content,
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
        data: {
            message: {
                content: message.content,
            },
        },
    });
}));
exports.markMessagesAsRead = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const conversationId = Number(req.params.conversationId);
    if (!userId || !conversationId) {
        return next(new appError_1.default("Invalid request parameters", 400, true));
    }
    const messagesToMarkAsRead = yield prismaClient_1.default.message.findMany({
        where: {
            conversationId: conversationId,
            senderId: { not: userId },
            readAt: null,
        },
        select: {
            id: true,
        },
    });
    const updateNotification = yield prismaClient_1.default.notification.updateMany({
        where: {
            conversationId: conversationId,
            recipientId: userId,
            read: false,
        },
        data: {
            read: true,
        },
    });
    const messageIdsToMarkAsRead = messagesToMarkAsRead.map((message) => message.id);
    if (messageIdsToMarkAsRead.length > 0) {
        yield prismaClient_1.default.message.updateMany({
            where: {
                id: { in: messageIdsToMarkAsRead },
            },
            data: {
                readAt: new Date(),
            },
        });
    }
    yield prismaClient_1.default.participant.updateMany({
        where: {
            conversationId: conversationId,
            userId: userId,
        },
        data: {
            unreadCount: 0,
        },
    });
    const io = req.app.get("socketio");
    io.to(`conversation_${conversationId}`).emit("messagesRead", {
        conversationId,
        messageIds: messageIdsToMarkAsRead,
        readerId: userId,
    });
    res.status(200).json({
        status: "success",
        message: "Messages marked as read",
        readMessageIds: messageIdsToMarkAsRead,
    });
}));
