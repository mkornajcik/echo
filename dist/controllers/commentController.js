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
exports.toggleCommentLike = exports.deleteComment = exports.createComment = exports.getComments = exports.getOneComment = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const notifications_1 = require("../utils/notifications");
const client_1 = require("@prisma/client");
exports.getOneComment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = parseInt(req.params.commentId);
    if (!commentId) {
        return res.status(404).json({ status: "error", message: "Comment with this ID was not found" });
    }
    const comment = yield prismaClient_1.default.comment.findUnique({
        where: { id: commentId },
        select: { id: true, text: true, createdAt: true, user: { select: { username: true, usertag: true } } },
    });
    if (!comment) {
        return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    return res.status(200).json({ status: "success", data: { comment } });
}));
exports.getComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseInt(req.params.id);
    const post = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    const comments = yield prismaClient_1.default.comment.findMany({
        where: { postId: postId },
        orderBy: { createdAt: "desc" },
        select: { id: true, text: true, createdAt: true, user: { select: { username: true, usertag: true } } },
    });
    if (!comments) {
        return res.status(404).json({ status: "error", message: "No comments on this post" });
    }
    return res.status(200).json({ status: "success", data: { comments } });
}));
exports.createComment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const postId = parseInt(req.params.id);
    const { commentText } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const post = yield prismaClient_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    if (!userId) {
        return res.status(404).json({ status: "error", message: "Authentication required" });
    }
    if (!commentText) {
        return res.status(404).json({ status: "error", message: "Comment text cannot be empty" });
    }
    if (commentText.length > 280) {
        return res.status(404).json({ status: "error", message: "Comment text cannot exceed 280 characters" });
    }
    const comment = yield prismaClient_1.default.comment.create({
        data: {
            text: commentText,
            userId,
            postId: postId,
        },
    });
    if (post.userId !== userId) {
        yield (0, notifications_1.createNotification)({
            recipientId: post.userId,
            senderId: userId,
            type: client_1.NotificationType.REPLY,
            postId: postId,
            commentId: comment.id,
        });
    }
    const mentionRegex = /@([^\s@]+)/g;
    const rawMentions = commentText.match(mentionRegex) || [];
    const uniqueMentions = Array.from(new Set(rawMentions.map((m) => m.slice(1))));
    const mentionedUsers = yield prismaClient_1.default.user.findMany({
        where: { usertag: { in: uniqueMentions } },
        select: { id: true, usertag: true },
    });
    yield Promise.all(mentionedUsers.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user.id !== userId) {
            yield (0, notifications_1.createNotification)({
                recipientId: user.id,
                senderId: userId,
                type: client_1.NotificationType.TAG,
                postId,
                commentId: comment.id,
            });
        }
    })));
    res.status(201).json({ status: "success", message: "Comment created" });
}));
exports.deleteComment = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(404).json({ status: "error", message: "Authentication required" });
    }
    const deletedComment = yield prismaClient_1.default.comment.deleteMany({
        where: {
            id: Number(commentId),
            userId: userId,
        },
    });
    if (deletedComment.count === 0) {
        return res.status(404).json({ status: "error", message: "Comment not found or unauthorized" });
    }
    res.status(204).send();
}));
exports.toggleCommentLike = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseInt(req.params.postId);
    const commentId = parseInt(req.params.commentId);
    const userId = Number(req.user.id);
    const post = yield prismaClient_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    const comment = yield prismaClient_1.default.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
        return res.status(404).json({ status: "error", message: "Comment not found" });
    }
    const existingLike = yield prismaClient_1.default.commentLike.findUnique({
        where: {
            userId_commentId: { userId, commentId },
        },
    });
    if (existingLike) {
        yield prismaClient_1.default.commentLike.delete({
            where: { id: existingLike.id },
        });
    }
    else {
        yield prismaClient_1.default.commentLike.create({
            data: { userId, commentId },
        });
        if (post.userId !== userId) {
            yield (0, notifications_1.createNotification)({
                recipientId: post.userId,
                senderId: userId,
                type: client_1.NotificationType.LIKE_COMMENT,
                postId: postId,
                commentId: comment.id,
            });
        }
    }
    const updatedComment = yield prismaClient_1.default.comment.findUnique({
        where: { id: commentId },
        include: { _count: { select: { likes: true } } },
    });
    res.status(200).json({
        status: "success",
        data: { liked: !existingLike, count: updatedComment === null || updatedComment === void 0 ? void 0 : updatedComment._count.likes },
    });
}));
