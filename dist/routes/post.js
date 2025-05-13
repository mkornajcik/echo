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
const express_1 = __importDefault(require("express"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.render("home", { title: "Home" });
});
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield prismaClient_1.default.post.findMany({
        where: {
            userId: req.userId,
        },
    });
    res.json(posts);
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    if (!req.userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    const post = yield prismaClient_1.default.post.create({
        data: {
            text,
            userId: req.userId,
            likes: 0,
            saves: 0,
        },
    });
    res.json(post);
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { text } = req.body;
    const updatedPost = yield prismaClient_1.default.post.update({
        where: { id: parseInt(id), userId: req.userId },
        data: { text },
    });
    res.json(updatedPost);
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedPost = yield prismaClient_1.default.post.delete({
        where: { id: parseInt(id), userId: req.userId },
    });
    res.json(deletedPost);
}));
exports.default = router;
