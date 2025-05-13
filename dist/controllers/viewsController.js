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
const POSTS_PER_PAGE = 20;
exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert) {
        res.locals.alert = alert;
    }
    next();
};
exports.getHome = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const posts = yield prismaClient_1.default.post.findMany({
        take: POSTS_PER_PAGE,
        include: {
            user: { select: { id: true, username: true, usertag: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } },
            reposts: { where: { userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id } },
        },
        orderBy: {
            id: "desc",
        },
    });
    const lastPostId = posts.length === POSTS_PER_PAGE ? posts[posts.length - 1].id : null;
    res.status(200).render("feed", { title: "Feed", posts, reqUser: req.user, lastPostId });
}));
exports.getMorePosts = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    if (!cursor) {
        return res.status(200).json({ status: "success", data: { posts: [], nextCursor: null } });
    }
    const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const posts = yield prismaClient_1.default.post.findMany({
        take: POSTS_PER_PAGE,
        skip: 1,
        cursor: { id: cursor },
        include: {
            user: { select: { id: true, username: true, usertag: true } },
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
        },
        orderBy: {
            id: "desc",
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
exports.getNotifs = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("Enter a valid user ID", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        include: {
            posts: true,
            comments: true,
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    res.status(200).render("notifications", { title: "Nofications", user, reqUser: req.user });
}));
exports.getMessages = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return next(new appError_1.default("Enter a valid user ID", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: userId },
        include: {
            posts: true,
            comments: true,
        },
    });
    if (!user) {
        return next(new appError_1.default("User not found", 404, true));
    }
    res.status(200).render("messages", { title: "Messages", user, reqUser: req.user });
}));
exports.getWelcome = (req, res) => {
    res.status(200).render("index", { title: "Welcome" });
};
exports.getLoginForm = (req, res) => {
    res.status(200).render("login", { title: "Login" });
};
exports.getRegisterForm = (req, res) => {
    res.status(200).render("register", { title: "Register" });
};
