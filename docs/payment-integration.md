# Razorpay Payment Gateway Integration Guide

This document details the complete Razorpay integration architecture implemented in **The Print Factory**, including domestic UPI, dynamic QR codes, international card payments, server-side Orders API, cryptographic signature verification, and webhook handling.

---

## 1. Overview & Merchant Profile

- **Merchant Payment Profile:** [https://razorpay.me/@meiyarasan](https://razorpay.me/@meiyarasan)
- **Primary Integration:** Razorpay Standard Checkout with Server-Created Orders
- **Fallback Integration:** Merchant profile payment link for manual reconciliation
- **Supported Payment Methods:**
  - **India (Domestic):** UPI (Intent, Apps, Dynamic QR), Cards (RuPay, Visa, Mastercard), Net Banking
  - **International:** Cards (Visa, Mastercard, American Express), international currencies (USD, EUR, GBP, CAD, AUD, JPY)

---

## 2. Server-Side Payment Flow

```
Customer clicks "Proceed to Checkout" / "Buy Now"
                     │
                     ▼
  POST /api/orders/create (Order Engine)
  • Server retrieves official product prices from DB
  • Validates currency & calculates final authoritative amount
  • Creates internal Order in PENDING status
  • Calls Razorpay Orders API (orders.create)
                     │
                     ▼
  Client receives { razorpayOrderId, amount, currency, keyId }
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
Standard Razorpay Modal      Dynamic UPI QR Modal
(International / Domestic)   (India / UPI eligible)
       │                           │
       ▼                           ▼
Customer pays via Card/UPI   Customer scans UPI QR (GPay/PhonePe)
       │                           │
       └─────────────┬─────────────┘
                     ▼
  POST /api/payments/verify
  • Server computes HMAC-SHA256(order_id + "|" + payment_id, secret)
  • Verifies payment signature authenticity
  • Transitions Order status to PAID
  • Generates secure Download records for purchased STL/ZIP files
                     │
                     ▼
  Redirect to /payment/success?orderId={id}
  • Customer receives authenticated, signed download access
```

---

## 3. Required Environment Variables

Set the following in `.env` (or Vercel Environment Variables):

```bash
# Razorpay Credentials (from Razorpay Dashboard -> Settings -> API Keys)
RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
RAZORPAY_KEY_SECRET="YourTestKeySecret"
RAZORPAY_WEBHOOK_SECRET="YourCustomWebhookSecret"

# Application Base URL
NEXT_PUBLIC_APP_URL="https://The Print Factory.vercel.app"
```

> **Security Rule:** Never prefix `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` with `NEXT_PUBLIC_`. These must remain strictly server-side.

---

## 4. API Endpoints

### 1. Create Order: `POST /api/orders/create`
- **Authentication:** Optional for guest checkout, recommended with user session.
- **Request Body:**
  ```json
  {
    "customerName": "John Maker",
    "customerEmail": "john@example.com",
    "customerCountry": "United States",
    "customerPhone": "+1234567890",
    "currency": "USD",
    "items": [{ "productId": "dock-01", "quantity": 1 }]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "orderId": "order_clx...",
    "orderNumber": "STL-1731737400-ABCD",
    "razorpayOrderId": "order_P123456789",
    "amount": 999,
    "currency": "USD",
    "keyId": "rzp_test_..."
  }
  ```

### 2. Verify Payment: `POST /api/payments/verify`
- **Request Body:**
  ```json
  {
    "orderId": "order_clx...",
    "razorpayOrderId": "order_P123456789",
    "razorpayPaymentId": "pay_P987654321",
    "razorpaySignature": "3d9f1a..."
  }
  ```
- **Verification Logic:**
  ```typescript
  import crypto from "crypto";

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("Invalid payment signature");
  }
  ```

### 3. Webhook Listener: `POST /api/webhooks/razorpay`
- **Header:** `x-razorpay-signature`
- **Supported Events:**
  - `payment.captured`
  - `order.paid`
- **Idempotency:** Checks whether order is already marked `PAID` before processing downloads or triggering confirmation emails.

---

## 5. Dynamic UPI QR Implementation

For eligible Indian transactions in INR (`currency === "INR"`):
1. The checkout interface generates a dynamic UPI payment string:
   ```
   upi://pay?pa=meiyarasan@razorpay&pn=The Print Factory&am=499.00&cu=INR&tn=Order STL-1731737400
   ```
2. Renders a scannable dynamic QR code in `UPIQRCodeModal.tsx` using `qrcode` library.
3. Automatically polls or listens for completion callback to unlock files seamlessly upon bank clearance.

---

## 6. International Currency Handling

Razorpay accepts currencies based on merchant account activation. The system uses fractional sub-units:
- **INR, USD, EUR, GBP, CAD, AUD:** Multiplied by 100 (e.g. \$9.99 $\rightarrow$ 999 cents).
- **JPY:** Multiplied by 1 (no decimal sub-unit).

Prices are pulled directly from the `ProductPrice` database records configured by admin, preventing client-side price tampering.
