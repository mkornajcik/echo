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
exports.unfollowUser = exports.followUser = exports.updateProfile = exports.getFollowing = exports.getFollowers = exports.getProfileReposts = exports.getProfileLikes = exports.getProfileComments = exports.getProfilePosts = exports.getProfile = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const notifications_1 = require("../utils/notifications");
const client_1 = require("@prisma/client");
exports.getProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const profileUser = yield prismaClient_1.default.user.findUnique({
        where: { id: profileUserId },
        select: {
            createdAt: true,
            username: true,
            usertag: true,
            coverImage: true,
            image: true,
            bio: true,
            location: true,
            website: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!profileUser) {
        return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", user: profileUser });
}));
exports.getProfilePosts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const posts = yield prismaClient_1.default.post.findMany({
        where: { userId: profileUserId },
        select: { createdAt: true, text: true, image: true, user: { select: { username: true, usertag: true } } },
    });
    if (!posts) {
        return res.status(404).json({ status: "error", message: "No posts found" });
    }
    return res.status(200).json({ status: "success", posts });
}));
exports.getProfileComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        select: { username: true, usertag: true, comments: { select: { createdAt: true, text: true, postId: true } } },
    });
    if (!user) {
        return res.status(404).json({ status: "error", message: "No user found" });
    }
    res.status(200).json({ status: "success", user });
}));
exports.getProfileLikes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        select: {
            username: true,
            usertag: true,
            postLikes: { select: { postId: true, createdAt: true, post: { select: { text: true } } } },
            commentLikes: { select: { commentId: true, createdAt: true, comment: { select: { text: true } } } },
        },
    });
    if (!user) {
        return res.status(404).json({ status: "error", message: "No user found" });
    }
    res.status(200).json({ status: "success", user });
}));
exports.getProfileReposts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        select: {
            username: true,
            usertag: true,
            postReposts: { select: { postId: true, createdAt: true, post: { select: { text: true } } } },
            commentReposts: { select: { commentId: true, createdAt: true, comment: { select: { text: true } } } },
        },
    });
    if (!user) {
        return res.status(404).json({ status: "error", message: "No user found" });
    }
    res.status(200).json({ status: "success", user });
}));
exports.getFollowers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        select: {
            username: true,
            usertag: true,
            followers: { select: { follower: { select: { username: true, usertag: true } } } },
        },
    });
    if (!user) {
        return res.status(404).json({ status: "error", message: "No user found" });
    }
    res.status(200).json({ status: "success", user });
}));
exports.getFollowing = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return res.status(400).json({ status: "error", message: "Invalid profile ID" });
    }
    if (!currentUserId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        select: {
            username: true,
            usertag: true,
            following: { select: { following: { select: { username: true, usertag: true } } } },
        },
    });
    if (!user) {
        return res.status(404).json({ status: "error", message: "No user found" });
    }
    res.status(200).json({ status: "success", user });
}));
exports.updateProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { username, bio, location, website } = req.body;
    if (!userId) {
        return res.status(403).json({ status: "error", message: "Authentication required" });
    }
    if (website) {
        try {
            const parsedUrl = new URL(website);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                throw new Error("Invalid protocol");
            }
        }
        catch (err) {
            return res
                .status(400)
                .json({ status: "error", message: "Invalid website URL. Format should be as follows: 'https://example.com/'" });
        }
    }
    try {
        const user = yield prismaClient_1.default.user.update({
            where: { id: userId },
            data: {
                username,
                bio,
                location,
                website,
            },
        });
        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully.",
        });
    }
    catch (err) {
        if (err.code === "P2002" && ((_c = (_b = err.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.includes("username"))) {
            return res.status(409).json({ status: "error", message: "Username is already taken" });
        }
        return res.status(400).json({ status: "error", message: "Error updating profile" });
    }
}));
exports.followUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const followerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const followingId = Number(req.params.id);
    if (!followerId) {
        return res.status(404).json({ status: "error", message: "Couldn't find user" });
    }
    if (followerId === followingId) {
        return res.status(400).json({ status: "error", message: "You cannot follow yourself" });
    }
    const existingFollow = yield prismaClient_1.default.follow.findFirst({
        where: { followerId, followingId },
    });
    if (existingFollow) {
        return res.status(400).json({
            status: "error",
            message: "Already following this user, use the 'unfollow' route if you wish to unfollow this profile",
        });
    }
    try {
        yield prismaClient_1.default.follow.create({
            data: {
                follower: { connect: { id: followerId } },
                following: { connect: { id: followingId } },
            },
        });
        yield (0, notifications_1.createNotification)({
            recipientId: followingId,
            senderId: followerId,
            type: client_1.NotificationType.NEW_FOLLOWER,
        });
        return res.status(200).json({ status: "success", message: "Followed successfully" });
    }
    catch (error) {
        return res.status(500).json({ status: "error", message: "An error occurred while following" });
    }
}));
exports.unfollowUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const followerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const followingId = Number(req.params.id);
    if (!followerId) {
        return res.status(404).json({ status: "error", message: "Couldn't find user" });
    }
    if (followerId === followingId) {
        return res.status(400).json({ status: "error", message: "You cannot unfollow yourself" });
    }
    const existingFollow = yield prismaClient_1.default.follow.findFirst({
        where: { followerId, followingId },
    });
    if (!existingFollow) {
        return res.status(400).json({ status: "error", message: "You are not following this user" });
    }
    try {
        yield prismaClient_1.default.follow.delete({
            where: { id: existingFollow.id },
        });
        return res.status(200).json({ status: "success", message: "Unfollowed successfully" });
    }
    catch (error) {
        return res.status(500).json({ status: "error", message: "An error occurred while unfollowing" });
    }
}));
