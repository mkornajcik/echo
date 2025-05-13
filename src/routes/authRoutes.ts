import { Router } from "express";
import { logout, login, register } from "../controllers/authController";
import { limiter } from "../middlewares/rateLimit";

const router = Router();

// Authentication
router.post("/register", limiter, register);
router.post("/login", limiter, login);
router.get("/logout", logout);

export default router;
