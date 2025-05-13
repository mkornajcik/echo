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
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync = require("../utils/catchAsync");
exports.search = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { q, type = "all" } = req.query;
    const query = typeof q === "string" ? q.trim() : "";
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!query) {
        return res.status(200).render("search", {
            title: "Search",
            query: "",
            results: { users: [], posts: [] },
            type: type,
            reqUser: req.user,
        });
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
                id: true,
                username: true,
                usertag: true,
                bio: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
            take: 20,
        });
        if (currentUserId) {
            users = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
                const isFollowing = yield prismaClient_1.default.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: currentUserId,
                            followingId: user.id,
                        },
                    },
                });
                return Object.assign(Object.assign({}, user), { isFollowing: !!isFollowing });
            })));
        }
    }
    if (type === "all" || type === "posts") {
        posts = yield prismaClient_1.default.post.findMany({
            where: {
                text: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        usertag: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        reposts: true,
                    },
                },
                likes: currentUserId
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,
                reposts: currentUserId
                    ? {
                        where: {
                            userId: currentUserId,
                        },
                    }
                    : false,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 30,
        });
    }
    res.status(200).render("search", {
        title: `Search: ${query}`,
        query,
        results: { users, posts },
        type: type,
        reqUser: req.user,
    });
}));
