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
exports.getHomeFollowing = exports.getHome = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
function parsePaginationParams(rawLimit, rawPage, res) {
    if (rawLimit !== undefined && rawLimit !== null && isNaN(Number(rawLimit))) {
        res.status(400).json({ status: "error", message: "'limit' must be a valid number" });
        return null;
    }
    if (rawPage !== undefined && rawPage !== null && isNaN(Number(rawPage))) {
        res.status(400).json({ status: "error", message: "'page' must be a valid number" });
        return null;
    }
    let limit = parseInt(rawLimit, 10) || DEFAULT_LIMIT;
    let page = parseInt(rawPage, 10) || 1;
    if (limit > MAX_LIMIT)
        limit = MAX_LIMIT;
    if (limit < 1)
        limit = DEFAULT_LIMIT;
    if (page < 1)
        page = 1;
    return { limit, page };
}
exports.getHome = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pagination = parsePaginationParams(req.query.limit, req.query.page, res);
    if (!pagination)
        return;
    const { limit, page } = pagination;
    const skip = (page - 1) * limit;
    const [posts, total] = yield Promise.all([
        prismaClient_1.default.post.findMany({
            take: limit,
            skip,
            orderBy: { id: "desc" },
            select: {
                text: true,
                image: true,
                user: { select: { username: true, usertag: true } },
                _count: { select: { likes: true, comments: true, reposts: true } },
            },
        }),
        prismaClient_1.default.post.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    res.status(200).json({
        status: "success",
        meta: {
            total,
            totalPages,
            page,
            limit,
            hasNextPage,
            hasPrevPage,
        },
        data: { posts },
    });
}));
exports.getHomeFollowing = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!currentUserId) {
        return res.status(400).json({ status: "error", message: "Authentication required" });
    }
    const pagination = parsePaginationParams(req.query.limit, req.query.page, res);
    if (!pagination)
        return;
    const { limit, page } = pagination;
    const skip = (page - 1) * limit;
    const [posts, total] = yield Promise.all([
        prismaClient_1.default.post.findMany({
            take: limit,
            skip,
            where: {
                user: {
                    followers: {
                        some: {
                            followerId: currentUserId,
                        },
                    },
                },
            },
            select: {
                text: true,
                image: true,
                user: { select: { username: true, usertag: true } },
                _count: { select: { likes: true, comments: true, reposts: true } },
            },
            orderBy: { id: "desc" },
        }),
        prismaClient_1.default.post.count({
            where: {
                user: {
                    followers: {
                        some: { followerId: currentUserId },
                    },
                },
            },
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    res.status(200).json({
        status: "success",
        meta: {
            total,
            totalPages,
            page,
            limit,
            hasNextPage,
            hasPrevPage,
        },
        data: { posts },
    });
}));
