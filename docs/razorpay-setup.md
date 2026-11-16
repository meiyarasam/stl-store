# Razorpay Production Setup & Integration Guide

This guide details how to configure **Razorpay Standard Checkout**, server-created Orders, dynamic UPI QR payments, and webhooks for **STLForge**.

---

## 1. Razorpay Account & API Keys

- **Merchant Profile:** [https://razorpay.me/@meiyarasan](https://razorpay.me/@meiyarasan)
- **Dashboard:** [https://dashboard.razorpay.com](https://dashboard.razorpay.com)

### Generating API Keys:
1. Log in to your Razorpay Dashboard.
2. For testing, toggle the switch in the top header to **Test Mode**. For production, stay in **Live Mode**.
3. Navigate to **Account & Settings** > **API Keys** (under *Website and app settings*).
4. Click **Generate Key**.
5. Save the credentials securely:
   - **Key ID:** Starts with `rzp_test_...` (or `rzp_live_...`).
   - **Key Secret:** 24+ character secret string (shown only once).

---

## 2. Webhook Configuration

Webhooks ensure that payment events (especially UPI payments where the customer might close their browser before callback) automatically mark the order as `PAID` and unlock digital files.

1. In Razorpay Dashboard, go to **Account & Settings** > **Webhooks**.
2. Click **+ Add New Webhook**.
3. Configure the following fields:
   - **Webhook URL:** `https://your-domain.vercel.app/api/webhooks/razorpay`
   - **Secret:** Enter a custom random string (e.g. 32 characters). Copy this value into `RAZORPAY_WEBHOOK_SECRET`.
   - **Alert Email:** Your admin email.
   - **Active Events:** Check:
     - `payment.captured`
     - `order.paid`
     - `payment.failed`
4. Click **Create Webhook**.

---

## 3. Server-Side Order & Payment Architecture

STLForge never charges amounts calculated solely on the client. The payment process follows strict server-side validation:

```
1. Customer clicks "Checkout"
           │
           ▼
2. POST /api/orders/create
   - Server calculates authoritative subtotal from database
   - Converts amount to sub-units (cents/paise)
   - Creates internal Order (PENDING)
   - Calls Razorpay Orders API (orders.create)
           │
           ▼
3. Frontend opens Razorpay Checkout modal
   - Indian customers: UPI / Cards / Net Banking
   - International customers: Visa / Mastercard / Amex
           │
           ▼
4. POST /api/payments/verify
   - Computes HMAC-SHA256: crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')
   - Confirms signature matches razorpay_signature
   - Updates order to PAID in PostgreSQL
   - Automatically generates Download tokens with 300s TTL
```

---

## 4. International Payments & KYC Requirements

### International Currencies Supported:
- `INR`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`

### Important Activation Note:
By default, Razorpay accounts can accept domestic Indian transactions (UPI, Indian debit/credit cards). To accept payments from customers in the US, Europe, UK, and worldwide:
1. Navigate to **Account & Settings** > **International Payments**.
2. Complete the International Payments questionnaire (specify digital goods / 3D CAD STL files).
3. Submit required business verification documents (Passport / PAN, Bank statement).
4. Once activated by Razorpay compliance, international credit and debit cards will automatically process through the standard checkout modal.

---

## 5. Personal Payment Profile Fallback

If an international buyer experiences bank card declines, the website retains your personal Razorpay link:
- **Link:** `https://razorpay.me/@meiyarasan`
- An administrator can manually verify payment receipts in the **Admin Orders** dashboard (`/admin/orders`) and update order status.
