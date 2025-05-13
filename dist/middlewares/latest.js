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
exports.addLatestFromFollowing = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const addLatestFromFollowing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customReq = req;
        const currentUserId = (_a = customReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentUserId) {
            res.locals.latestFromUser = [];
            return next();
        }
        const latestPosts = yield prismaClient_1.default.post.findMany({
            where: {
                user: {
                    followers: {
                        some: {
                            followerId: currentUserId,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                text: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        usertag: true,
                    },
                },
            },
            take: 1,
            distinct: ["userId"],
        });
        const latestFromUser = latestPosts.map((post) => ({
            id: post.user.id,
            username: post.user.username,
            usertag: post.user.usertag,
            postId: post.id,
            postText: post.text,
            postCreatedAt: post.createdAt,
        }));
        res.locals.latestFromUser = latestFromUser;
    }
    catch (error) {
        console.error("Error fetching latest from followed users:", error);
        res.locals.latestFromUser = [];
    }
    next();
});
exports.addLatestFromFollowing = addLatestFromFollowing;
