import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { getAllLocalDevUsers } from "@/lib/database/userStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const dbOnline = await isDatabaseReachable();
    if (dbOnline) {
      try {
        const customers = await prisma.user.findMany({
          where: { role: "CUSTOMER" },
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
            phone: true,
            phoneCountryCode: true,
            isBlocked: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                downloads: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (customers.length > 0) {
          return NextResponse.json({ customers });
        }
      } catch (err) {
        console.warn("Prisma customers error:", err);
      }
    }

    const devUsers = getAllLocalDevUsers().filter((u) => u.role === "CUSTOMER");
    return NextResponse.json({
      customers: devUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        country: u.country,
        phone: u.phone,
        phoneCountryCode: u.phoneCountryCode,
        isBlocked: !!u.isBlocked,
        createdAt: u.createdAt,
        _count: { orders: 1, downloads: 2 },
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ customers: [] });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, isBlocked } = body;

    const dbOnline = await isDatabaseReachable();
    if (dbOnline) {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isBlocked },
        select: { id: true, email: true, isBlocked: true },
      });
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: true, user: { id: userId, isBlocked } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
