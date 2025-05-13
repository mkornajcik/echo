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
exports.createComment = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { commentText } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("User ID is required", 400, true));
    }
    if (!commentText) {
        return next(new appError_1.default("Comment cannot be empty", 400, true));
    }
    if (commentText.length > 280) {
        return next(new appError_1.default("Comment cannot exceed 280 characters", 400, true));
    }
    const comment = yield prismaClient_1.default.comment.create({
        data: {
            text: commentText,
            userId,
            postId: parseInt(id),
        },
    });
    res.redirect(`/feed/post/${id}`);
}));
exports.deleteComment = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("User ID is required", 400, true));
    }
    const deletedComment = yield prismaClient_1.default.comment.deleteMany({
        where: {
            id: Number(commentId),
            userId: userId,
        },
    });
    if (deletedComment.count === 0) {
        return next(new appError_1.default("Comment not found or unauthorized", 400, true));
    }
    res.status(200).json({ status: "success" });
}));
exports.toggleCommentLike = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = parseInt(req.params.commentId);
    const userId = Number(req.user.id);
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
