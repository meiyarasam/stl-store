import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma, { isDatabaseReachable } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const { searchParams } = new URL(req.url);
    const guestToken = searchParams.get("guestToken");

    const dbOnline = await isDatabaseReachable();
    if (!dbOnline || (!userId && !guestToken)) {
      return NextResponse.json({ items: [], count: 0, subtotal: 0 });
    }

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestToken: guestToken || undefined },
      include: {
        items: {
          include: {
            product: {
              include: {
                prices: true,
                images: { where: { isPrimary: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], count: 0, subtotal: 0 });
    }

    return NextResponse.json({
      id: cart.id,
      currency: cart.currency,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          prices: item.product.prices,
          primaryImage: item.product.images[0]?.url,
        },
      })),
      count: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (err: any) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const body = await req.json();
    const { productId, quantity = 1, guestToken, currency = "USD" } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const dbOnline = await isDatabaseReachable();
    if (!dbOnline) {
      return NextResponse.json({ success: true, message: "Cart updated locally" });
    }

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestToken: guestToken || undefined },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          guestToken: userId ? null : guestToken || `guest_${Date.now()}`,
          currency,
        },
      });
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: 1, // Digital products: default 1
      },
      create: {
        cartId: cart.id,
        productId,
        quantity: 1,
      },
    });

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (err: any) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const guestToken = searchParams.get("guestToken");

    const dbOnline = await isDatabaseReachable();
    if (!dbOnline) {
      return NextResponse.json({ success: true });
    }

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestToken: guestToken || undefined },
    });

    if (!cart) {
      return NextResponse.json({ success: true });
    }

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
