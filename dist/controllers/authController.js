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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appError_1 = __importDefault(require("../utils/appError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync = require("../utils/catchAsync");
const signToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined.");
    }
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });
};
const createToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    if (!process.env.JWT_COOKIE_EXPIRES_IN) {
        throw new Error("JWT_COOKIE_EXPIRES_IN not defined.");
    }
    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    res.status(statusCode).json({ status: "success", token, data: { user: userWithoutPassword } });
};
exports.register = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, 12);
    const newUser = yield prismaClient_1.default.user.create({
        data: {
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            usertag: req.body.usertag,
        },
    });
    createToken(newUser, 201, res);
}));
exports.login = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new appError_1.default("Provide valid username and password", 400, true));
    }
    const user = yield prismaClient_1.default.user.findUnique({
        where: { username },
    });
    if (!user) {
        return next(new appError_1.default("Incorrect username or password", 401, true));
    }
    const validPassword = yield bcryptjs_1.default.compare(password, user.password);
    if (!validPassword) {
        return next(new appError_1.default("Incorrect username or password", 401, true));
    }
    createToken(user, 200, res);
}));
exports.logout = (req, res) => {
    res.cookie("jwt", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
exports.protect = catchAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new appError_1.default("You are not logged in. Please log in.", 401, true));
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined.");
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const currentUser = yield prismaClient_1.default.user.findUnique({
        where: { id: decoded.id },
    });
    if (!currentUser) {
        return next(new appError_1.default("The user belonging to this token no longer exists.", 401, true));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
}));
exports.isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.locals.user = null;
    if (req.cookies.jwt) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET not defined.");
            }
            const decoded = jsonwebtoken_1.default.verify(req.cookies.jwt, process.env.JWT_SECRET);
            const currentUser = yield prismaClient_1.default.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    username: true,
                    usertag: true,
                },
            });
            if (!currentUser) {
                return next();
            }
            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            res.clearCookie("jwt");
            return next();
        }
    }
    next();
});
