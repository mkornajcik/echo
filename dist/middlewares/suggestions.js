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
exports.addSuggestions = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const addSuggestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const customReq = req;
        const currentUserId = (_a = customReq.user) === null || _a === void 0 ? void 0 : _a.id;
        const suggestedUsers = yield prismaClient_1.default.$queryRaw `
      SELECT id, username, usertag, image
      FROM "User"
      WHERE id != ${currentUserId !== null && currentUserId !== void 0 ? currentUserId : -1}
      ORDER BY RANDOM()
      LIMIT 3
    `;
        res.locals.suggestedUsers = suggestedUsers;
    }
    catch (error) {
        console.error("Error fetching suggestions:", error);
        res.locals.suggestedUsers = [];
    }
    next();
});
exports.addSuggestions = addSuggestions;
