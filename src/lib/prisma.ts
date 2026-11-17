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

let lastProbeTime = 0;
let lastProbeResult = false;
const PROBE_CACHE_TTL = 30000; // Cache reachability for 30s to avoid redundant round trips

export async function isDatabaseReachable(): Promise<boolean> {
  const now = Date.now();
  if (lastProbeResult && now - lastProbeTime < PROBE_CACHE_TTL) {
    return true;
  }
  try {
    const probe = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database probe timeout")), 3000)
    );
    await Promise.race([probe, timeout]);
    lastProbeTime = Date.now();
    lastProbeResult = true;
    return true;
  } catch (error) {
    console.warn("Database connection probe notice:", error);
    lastProbeResult = false;
    return false;
  }
}