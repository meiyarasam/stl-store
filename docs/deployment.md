# STLForge — Vercel Production Deployment Guide

This guide provides end-to-end instructions for deploying the **STLForge** international digital marketplace to [Vercel](https://vercel.com).

---

## 1. Prerequisites

Before deploying, ensure you have:
1. A **GitHub account** with access to your repository: [https://github.com/meiyarasam/stl-store](https://github.com/meiyarasam/stl-store).
2. A **Vercel account** connected to GitHub.
3. A **Supabase PostgreSQL database** (free tier supported with transaction pooling).
4. A **Razorpay merchant account**: [https://razorpay.me/@meiyarasan](https://razorpay.me/@meiyarasan).
5. A **Resend account** (for transactional emails).

---

## 2. Database Setup on Supabase

1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to **Project Settings** > **Database** > **Connection String**.
3. Copy the **Transaction Pooler** connection string (port `6543`) for `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
4. Copy the **Session / Direct** connection string (port `5432`) for `DIRECT_URL`:
   ```env
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```
5. Apply database schema migrations from your local terminal:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

---

## 3. Storage Setup on Supabase

1. Navigate to **Storage** in your Supabase dashboard.
2. Create two buckets:
   - **`stl-files-private`**: Private bucket (toggle **Public bucket** OFF) for original `.stl`, `.zip`, `.3mf` files.
   - **`stl-images-public`**: Public bucket (toggle **Public bucket** ON) for rendered thumbnail imagery.
3. Obtain your Project URL and Service Role Key from **Project Settings** > **API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Vercel Project Import & Configuration

1. In the Vercel dashboard, click **Add New** > **Project**.
2. Select your repository `meiyarasam/stl-store`.
3. In **Framework Preset**, select **Next.js**.
4. In **Build & Development Settings**, keep defaults:
   - **Build Command:** `npm run build` (or `next build`)
   - **Output Directory:** `.next`
   - **Install Command:** `npm install` (Vercel automatically runs the `"postinstall": "prisma generate"` script defined in `package.json`).

---

## 5. Environment Variables Configuration on Vercel

Under **Environment Variables**, add the following production variables:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Canonical production URL | `https://stlforge.vercel.app` |
| `DATABASE_URL` | Supabase PgBouncer Pooler URL | `postgresql://postgres.[ref]:[pwd]@pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Connection URL | `postgresql://postgres.[ref]:[pwd]@pooler.supabase.com:5432/postgres` |
| `AUTH_SECRET` | NextAuth JWT secret | Random 32+ character string (`openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | NextAuth fallback secret | Same as `AUTH_SECRET` |
| `NEXTAUTH_URL` | NextAuth canonical callback | `https://stlforge.vercel.app` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | From Razorpay API Keys dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for webhook verification | Configured in Razorpay Webhooks |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-accessible Razorpay Key ID | Same as `RAZORPAY_KEY_ID` |
| `NEXT_PUBLIC_MERCHANT_PROFILE_URL` | Personal payment fallback link | `https://razorpay.me/@meiyarasan` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase Anon Key | From Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Supabase Service Key | From Supabase API settings |
| `SUPABASE_STORAGE_BUCKET_PRIVATE` | Private STL bucket name | `stl-files-private` |
| `SUPABASE_STORAGE_BUCKET_PUBLIC` | Public preview images bucket | `stl-images-public` |
| `RESEND_API_KEY` | Resend API Key | `re_...` from Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender email | `orders@yourdomain.com` |
| `ADMIN_DEFAULT_EMAIL` | Administrator login email | `admin@stlforge.com` |
| `ADMIN_DEFAULT_PASSWORD` | Administrator password | Secure custom password |

---

## 6. Razorpay Webhook Configuration

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** > **Webhooks** > **Add New Webhook**.
3. Set **Webhook URL**: `https://your-domain.vercel.app/api/webhooks/razorpay`
4. Set **Secret**: Same string entered for `RAZORPAY_WEBHOOK_SECRET`.
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. Click **Save Webhook**.

---

## 7. Post-Deployment Verification Checklist

1. [ ] **Homepage loads:** Check [https://your-domain.vercel.app](https://your-domain.vercel.app).
2. [ ] **Currency selector:** Switch between INR, USD, EUR, GBP, CAD, AUD, JPY and verify symbol/amounts update.
3. [ ] **Customer Registration:** Register an account on `/register` and verify redirect to `/account`.
4. [ ] **Admin Login:** Log into `/admin/login` using your configured admin credentials.
5. [ ] **Checkout Flow:** Add a model to cart, proceed to `/checkout`, and verify Razorpay standard modal / dynamic UPI QR loads.
6. [ ] **File Delivery:** Verify that upon confirmed purchase, a signed URL is generated with 300-second expiration.
