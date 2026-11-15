import { NextResponse } from "next/server";
import { paymentVerifySchema } from "@/lib/validation/schemas";
import { verifyRazorpaySignature } from "@/lib/razorpay/client";
import { markOrderPaidAndGenerateDownloads, getOrderById } from "@/lib/database/orders";
import { sendEmail, generateOrderConfirmationEmail } from "@/lib/email/resend";
import { formatPrice } from "@/lib/currency/currencies";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = paymentVerifySchema.parse(body);

    // 1. Verify Razorpay cryptographic signature
    const isValidSignature = verifyRazorpaySignature({
      orderId: validated.razorpayOrderId,
      paymentId: validated.razorpayPaymentId,
      signature: validated.razorpaySignature,
    });

    if (!isValidSignature) {
      console.error("Signature verification failed for payment:", validated.razorpayPaymentId);
      return NextResponse.json(
        { error: "Invalid payment signature. Authentication failed." },
        { status: 400 }
      );
    }

    // 2. Mark order as paid in the database and activate downloads
    const updatedOrder = await markOrderPaidAndGenerateDownloads({
      orderId: validated.orderId,
      razorpayPaymentId: validated.razorpayPaymentId,
      razorpaySignature: validated.razorpaySignature,
      paymentMethod: "Razorpay Standard Checkout",
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order record not found" },
        { status: 404 }
      );
    }

    // 3. Dispatch confirmation email asynchronously (never blocks response)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const downloadPageUrl = `${appUrl}/payment/success?orderId=${updatedOrder.id}`;

    sendEmail({
      to: updatedOrder.customerEmail,
      subject: `Order Confirmed: #${updatedOrder.orderNumber} - Your 3D Files Are Ready!`,
      html: generateOrderConfirmationEmail({
        customerName: updatedOrder.customerName,
        orderNumber: updatedOrder.orderNumber,
        items: updatedOrder.items.map((i) => ({
          title: i.productTitle,
          price: formatPrice(i.total, i.currency),
        })),
        total: formatPrice(updatedOrder.total, updatedOrder.currency),
        currency: updatedOrder.currency,
        downloadUrl: downloadPageUrl,
      }),
    }).catch((emailErr) => console.error("Error sending order confirmation email:", emailErr));

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and files unlocked.",
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      redirectUrl: `/payment/success?orderId=${updatedOrder.id}`,
    });
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("POST /api/payments/verify error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

