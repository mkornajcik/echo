import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    // Issue a trivial query
    await prisma.$queryRaw`SELECT 1;`;
    console.log("Ping successful: SELECT 1 returned.");
  } catch (error) {
    console.error("Ping failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
