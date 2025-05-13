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
exports.processImage = processImage;
exports.processAvatar = processAvatar;
exports.processCover = processCover;
exports.processMessage = processMessage;
const sharp_1 = __importDefault(require("sharp"));
function processImage(_a) {
    return __awaiter(this, arguments, void 0, function* ({ buffer, width = 500, height = 500, quality = 80, format = "jpeg", }) {
        return (0, sharp_1.default)(buffer)
            .rotate()
            .resize(width, height, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .toFormat(format, { quality })
            .toBuffer();
    });
}
function processAvatar(_a) {
    return __awaiter(this, arguments, void 0, function* ({ buffer, width = 200, height = 200, quality = 90, format = "jpeg", }) {
        return (0, sharp_1.default)(buffer)
            .rotate()
            .resize(width, height, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .toFormat(format, { quality })
            .toBuffer();
    });
}
function processCover(_a) {
    return __awaiter(this, arguments, void 0, function* ({ buffer, width = 600, height = 200, quality = 80, format = "jpeg", }) {
        return (0, sharp_1.default)(buffer)
            .rotate()
            .resize(width, height, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .toFormat(format, { quality })
            .toBuffer();
    });
}
function processMessage(_a) {
    return __awaiter(this, arguments, void 0, function* ({ buffer, width = 500, height = 500, quality = 80, format = "jpeg", }) {
        return (0, sharp_1.default)(buffer)
            .rotate()
            .resize(width, height, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .toFormat(format, { quality })
            .toBuffer();
    });
}
