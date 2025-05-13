"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const indexRoutes_1 = __importDefault(require("./routes/indexRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const appError_1 = __importDefault(require("./utils/appError"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
const formatTime_1 = __importDefault(require("./middlewares/formatTime"));
const helmet_1 = __importDefault(require("helmet"));
const crypto_1 = __importDefault(require("crypto"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.use(formatTime_1.default);
app.use((req, res, next) => {
    const nonce = crypto_1.default.randomBytes(16).toString("base64");
    res.locals.nonce = nonce;
    helmet_1.default.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdn.socket.io", `'nonce-${nonce}'`],
            "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "font-src": ["'self'", "https://cdnjs.cloudflare.com", "data:"],
            "img-src": [
                "'self'",
                "data:",
                "https://echouploadsbucket.s3.eu-north-1.amazonaws.com",
                "https://echo-uploads-marko.s3.eu-north-1.amazonaws.com",
            ],
        },
    })(req, res, next);
});
app.use((0, hpp_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
else {
    app.use((0, morgan_1.default)("combined"));
}
app.use((0, cors_1.default)());
app.options("*", (0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/", indexRoutes_1.default);
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Cannot locate ${req.originalUrl} on this server!`, 404, true));
});
app.use(errorMiddleware_1.default);
exports.default = app;
