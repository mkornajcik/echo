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
exports.togglePostRepost = exports.togglePostLike = exports.deletePost = exports.createPost = exports.getPost = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const notifications_1 = require("../utils/notifications");
const client_1 = require("@prisma/client");
exports.getPost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = Number(req.params.id);
    const post = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
        include: {
            _count: { select: { likes: true, reposts: true } },
            user: { select: { username: true, usertag: true } },
            comments: {
                orderBy: { createdAt: "desc" },
                select: { text: true, user: { select: { username: true, usertag: true } } },
            },
        },
    });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    res.status(200).json({ status: "success", data: { post } });
}));
exports.createPost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const text = (_b = req.body.text) === null || _b === void 0 ? void 0 : _b.trim();
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    if (!text) {
        return res.status(400).json({ status: "error", message: "`text` is required" });
    }
    if (text.length > 280) {
        return res.status(400).json({ status: "error", message: "`text` must not exceed 280 characters" });
    }
    const post = yield prismaClient_1.default.post.create({ data: { text, userId } });
    res.status(201).json({ status: "success", data: { post } });
}));
exports.deletePost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const postId = Number(req.params.id);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const deleteResult = yield prismaClient_1.default.post.deleteMany({ where: { id: postId, userId } });
    if (deleteResult.count === 0) {
        const exists = yield prismaClient_1.default.post.findUnique({ where: { id: postId } });
        if (!exists) {
            return res.status(404).json({ status: "error", message: "Post not found" });
        }
        return res.status(403).json({ status: "error", message: "Forbidden: cannot delete another user's post" });
    }
    res.status(204).send();
}));
exports.togglePostLike = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const postId = Number(req.params.id);
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const post = yield prismaClient_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    const existing = yield prismaClient_1.default.postLike.findUnique({
        where: { userId_postId: { userId, postId } },
    });
    if (existing) {
        yield prismaClient_1.default.postLike.delete({ where: { id: existing.id } });
    }
    else {
        yield prismaClient_1.default.postLike.create({ data: { userId, postId } });
        if (post.userId !== userId) {
            yield (0, notifications_1.createNotification)({
                recipientId: post.userId,
                senderId: userId,
                type: client_1.NotificationType.LIKE_POST,
                postId,
            });
        }
    }
    const updated = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
        include: { _count: { select: { likes: true } } },
    });
    res.status(200).json({
        status: "success",
        data: {
            liked: !existing,
            count: (_b = updated === null || updated === void 0 ? void 0 : updated._count.likes) !== null && _b !== void 0 ? _b : 0,
        },
    });
}));
exports.togglePostRepost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const postId = Number(req.params.id);
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const post = yield prismaClient_1.default.post.findUnique({ where: { id: postId } });
    if (!post) {
        return res.status(404).json({ status: "error", message: "Post not found" });
    }
    const existing = yield prismaClient_1.default.postRepost.findUnique({
        where: { userId_postId: { userId, postId } },
    });
    if (existing) {
        yield prismaClient_1.default.postRepost.delete({ where: { id: existing.id } });
    }
    else {
        yield prismaClient_1.default.postRepost.create({ data: { userId, postId } });
        if (post.userId !== userId) {
            yield (0, notifications_1.createNotification)({
                recipientId: post.userId,
                senderId: userId,
                type: client_1.NotificationType.REPOST_POST,
                postId,
            });
        }
    }
    const updated = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
        include: { _count: { select: { reposts: true } } },
    });
    res.status(200).json({
        status: "success",
        data: {
            reposted: !existing,
            count: (_b = updated === null || updated === void 0 ? void 0 : updated._count.reposts) !== null && _b !== void 0 ? _b : 0,
        },
    });
}));
