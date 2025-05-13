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
exports.markAllNotificationsRead = exports.getUnreadNotifications = exports.getNotifications = exports.getMessageUnreadCount = exports.getUnreadCount = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
exports.getUnreadCount = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const unreadCount = yield prismaClient_1.default.notification.count({
        where: {
            recipientId: userId,
            read: false,
        },
    });
    res.status(200).json({ status: "success", unreadCount });
}));
exports.getMessageUnreadCount = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const unreadMessageCount = yield prismaClient_1.default.notification.count({
        where: {
            recipientId: userId,
            type: "MESSAGE",
            read: false,
        },
    });
    res.status(200).json({ status: "success", unreadMessageCount });
}));
exports.getNotifications = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const notifications = yield prismaClient_1.default.notification.findMany({
        orderBy: { createdAt: "desc" },
        where: { recipientId: userId },
        select: {
            createdAt: true,
            type: true,
            read: true,
            sender: { select: { username: true, usertag: true } },
            comment: { select: { text: true } },
        },
    });
    res.status(200).json({ status: "success", notifications });
}));
exports.getUnreadNotifications = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        return res.status(401).json({ status: "error", message: "Authentication required" });
    }
    const notifications = yield prismaClient_1.default.notification.findMany({
        orderBy: { createdAt: "desc" },
        where: { recipientId: userId, read: false },
        select: { createdAt: true, type: true, read: true, sender: { select: { username: true, usertag: true } } },
    });
    res.status(200).json({ status: "success", notifications });
}));
exports.markAllNotificationsRead = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId)
        return next(new appError_1.default("User not found", 401, true));
    yield prismaClient_1.default.notification.updateMany({
        where: {
            recipientId: userId,
            read: false,
        },
        data: {
            read: true,
        },
    });
    res.status(200).json({ status: "success", message: "All notifications marked as read" });
}));
