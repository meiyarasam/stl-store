# STLForge System Architecture & Technical Specification

## 1. Architectural Philosophy
STLForge is built as a modular, domain-driven full-stack Next.js application designed to provide sub-second global page loads, strict server-authoritative e-commerce pricing, and non-blocking fallbacks.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  React Server Components + Client Islands (useCart, Store)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
│      Route Handlers (/api/*) + Server Actions + Pages       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Services Layer                     │
│    ProductService │ OrderService │ PaymentService │ etc.   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│      Prisma ORM Layer        ││      External Services      │
│  isDatabaseReachable() Guard ││  - Razorpay Orders & Webhook│
│  PostgreSQL (Supabase)       ││  - Supabase Storage Signed  │
│  Local Disk Store Fallback   ││  - Resend Email Service     │
└──────────────────────────────┘└─────────────────────────────┘
```

## 2. Domain Services Breakdown

### Product Service (`src/services/product.service.ts`)
- Resolves multi-currency pricing models.
- Manages category taxonomy.
- Seamlessly falls back to rich sample 3D designs when PostgreSQL is offline or unreachable.

### Order Service (`src/services/order.service.ts`)
- Authoritative server-side pricing engine: Never trusts prices submitted by client requests.
- Recalculates subtotal, discounts, and currency conversion before generating internal and Razorpay orders.
- Manages order lifecycles: `PENDING` $\rightarrow$ `PAID` $\rightarrow$ `COMPLETED` (or `FAILED` / `CANCELLED`).

### Payment Service (`src/services/payment.service.ts`)
- Communicates directly with Razorpay Orders API.
- Computes HMAC-SHA256 signature verification over `order_id + "|" + payment_id` using the private `RAZORPAY_KEY_SECRET`.
- Validates Razorpay Webhooks (`payment.captured`, `order.paid`) with duplicate event prevention.
- Generates dynamic UPI intent strings (`upi://pay?...`) for Indian buyers.

### Download Service (`src/services/download.service.ts`)
- Implements cryptographic single-use signed URLs with 300s TTL via private Supabase Storage buckets.
- Enforces strict purchase ownership verification: Only confirmed `PAID` orders unlock file downloads.
- Tracks download counts against the 25-attempt security ceiling.
- Provides tokenized streaming fallback for local and staging environments.

### User Service (`src/services/user.service.ts`)
- Handles user registration with 12-round bcrypt password hashing.
- Supports NextAuth JWT session authentication.
- Persists local developer user accounts in `data/users.json` across server restarts.

## 3. Security Considerations
- **No Private Keys in Bundles:** Neither `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, nor `AUTH_SECRET` are ever prefixed with `NEXT_PUBLIC_`.
- **Client Route Guards:** All `/admin/*` and `/account/*` pages verify server sessions via `getServerSession(authOptions)`.
- **Idempotency:** Webhook handlers check current order state before executing state transitions to prevent duplicate download creation.
