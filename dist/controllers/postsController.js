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
const appError_1 = __importDefault(require("../utils/appError"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync = require("../utils/catchAsync");
exports.getPost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    const post = yield prismaClient_1.default.post.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: true,
            comments: {
                include: {
                    user: { select: { id: true, username: true, usertag: true } },
                    _count: { select: { likes: true, reposts: true } },
                    likes: { where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } },
                    reposts: { where: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id } },
                },
            },
            _count: { select: { likes: true, reposts: true } },
            likes: { where: { userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id } },
            reposts: { where: { userId: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id } },
        },
    });
    if (!post) {
        return next(new appError_1.default("Post not found", 404, true));
    }
    res.status(200).render("post", { title: "Post", post, reqUser: req.user });
}));
exports.createPost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const text = (_b = req.body.text) === null || _b === void 0 ? void 0 : _b.trim();
    if (!userId) {
        return next(new appError_1.default("User ID is required", 400, true));
    }
    if (!text) {
        return next(new appError_1.default("Post text cannot be empty", 400, true));
    }
    if (text.length > 280) {
        return next(new appError_1.default("Post cannot exceed 280 characters", 400, true));
    }
    const post = yield prismaClient_1.default.post.create({
        data: {
            text,
            userId,
        },
    });
    res.redirect("/feed");
}));
exports.deletePost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("User ID is required", 400, true));
    }
    const deleteResult = yield prismaClient_1.default.post.deleteMany({
        where: {
            id: Number(id),
            userId: userId,
        },
    });
    if (deleteResult.count === 0) {
        const postExists = yield prismaClient_1.default.post.findUnique({ where: { id: Number(id) } });
        if (!postExists) {
            return next(new appError_1.default("Post not found", 404, true));
        }
        else {
            return next(new appError_1.default("You can only delete your own posts", 403, true));
        }
    }
    res.status(200).json({ status: "success" });
}));
exports.updatePost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { text } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("User ID is required", 400, true));
    }
    if (!text) {
        return next(new appError_1.default("Text cannot be empty", 400, true));
    }
    if (text.length > 280) {
        return next(new appError_1.default("Post cannot exceed 280 characters", 400, true));
    }
    const post = yield prismaClient_1.default.post.findUnique({
        where: { id: Number(id) },
        select: { userId: true },
    });
    if (!post) {
        return next(new appError_1.default("Post not found", 404, true));
    }
    if (post.userId !== userId) {
        return next(new appError_1.default("You can only update your own post", 403, true));
    }
    const updatedPost = yield prismaClient_1.default.post.update({
        where: { id: Number(id) },
        data: { text },
        include: {
            user: true,
        },
    });
    res.status(200).render("post", { title: "Post", post: updatedPost, reqUser: req.user });
}));
exports.togglePostLike = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseInt(req.params.id);
    const userId = Number(req.user.id);
    const existingLike = yield prismaClient_1.default.postLike.findUnique({
        where: {
            userId_postId: { userId, postId },
        },
    });
    if (existingLike) {
        yield prismaClient_1.default.postLike.delete({
            where: { id: existingLike.id },
        });
    }
    else {
        yield prismaClient_1.default.postLike.create({
            data: { userId, postId },
        });
    }
    const updatedPost = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
        include: { _count: { select: { likes: true } } },
    });
    res.status(200).json({
        status: "success",
        data: { liked: !existingLike, count: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost._count.likes },
    });
}));
exports.togglePostRepost = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const postId = parseInt(req.params.id);
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const existingRepost = yield prismaClient_1.default.postRepost.findUnique({
        where: { userId_postId: { userId, postId } },
    });
    if (existingRepost) {
        yield prismaClient_1.default.postRepost.delete({
            where: { id: existingRepost.id },
        });
    }
    else {
        yield prismaClient_1.default.postRepost.create({
            data: { userId, postId },
        });
    }
    const updatedPost = yield prismaClient_1.default.post.findUnique({
        where: { id: postId },
        include: { _count: { select: { reposts: true } } },
    });
    res.status(200).json({ status: "success", data: { reposted: !existingRepost, count: updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost._count.reposts } });
}));
