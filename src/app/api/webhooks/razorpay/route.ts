import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay/client";
import prisma from "@/lib/database/prisma";
import { markOrderPaidAndGenerateDownloads } from "@/lib/database/orders";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.error("Razorpay webhook signature mismatch");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log(`🔔 Razorpay Webhook Event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ received: true });
      }

      // Find internal order by razorpayOrderId
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId },
      });

      if (order && order.paymentStatus !== "PAID") {
        await markOrderPaidAndGenerateDownloads({
          orderId: order.id,
          razorpayPaymentId,
          razorpaySignature: signature,
          paymentMethod: paymentEntity?.method || "Razorpay Webhook",
        });
        console.log(`✅ Order ${order.orderNumber} successfully marked as PAID via Webhook.`);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId, paymentStatus: "PENDING" },
          data: { paymentStatus: "FAILED" },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

