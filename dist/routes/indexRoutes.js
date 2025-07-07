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
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const commentRoutes_1 = __importDefault(require("./commentRoutes"));
const feedRoutes_1 = __importDefault(require("./feedRoutes"));
const fileRoutes_1 = __importDefault(require("./fileRoutes"));
const messageRoutes_1 = __importDefault(require("./messageRoutes"));
const notificationRoutes_1 = __importDefault(require("./notificationRoutes"));
const postRoutes_1 = __importDefault(require("./postRoutes"));
const searchRoutes_1 = __importDefault(require("./searchRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const viewRoutes_1 = __importDefault(require("./viewRoutes"));
const viewController_1 = require("../controllers/viewController");
const suggestions_1 = require("../middlewares/suggestions");
const latest_1 = require("../middlewares/latest");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const rateLimit_1 = require("../middlewares/rateLimit");
const router = (0, express_1.Router)();
router.get("/health", rateLimit_1.limiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prismaClient_1.default.keepAlive.upsert({
            where: { id: 1 },
            update: { lastPing: new Date() },
            create: { id: 1 },
        });
        res.status(200).json({ status: "Health check success", result });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({ status: "error", message: "Database ping failed" });
    }
}));
router.use(viewController_1.alerts);
router.use("/authentication", authRoutes_1.default);
router.use("/", viewRoutes_1.default);
router.use("/files", fileRoutes_1.default);
router.use(suggestions_1.addSuggestions);
router.use(latest_1.addLatestFromFollowing);
router.use("/api/comments", commentRoutes_1.default);
router.use("/api/feed", feedRoutes_1.default);
router.use("/api/messages", messageRoutes_1.default);
router.use("/api/notifications", notificationRoutes_1.default);
router.use("/api/posts", postRoutes_1.default);
router.use("/api/search", searchRoutes_1.default);
router.use("/api/profile", userRoutes_1.default);
exports.default = router;
