import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { getAllLocalDevOrders } from "@/lib/database/userStore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const dbOnline = await isDatabaseReachable();
    if (dbOnline) {
      try {
        const where: any = {};
        if (status) {
          where.paymentStatus = status;
        }
        if (search) {
          where.OR = [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customerEmail: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
          ];
        }

        const orders = await prisma.order.findMany({
          where,
          include: {
            items: true,
            payments: true,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        });

        if (orders.length > 0) {
          return NextResponse.json({ orders });
        }
      } catch (err) {
        console.warn("Prisma orders query error:", err);
      }
    }

    let devOrders = getAllLocalDevOrders();
    if (status) {
      devOrders = devOrders.filter((o) => o.paymentStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      devOrders = devOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ orders: devOrders });
  } catch (err: any) {
    return NextResponse.json({ orders: [] });
  }
}
