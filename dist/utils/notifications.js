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
exports.createNotification = createNotification;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appError_1 = __importDefault(require("./appError"));
function createNotification(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.recipientId === args.senderId) {
            return;
        }
        try {
            yield prismaClient_1.default.notification.create({
                data: {
                    recipientId: args.recipientId,
                    senderId: args.senderId,
                    type: args.type,
                    postId: args.postId,
                    commentId: args.commentId,
                    conversationId: args.conversationId,
                    read: false,
                },
            });
        }
        catch (error) {
            new appError_1.default("Notification fail", 400, true);
        }
    });
}
