import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { checkoutSchema } from "@/lib/validation/schemas";
import { createPendingOrder, attachRazorpayOrderId } from "@/lib/database/orders";
import { createRazorpayOrder, generateUPIString, MERCHANT_PROFILE_URL } from "@/lib/razorpay/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Account required: Please create an account or sign in before placing an order.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const validated = checkoutSchema.parse(body);

    const userEmail = session.user.email || validated.customerEmail;
    const userId = (session.user as any)?.id || null;

    // 1. Create internal pending order with authoritative pricing
    const { order, internalId, amount, currency } = await createPendingOrder({
      userId,
      customerEmail: userEmail,
      customerName: validated.customerName || session.user?.name || "Valued Customer",
      customerPhone: validated.customerPhone,
      customerCountry: validated.customerCountry,
      currency: validated.currency,
      items: validated.items,
      couponCode: validated.couponCode,
    });

    // 2. Call Razorpay Orders API
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amount,
        currency,
        receipt: `rcpt_${internalId.slice(-14)}`,
        notes: {
          internalOrderId: internalId,
          orderNumber: order.orderNumber,
          customerEmail: validated.customerEmail,
          customerCountry: validated.customerCountry,
        },
      });

      // Update order with razorpayOrderId
      await attachRazorpayOrderId(internalId, razorpayOrder.id);
    } catch (razorpayErr: any) {
      console.error("Razorpay order creation error:", razorpayErr);
      return NextResponse.json(
        { error: razorpayErr.message || "Failed to initiate payment gateway" },
        { status: 502 }
      );
    }

    // 3. Generate UPI QR data if applicable (INR and Indian customer)
    let upiString: string | null = null;
    if (currency === "INR" || validated.customerCountry === "India" || validated.customerCountry === "IN") {
      upiString = generateUPIString({
        merchantName: "The Print Factory - Digital 3D",
        orderId: order.orderNumber,
        amount,
        currency: "INR",
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: internalId,
        orderNumber: order.orderNumber,
        amount,
        currency,
        subtotal: order.subtotal,
        total: order.total,
      },
      razorpay: {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
        orderId: razorpayOrder.id,
        amountSubunits: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        isMock: razorpayOrder.isMock || false,
      },
      upi: upiString
        ? {
            intentUrl: upiString,
            amount,
          }
        : null,
      merchantProfileUrl: MERCHANT_PROFILE_URL,
    });
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("POST /api/orders/create error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error while processing order" },
      { status: 500 }
    );
  }
}

