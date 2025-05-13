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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const router = express_1.default.Router();
router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});
router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, usertag } = req.body;
    const hashedPass = bcryptjs_1.default.hashSync(password, 8);
    try {
        const user = yield prismaClient_1.default.user.create({
            data: {
                username,
                password: hashedPass,
                usertag,
            },
        });
        if (process.env.JWT_SECRET) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "24h" });
            res.cookie("token", token, { httpOnly: true });
        }
        return res.redirect("/");
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(503);
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield prismaClient_1.default.user.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const validPass = bcryptjs_1.default.compareSync(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: "Invalid password." });
        }
        if (process.env.JWT_SECRET) {
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "24h" });
            res.cookie("token", token, { httpOnly: true });
        }
        return res.redirect("/");
    }
    catch (err) {
        console.error(err);
        return res.sendStatus(503);
    }
}));
exports.default = router;
