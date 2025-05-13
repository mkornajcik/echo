"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (req, res, next) => {
    res.locals.formatTime = (createdAt) => {
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        if (diffSeconds < 60) {
            return `${diffSeconds}s ago`;
        }
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        }
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24) {
            return `${diffHours}h ago`;
        }
        return createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    next();
};
