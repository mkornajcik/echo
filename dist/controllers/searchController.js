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
exports.search = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
exports.search = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { q, type = "all" } = req.query;
    const query = typeof q === "string" ? q.trim() : "";
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    if (!query) {
        return res.status(404).json({ status: "error", message: "Provide a valid query" });
    }
    let users = [];
    let posts = [];
    if (type === "all" || type === "users") {
        users = yield prismaClient_1.default.user.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: "insensitive" } },
                    { usertag: { contains: query, mode: "insensitive" } },
                    { bio: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                username: true,
                usertag: true,
                bio: true,
                location: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
            take: 20,
        });
    }
    if (type === "all" || type === "posts") {
        posts = yield prismaClient_1.default.post.findMany({
            where: {
                text: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                text: true,
                image: true,
                user: {
                    select: {
                        username: true,
                        usertag: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        reposts: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        });
    }
    res.status(200).json({
        status: "success",
        query,
        data: {
            users: users,
            posts: posts,
        },
    });
}));
