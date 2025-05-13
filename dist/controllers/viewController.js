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
exports.getTerms = exports.getAbout = exports.getRegisterForm = exports.getLoginForm = exports.getWelcome = exports.getProfileFollowing = exports.getProfileFollowers = exports.getProfileReposts = exports.getProfileLikes = exports.getProfileComments = exports.getProfile = exports.search = exports.getNotifications = exports.startConversation = exports.getConversation = exports.getMessages = exports.getMoreProfileLikes = exports.getMoreProfileReposts = exports.getMoreProfileComments = exports.getMoreProfilePosts = exports.getMorePosts = exports.getHomeFollowing = exports.getHome = exports.getPost = exports.alerts = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const POSTS_PER_PAGE = 20;
function checkFollowStatus(currentUserId, profileUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentUserId || currentUserId === profileUserId)
            return false;
        const followRelationship = yield prismaClient_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: profileUserId,
                },
            },
        });
        return !!followRelationship;
    });
}
const alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert) {
        res.locals.alert = alert;
    }
    next();
};
exports.alerts = alerts;
exports.getPost = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    const post = yield prismaClient_1.default.post.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: true,
            comments: {
                orderBy: { createdAt: "desc" },
                include: {
                    post: { select: { id: true } },
                    user: { select: { id: true, username: true, usertag: true, image: true } },
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
exports.getHome = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const posts = yield prismaClient_1.default.post.findMany({
        take: POSTS_PER_PAGE,
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } },
            reposts: { where: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const lastPostId = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;
    res.status(200).render("feed", { title: "Feed", posts, reqUser: req.user, lastPostId, filterType: "all" });
}));
exports.getHomeFollowing = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const posts = yield prismaClient_1.default.post.findMany({
        take: POSTS_PER_PAGE,
        where: {
            user: {
                followers: {
                    some: {
                        followerId: currentUserId,
                    },
                },
            },
        },
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const lastPostId = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;
    res.status(200).render("feed", {
        title: "Feed",
        posts,
        reqUser: req.user,
        lastPostId,
        filterType: "following",
    });
}));
exports.getMorePosts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const filter = req.query.filter;
    if (!cursor) {
        return res.status(200).json({ status: "success", data: { posts: [], nextCursor: null } });
    }
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    let whereClause = {};
    if (filter === "following" && currentUserId) {
        whereClause = {
            user: {
                followers: {
                    some: {
                        followerId: currentUserId,
                    },
                },
            },
        };
    }
    const posts = yield prismaClient_1.default.post.findMany({
        take: POSTS_PER_PAGE,
        skip: 1,
        cursor: { id: cursor },
        where: whereClause,
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const nextCursor = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;
    res.status(200).json({
        status: "success",
        data: {
            posts,
            nextCursor,
        },
    });
}));
exports.getMoreProfilePosts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.userId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!cursor) {
        return res.status(200).json({
            status: "success",
            data: { posts: [], nextCursor: null },
        });
    }
    const posts = yield prismaClient_1.default.post.findMany({
        where: {
            userId: profileUserId,
        },
        take: POSTS_PER_PAGE,
        skip: 1,
        cursor: { id: cursor },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
        },
    });
    const nextCursor = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;
    res.status(200).json({
        status: "success",
        data: {
            posts,
            nextCursor,
        },
    });
}));
exports.getMoreProfileComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.userId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    if (!cursor) {
        return res.status(200).json({
            status: "success",
            data: { posts: [], nextCursor: null },
        });
    }
    const comments = yield prismaClient_1.default.comment.findMany({
        where: {
            userId: profileUserId,
        },
        take: POSTS_PER_PAGE,
        skip: 1,
        cursor: { id: cursor },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            post: { select: { id: true, user: { select: { username: true, usertag: true } } } },
            _count: { select: { likes: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
        },
    });
    if (!comments) {
        return next(new appError_1.default("No comments found", 404, true));
    }
    const nextCursor = comments.length === POSTS_PER_PAGE ? comments[comments.length - 1].id : null;
    res.status(200).json({
        status: "success",
        data: {
            comments,
            nextCursor,
        },
    });
}));
exports.getMoreProfileReposts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.userId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    if (!cursor) {
        return res.status(200).json({
            status: "success",
            data: { posts: [], nextCursor: null },
        });
    }
    const reposts = yield prismaClient_1.default.postRepost.findMany({
        where: {
            userId: profileUserId,
        },
        take: POSTS_PER_PAGE,
        skip: 1,
        cursor: { id: cursor },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: { select: { id: true, username: true, usertag: true, image: true } },
            post: {
                select: {
                    id: true,
                    text: true,
                    image: true,
                    user: { select: { username: true, usertag: true } },
                    _count: { select: { likes: true, reposts: true, comments: true } },
                    likes: { where: { userId: currentUserId } },
                    reposts: { where: { userId: currentUserId } },
                },
            },
        },
    });
    if (!reposts) {
        return res.status(400).json({
            status: "error",
            message: "No reposts found",
        });
    }
    const nextCursor = reposts.length === POSTS_PER_PAGE ? reposts[reposts.length - 1].id : null;
    res.status(200).json({
        status: "success",
        data: {
            reposts,
            nextCursor,
        },
    });
}));
exports.getMoreProfileLikes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.userId);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    if (!cursor) {
        return res.status(200).json({
            status: "success",
            data: { likes: [], nextCursor: null },
        });
    }
    const [postLikes, commentLikes] = yield Promise.all([
        prismaClient_1.default.postLike.findMany({
            where: {
                userId: profileUserId,
                id: { lt: cursor },
            },
            take: POSTS_PER_PAGE,
            orderBy: { createdAt: "desc" },
            include: {
                post: {
                    include: {
                        user: { select: { id: true, username: true, usertag: true, image: true } },
                        likes: { where: { userId: currentUserId } },
                        reposts: { where: { userId: currentUserId } },
                        _count: {
                            select: { likes: true, reposts: true, comments: true },
                        },
                    },
                },
            },
        }),
        prismaClient_1.default.commentLike.findMany({
            where: {
                userId: profileUserId,
                id: { lt: cursor },
            },
            take: POSTS_PER_PAGE,
            orderBy: { createdAt: "desc" },
            include: {
                comment: {
                    include: {
                        likes: { where: { userId: currentUserId } },
                        user: { select: { id: true, username: true, usertag: true, image: true } },
                        post: {
                            select: {
                                id: true,
                                text: true,
                                createdAt: true,
                                user: { select: { id: true, username: true, usertag: true } },
                            },
                        },
                        _count: {
                            select: { likes: true, reposts: true },
                        },
                    },
                },
            },
        }),
    ]);
    const allLikes = [
        ...postLikes.map((like) => (Object.assign(Object.assign({}, like), { type: "post" }))),
        ...commentLikes.map((like) => (Object.assign(Object.assign({}, like), { type: "comment" }))),
    ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, POSTS_PER_PAGE);
    const nextCursor = allLikes.length === POSTS_PER_PAGE ? allLikes[allLikes.length - 1].id : null;
    res.status(200).json({
        status: "success",
        data: {
            likes: allLikes,
            nextCursor,
        },
    });
}));
exports.getMessages = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const conversations = yield prismaClient_1.default.conversation.findMany({
        where: {
            participants: {
                some: { userId },
            },
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            usertag: true,
                            image: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { updatedAt: "desc" },
    });
    res.status(200).render("messages", {
        title: "Messages",
        reqUser: req.user,
        conversations,
        activeConversation: null,
    });
}));
exports.getConversation = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const conversationId = Number(req.params.conversationId);
    if (!conversationId) {
        return next(new appError_1.default("No conversation found", 404, true));
    }
    if (!userId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const activeConversation = yield prismaClient_1.default.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            usertag: true,
                            image: true,
                        },
                    },
                },
            },
            messages: {
                orderBy: { createdAt: "asc" },
                include: { sender: true },
            },
        },
    });
    const otherParticipant = (_b = activeConversation === null || activeConversation === void 0 ? void 0 : activeConversation.participants.find((p) => p.user.id !== userId)) === null || _b === void 0 ? void 0 : _b.user;
    if (!activeConversation) {
        return next(new appError_1.default("Conversation not found", 404, true));
    }
    const isParticipant = activeConversation.participants.some((p) => p.user.id === userId);
    if (!isParticipant) {
        return next(new appError_1.default("Access denied", 403, true));
    }
    const conversations = yield prismaClient_1.default.conversation.findMany({
        where: { participants: { some: { userId } } },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, username: true, usertag: true, image: true },
                    },
                },
            },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
    });
    res.status(200).render("messages", {
        title: "Messages",
        reqUser: req.user,
        conversations,
        activeConversation,
        otherParticipant,
    });
}));
exports.startConversation = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const targetUserId = Number(req.body.targetUserId);
    if (!targetUserId) {
        return next(new appError_1.default("No target ID found", 400, true));
    }
    if (!userId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    if (userId === targetUserId) {
        return next(new appError_1.default("You cannot message yourself", 400, true));
    }
    const existingConversation = yield prismaClient_1.default.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { userId } } },
                { participants: { some: { userId: targetUserId } } },
                { participants: { every: { userId: { in: [userId, targetUserId] } } } },
            ],
        },
        include: {
            participants: true,
        },
    });
    if (existingConversation) {
        return res.status(200).json({
            status: "success",
            data: { conversation: existingConversation },
        });
    }
    const newConversation = yield prismaClient_1.default.conversation.create({
        data: {
            participants: {
                create: [{ userId }, { userId: targetUserId }],
            },
        },
        include: {
            participants: true,
        },
    });
    res.status(201).json({
        status: "success",
        data: { conversation: newConversation },
    });
}));
exports.getNotifications = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const notifications = yield prismaClient_1.default.notification.findMany({
        where: {
            recipientId: userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            sender: {
                select: { id: true, username: true, usertag: true, image: true },
            },
            post: { select: { id: true, text: true } },
            comment: { select: { id: true, text: true } },
            conversation: { select: { id: true } },
        },
        take: 30,
    });
    const unreadCount = yield prismaClient_1.default.notification.count({
        where: {
            recipientId: userId,
            read: false,
        },
    });
    res.status(200).render("notifications", { title: "Notifications", notifications, unreadCount, reqUser: req.user });
}));
exports.search = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const profileUser = yield prismaClient_1.default.user.findUnique({
        where: { id: profileUserId },
        include: {
            posts: {
                orderBy: { createdAt: "desc" },
                include: {
                    reposts: {
                        where: {
                            userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1,
                        },
                    },
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
                take: POSTS_PER_PAGE,
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
    const lastPostId = profileUser.posts.length === POSTS_PER_PAGE ? profileUser.posts[profileUser.posts.length - 1].id : null;
    res.status(200).render("profile", {
        title: `${profileUser.username} Profile`,
        user: profileUser,
        reqUser: req.user,
        isCurrentUserFollowing,
        lastPostId,
    });
}));
exports.getProfileComments = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        include: {
            comments: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    likes: {
                        where: {
                            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
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
                            user: { select: { id: true, username: true, usertag: true, image: true } },
                            likes: true,
                        },
                    },
                },
                take: POSTS_PER_PAGE,
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
    const isCurrentUserFollowing = yield checkFollowStatus(currentUserId, profileUserId);
    const lastPostId = user.comments.length === POSTS_PER_PAGE ? user.comments[user.comments.length - 1].id : null;
    res
        .status(200)
        .render("profileComments", { title: "Profile", user, reqUser: req.user, isCurrentUserFollowing, lastPostId });
}));
exports.getProfileLikes = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        include: {
            postLikes: {
                orderBy: { createdAt: "desc" },
                include: {
                    post: {
                        include: {
                            likes: {
                                where: {
                                    userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1,
                                },
                            },
                            reposts: {
                                where: {
                                    userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1,
                                },
                            },
                            user: { select: { id: true, username: true, usertag: true, image: true } },
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
                take: POSTS_PER_PAGE,
            },
            commentLikes: {
                orderBy: { createdAt: "desc" },
                include: {
                    comment: {
                        include: {
                            likes: { where: { userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1 } },
                            user: { select: { id: true, username: true, usertag: true, image: true } },
                            post: {
                                select: {
                                    likes: { where: { userId: currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1 } },
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
                take: POSTS_PER_PAGE,
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
    const allLikes = [
        ...user.postLikes.map((like) => (Object.assign(Object.assign({}, like), { type: "post", createdAt: like.createdAt, id: like.id }))),
        ...user.commentLikes.map((like) => (Object.assign(Object.assign({}, like), { type: "comment", createdAt: like.createdAt, id: like.id }))),
    ];
    allLikes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const paginatedLikes = allLikes.slice(0, POSTS_PER_PAGE);
    const lastPostId = paginatedLikes.length === POSTS_PER_PAGE ? paginatedLikes[paginatedLikes.length - 1].id : null;
    const isCurrentUserFollowing = yield checkFollowStatus(currentUserId, profileUserId);
    res.status(200).render("profileLikes", {
        title: "Profile",
        user: Object.assign(Object.assign({}, user), { allLikes: paginatedLikes }),
        reqUser: req.user,
        isCurrentUserFollowing,
        lastPostId,
    });
}));
exports.getProfileReposts = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const profileUserId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!profileUserId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: Number(profileUserId) },
        include: {
            postReposts: {
                orderBy: { createdAt: "desc" },
                include: {
                    post: {
                        include: {
                            user: { select: { id: true, username: true, usertag: true, image: true } },
                            likes: {
                                where: {
                                    userId: profileUserId !== null && profileUserId !== void 0 ? profileUserId : -1,
                                },
                            },
                            reposts: {
                                where: {
                                    userId: profileUserId !== null && profileUserId !== void 0 ? profileUserId : -1,
                                },
                            },
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
                take: POSTS_PER_PAGE,
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
    const isCurrentUserFollowing = yield checkFollowStatus(currentUserId, profileUserId);
    const lastPostId = user.postReposts.length === POSTS_PER_PAGE ? user.postReposts[user.postReposts.length - 1].id : null;
    res
        .status(200)
        .render("profileReposts", { title: "Profile", user, reqUser: req.user, isCurrentUserFollowing, lastPostId });
}));
exports.getProfileFollowers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            usertag: true,
            image: true,
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
                    image: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const followersWithFollowStatus = yield Promise.all(followers.map((follow) => __awaiter(void 0, void 0, void 0, function* () {
        return (Object.assign(Object.assign({}, follow), { isFollowing: yield checkFollowStatus(currentUserId, follow.follower.id) }));
    })));
    res.status(200).render("followers", {
        title: `People following ${user.username}`,
        user,
        followers: followersWithFollowStatus,
        reqUser: req.user,
    });
}));
exports.getProfileFollowing = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.params.id);
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("No profile ID found", 400, true));
    }
    if (!currentUserId) {
        return next(new appError_1.default("Authentication required", 401, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            usertag: true,
            image: true,
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
                    image: true,
                    bio: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    const followingWithFollowStatus = yield Promise.all(following.map((follow) => __awaiter(void 0, void 0, void 0, function* () {
        return (Object.assign(Object.assign({}, follow), { isFollowing: yield checkFollowStatus(currentUserId, follow.following.id) }));
    })));
    res.status(200).render("following", {
        title: `People followed by ${user.username}`,
        user,
        following: followingWithFollowStatus,
        reqUser: req.user,
    });
}));
const getWelcome = (req, res) => {
    res.status(200).render("index", { title: "Welcome" });
};
exports.getWelcome = getWelcome;
const getLoginForm = (req, res) => {
    res.status(200).render("login", { title: "Login" });
};
exports.getLoginForm = getLoginForm;
const getRegisterForm = (req, res) => {
    res.status(200).render("register", { title: "Register" });
};
exports.getRegisterForm = getRegisterForm;
const getAbout = (req, res) => {
    res.status(200).render("about", {
        title: "About Us",
        user: req.user,
    });
};
exports.getAbout = getAbout;
const getTerms = (req, res) => {
    res.status(200).render("terms", {
        title: "Terms, Privacy, and Cookies",
        user: req.user,
    });
};
exports.getTerms = getTerms;
