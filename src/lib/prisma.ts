import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database probe timeout")), 4000)
    );
    await Promise.race([probe, timeout]);
    return true;
  } catch (error) {
    console.warn("Database connection probe notice:", error);
    return false;
  }
}