import Razorpay from "razorpay";
import crypto from "crypto";
import { CurrencyCode } from "@/types";
import { toRazorpaySubunits } from "@/lib/currency/currencies";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
export const MERCHANT_PROFILE_URL = process.env.NEXT_PUBLIC_MERCHANT_PROFILE_URL || "https://razorpay.me/@meiyarasan";

export const isRazorpayConfigured = Boolean(
  razorpayKeyId &&
  razorpayKeySecret &&
  !razorpayKeyId.includes("placeholder") &&
  !razorpayKeySecret.includes("placeholder")
);

// Instantiate Razorpay SDK instance
export const razorpay = isRazorpayConfigured
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

/**
 * Creates a Razorpay Order server-side
 */
export async function createRazorpayOrder({
  amount,
  currency,
  receipt,
  notes = {},
}: {
  amount: number;
  currency: CurrencyCode;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isMock?: boolean;
}> {
  const amountSubunits = toRazorpaySubunits(amount, currency);

  if (isRazorpayConfigured && razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amountSubunits,
        currency: currency.toUpperCase(),
        receipt: receipt.slice(0, 40), // Razorpay limits receipt to 40 chars
        notes: {
          ...notes,
          platform: "STLForge",
          merchantProfile: MERCHANT_PROFILE_URL,
        },
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || receipt,
        status: order.status,
      };
    } catch (err: any) {
      console.error("Razorpay order creation failed:", err);
      throw new Error(err?.error?.description || err.message || "Failed to create Razorpay Order");
    }
  }

  // Development / Test mode fallback when using sandbox placeholders
  console.warn("⚠️ Razorpay keys not configured or using placeholders. Using test sandbox order ID.");
  const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: mockOrderId,
    amount: amountSubunits,
    currency: currency.toUpperCase(),
    receipt,
    status: "created",
    isMock: true,
  };
}

/**
 * Verifies Razorpay Payment Signature
 */
export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!isRazorpayConfigured) {
    // In local dev test mode, accept matching test format if not in production
    if (process.env.NODE_ENV !== "production" && (orderId.startsWith("order_test_") || signature.startsWith("sig_test_"))) {
      return true;
    }
  }

  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(text)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch (err) {
    console.error("Error verifying payment signature:", err);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook Signature
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!razorpayWebhookSecret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", razorpayWebhookSecret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch (err) {
    console.error("Error verifying webhook signature:", err);
    return false;
  }
}

/**
 * Generates UPI dynamic payment payload / intent string for QR code
 */
export function generateUPIString({
  merchantVpa = "meiyarasan@razorpay",
  merchantName = "STLForge - Meiyarasan",
  orderId,
  amount,
  currency = "INR",
}: {
  merchantVpa?: string;
  merchantName?: string;
  orderId: string;
  amount: number;
  currency?: string;
}): string {
  const note = encodeURIComponent(`STLForge Order ${orderId}`);
  const pn = encodeURIComponent(merchantName);
  return `upi://pay?pa=${merchantVpa}&pn=${pn}&tr=${orderId}&am=${amount.toFixed(2)}&cu=${currency}&tn=${note}`;
}
