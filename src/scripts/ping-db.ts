import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();

router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", error: String(error) });
  }
});

export default router;
