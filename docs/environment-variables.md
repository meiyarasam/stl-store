# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used by **The Print Factory** across local development, staging, and production on **Vercel**.

---

## 1. Quick Summary Table

| Variable | Required in Prod | Exposure | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public (Client & Server) | Canonical production domain URL (e.g. `https://stl-store.vercel.app`) |
| `DATABASE_URL` | **Yes** | Server-only | Supabase PostgreSQL Connection Pooler URL (port `6543`) |
| `DIRECT_URL` | **Yes** | Server-only | Supabase PostgreSQL Direct connection URL (port `5432`) for Prisma migrations |
| `AUTH_SECRET` | **Yes** | Server-only | Secret key used to encrypt and sign NextAuth/Auth.js JWT session tokens |
| `AUTH_URL` | **Yes** | Server-only | Canonical authentication base URL |
| `NEXTAUTH_URL` | **Yes** | Server-only | NextAuth canonical callback base URL |
| `NEXTAUTH_SECRET` | **Yes** | Server-only | Fallback secret matching `AUTH_SECRET` |
| `RAZORPAY_KEY_ID` | **Yes** | Server-only | Razorpay Live/Test Key ID from Dashboard |
| `RAZORPAY_KEY_SECRET` | **Yes** | Server-only | Razorpay Secret Key for Orders API & HMAC signature checks |
| `RAZORPAY_WEBHOOK_SECRET` | **Yes** | Server-only | Webhook signing secret configured in Razorpay Webhooks |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **Yes** | Public (Client) | Razorpay Key ID used by Standard Checkout modal on frontend |
| `NEXT_PUBLIC_MERCHANT_PROFILE_URL` | Optional | Public (Client) | Fallback personal payment link (`https://razorpay.me/@meiyarasan`) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Public (Client) | Supabase Project API URL (`https://[ref].supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public (Client) | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-only | Supabase privileged service role key for signing private STL download URLs |
| `SUPABASE_STORAGE_BUCKET_PRIVATE` | Optional | Server-only | Name of private STL bucket (defaults to `stl-files-private`) |
| `SUPABASE_STORAGE_BUCKET_PUBLIC` | Optional | Server-only | Name of public image previews bucket (defaults to `stl-images-public`) |
| `RESEND_API_KEY` | Optional | Server-only | Resend API key for transactional purchase emails |
| `RESEND_FROM_EMAIL` | Optional | Server-only | Verified sender email address (e.g. `The Print Factory <orders@yourdomain.com>`) |
| `ADMIN_DEFAULT_EMAIL` | Optional | Server-only | Default admin login email for initial setup (`admin@The Print Factory.com`) |
| `ADMIN_DEFAULT_PASSWORD` | Optional | Server-only | Default admin password for initial setup |

---

## 2. Detailed Category Breakdown

### A. Database (Supabase PostgreSQL & Prisma)
```env
# Connection Pooler URL (Transaction Mode - Port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection URL (Session Mode - Port 5432)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```
> **Important:** Never use the direct port (`5432`) as `DATABASE_URL` in serverless environments like Vercel. Always use the connection pooler with `?pgbouncer=true` to prevent exhausting PostgreSQL connection limits. Use `DIRECT_URL` exclusively for schema migrations (`prisma db push` / `prisma migrate`).

---

### B. Authentication (NextAuth.js / Auth.js)
```env
# Generate a cryptographically strong 32-byte string:
# Command: openssl rand -base64 32
AUTH_SECRET="your-32-character-random-secret"
AUTH_URL="https://stl-store.vercel.app"
NEXTAUTH_URL="https://stl-store.vercel.app"
NEXTAUTH_SECRET="your-32-character-random-secret"
```

---

### C. Razorpay Payment Gateway
```env
# Server-side credentials
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_custom_webhook_secret"

# Frontend public key (Required for Razorpay modal initialization)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."

# Optional fallback link
NEXT_PUBLIC_MERCHANT_PROFILE_URL="https://razorpay.me/@meiyarasan"
```

---

### D. Supabase Storage (Private STL Files & Previews)
```env
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

SUPABASE_STORAGE_BUCKET_PRIVATE="stl-files-private"
SUPABASE_STORAGE_BUCKET_PUBLIC="stl-images-public"
```
> **Security Rule:** `SUPABASE_SERVICE_ROLE_KEY` must **NEVER** be prefixed with `NEXT_PUBLIC_`. This key bypasses Row Level Security (RLS) and is strictly used server-side to generate signed URLs for paid customers.

---

### E. Transactional Email (Resend)
```env
RESEND_API_KEY="re_123456789"
RESEND_FROM_EMAIL="The Print Factory Orders <orders@The Print Factory.com>"
```
*Note: If custom domain DNS records are not yet verified, you can test emails using `onboarding@resend.dev` as the sender.*
