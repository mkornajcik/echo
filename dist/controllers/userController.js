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
exports.getProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (isNaN(profileUserId)) {
        return next(new appError_1.default("Invalid user ID.", 400, true));
    }
    const profileUser = yield prismaClient_1.default.user.findUnique({
        where: { id: profileUserId },
        include: {
            posts: {
                orderBy: { createdAt: "desc" },
                include: {
                    likes: {
                        where: {
                            userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1,
                        },
                        select: { id: true },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            reposts: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!profileUser) {
        return next(new appError_1.default("User not found", 404, true));
    }
    let isCurrentUserFollowing = false;
    if (currentUserId && currentUserId !== profileUserId) {
        const followRelationship = yield prismaClient_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: profileUserId,
                },
            },
            select: {
                id: true,
            },
        });
        isCurrentUserFollowing = !!followRelationship;
    }
    else if (currentUserId && currentUserId === profileUserId) {
        isCurrentUserFollowing = false;
    }
    res.status(200).render("profile", {
        title: `${profileUser.username} Profile`,
        user: profileUser,
        reqUser: req.user,
        isCurrentUserFollowing,
    });
}));
exports.getProfileComments = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.id;
    if (!userId) {
        return next(new appError_1.default("User with this ID does not exist", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(userId) },
        include: {
            comments: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    likes: {
                        where: {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            reposts: true,
                        },
                    },
                    post: {
                        select: {
                            id: true,
                            text: true,
                            createdAt: true,
                            user: { select: { id: true, username: true, usertag: true } },
                        },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    res.status(200).render("profileComments", { title: "Profile", user, reqUser: req.user });
}));
exports.getProfileLikes = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return next(new appError_1.default("User with this ID does not exist", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(userId) },
        include: {
            postLikes: {
                orderBy: { createdAt: "desc" },
                include: {
                    post: {
                        include: {
                            user: { select: { id: true, username: true, usertag: true } },
                            _count: {
                                select: {
                                    likes: true,
                                    reposts: true,
                                    comments: true,
                                },
                            },
                        },
                    },
                },
            },
            commentLikes: {
                orderBy: { createdAt: "desc" },
                include: {
                    comment: {
                        include: {
                            user: { select: { id: true, username: true, usertag: true } },
                            post: {
                                select: {
                                    id: true,
                                    text: true,
                                    createdAt: true,
                                    user: { select: { id: true, username: true, usertag: true } },
                                },
                            },
                            _count: {
                                select: {
                                    likes: true,
                                    reposts: true,
                                },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    res.status(200).render("profileLikes", { title: "Profile", user, reqUser: req.user });
}));
exports.getProfileReposts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return next(new appError_1.default("User with this ID does not exist", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(userId) },
        include: {
            commentReposts: { orderBy: { createdAt: "desc" } },
            postReposts: {
                orderBy: { createdAt: "desc" },
                include: {
                    post: {
                        include: {
                            user: { select: { id: true, username: true, usertag: true } },
                            _count: {
                                select: {
                                    likes: true,
                                    reposts: true,
                                    comments: true,
                                },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    res.status(200).render("profileReposts", { title: "Profile", user, reqUser: req.user });
}));
exports.getFollowers = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (isNaN(userId)) {
        return next(new appError_1.default("Invalid user ID.", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            usertag: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    const followers = yield prismaClient_1.default.follow.findMany({
        where: { followingId: userId },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    usertag: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const followersWithFollowStatus = yield Promise.all(followers.map((follow) => __awaiter(void 0, void 0, void 0, function* () {
        let isFollowing = false;
        if (currentUserId) {
            const followRelationship = yield prismaClient_1.default.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: follow.follower.id,
                    },
                },
            });
            isFollowing = !!followRelationship;
        }
        return Object.assign(Object.assign({}, follow), { isFollowing });
    })));
    res.status(200).render("followers", {
        title: `People following ${user.username}`,
        user,
        followers: followersWithFollowStatus,
        reqUser: req.user,
    });
}));
exports.getFollowing = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (isNaN(userId)) {
        return next(new appError_1.default("Invalid user ID.", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            usertag: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    const following = yield prismaClient_1.default.follow.findMany({
        where: { followerId: userId },
        include: {
            following: {
                select: {
                    id: true,
                    username: true,
                    usertag: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const followingWithFollowStatus = yield Promise.all(following.map((follow) => __awaiter(void 0, void 0, void 0, function* () {
        let isFollowing = false;
        if (currentUserId) {
            const followRelationship = yield prismaClient_1.default.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: follow.following.id,
                    },
                },
            });
            isFollowing = !!followRelationship;
        }
        return Object.assign(Object.assign({}, follow), { isFollowing });
    })));
    res.status(200).render("following", {
        title: `People followed by ${user.username}`,
        user,
        following: followingWithFollowStatus,
        reqUser: req.user,
    });
}));
exports.updateProfile = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { username, bio, location, website } = req.body;
    if (!userId) {
        return next(new appError_1.default("User with this ID does not exist", 400, true));
    }
    const user = yield prismaClient_1.default.user.update({
        where: { id: userId },
        data: {
            username,
            bio,
            location,
            website,
        },
    });
    if (!user) {
        return next(new appError_1.default("Error updating profile", 400, true));
    }
    res.redirect(`/profile/${userId}`);
}));
exports.followUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const followerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const followingId = Number.parseInt(req.params.id);
    if (followerId === followingId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
    }
    const existingFollow = yield prismaClient_1.default.follow.findFirst({
        where: { followerId, followingId },
    });
    if (existingFollow) {
        return res.status(400).json({ message: "Already following this user" });
    }
    try {
        yield prismaClient_1.default.follow.create({
            data: {
                follower: { connect: { id: followerId } },
                following: { connect: { id: followingId } },
            },
        });
        return res.status(200).json({ message: "Followed successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "An error occurred while following" });
    }
}));
exports.unfollowUser = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const followerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const followingId = Number.parseInt(req.params.id);
    const existingFollow = yield prismaClient_1.default.follow.findFirst({
        where: { followerId, followingId },
    });
    if (!existingFollow) {
        return res.status(400).json({ message: "You are not following this user" });
    }
    try {
        yield prismaClient_1.default.follow.delete({
            where: { id: existingFollow.id },
        });
        return res.status(200).json({ message: "Unfollowed successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "An error occurred while unfollowing" });
    }
}));
