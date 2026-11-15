import { PrismaClient } from "@prisma/client";
import net from "net";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var isDbOnline: boolean | undefined;
  // eslint-disable-next-line no-var
  var lastDbProbe: number | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Fast connectivity probe to verify if PostgreSQL host/port is reachable.
 * Caches status for 30s so requests never hang on TCP connection timeouts.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  const now = Date.now();
  if (typeof global.isDbOnline === "boolean" && global.lastDbProbe && now - global.lastDbProbe < 30000) {
    return global.isDbOnline;
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl || dbUrl.includes("placeholder")) {
    global.isDbOnline = false;
    global.lastDbProbe = now;
    return false;
  }

  try {
    const sanitizedUrl = dbUrl.replace(/^postgresql:\/\//i, "http://").replace(/^postgres:\/\//i, "http://");
    const parsed = new URL(sanitizedUrl);
    const host = parsed.hostname || "localhost";
    const port = parseInt(parsed.port || "5432", 10);

    const isAvailable = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ host, port, timeout: 150 });
      socket.on("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });
    });

    global.isDbOnline = isAvailable;
    global.lastDbProbe = now;
    return isAvailable;
  } catch (e) {
    global.isDbOnline = false;
    global.lastDbProbe = now;
    return false;
  }
}

export default prisma;
