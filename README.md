# STLForge – International Digital STL Marketplace

> **"Design. Download. Create."**  
> A production-grade, international e-commerce platform engineered specifically for discovering, purchasing, and securely downloading high-precision 3D-printable STL files.

Inspired by Ko-fi's digital product store experience, STLForge implements an enterprise-grade full-stack architecture featuring multi-currency native pricing (INR, USD, EUR, GBP, CAD, AUD, JPY), Razorpay standard checkout, dynamic UPI QR payments, signed cryptographic file delivery via Supabase Storage, customer dashboards, and a complete admin management portal.

---

## 1. Project Overview

STLForge bridges modern digital manufacturing with international e-commerce. Every 3D model hosted on the marketplace undergoes rigorous manifold geometry checks, ensuring 100% watertight prints without mesh inversions or non-manifold topology errors.

### Key Capabilities
- **Universal Multi-Currency System:** Country-based automatic selection with explicit per-product currency configuration (not lossy exchange rate conversions).
- **Authorized Razorpay Checkout:** Server-side Orders API with HMAC SHA-256 signature verification and webhook idempotency.
- **Dynamic UPI QR Support:** Dynamic QR code generation for eligible Indian buyers.
- **Secure Digital Downloads:** Cryptographic signed URLs generated via private Supabase Storage buckets with strict 300s expiry windows and download counters.
- **Customer & Admin Dashboards:** Self-serve customer order and download management alongside real-time admin analytics powered by Recharts.

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom charcoal, neutral & slate palette)
- **Component Primitives:** shadcn/ui design patterns
- **Icons:** Lucide React
- **Analytics & Data Visualizations:** Recharts
- **QR Code Engine:** QRCode.js

### Backend & API
- **API Architecture:** Next.js Route Handlers
- **Validation:** Zod schemas
- **Authentication:** Auth.js / NextAuth (Credentials provider with bcrypt password hashing)
- **Database ORM:** Prisma ORM with PostgreSQL

### Infrastructure & Services
- **Database:** PostgreSQL (Supabase / Neon / AWS RDS)
- **Private Storage:** Supabase Storage (Private buckets for STL/ZIP archives; public bucket for previews)
- **Payment Gateway:** Razorpay Standard Checkout & Orders API
  - Merchant Payment Profile: [https://razorpay.me/@meiyarasan](https://razorpay.me/@meiyarasan)
- **Transactional Email:** Resend
- **Hosting:** Vercel

---

## 3. Architecture & Data Flow

```
[ Customer Browser ]
       │
       ▼
[ Next.js App Router (Storefront / Checkout / Dashboards) ]
       │
       ├───▶ [ Auth.js (NextAuth) Session & Bcrypt Validation ]
       │
       ├───▶ [ Authoritative Server-side Pricing Engine ]
       │            │
       │            ▼
       │     [ Prisma ORM (PostgreSQL) ]
       │
       ├───▶ [ Razorpay Orders API ] ──▶ [ Standard Modal / UPI Dynamic QR ]
       │            │
       │            ▼
       │     [ HMAC-SHA256 Signature & Webhook Verification ]
       │
       └───▶ [ Private Supabase Storage Engine ] ──▶ [ 300s Signed Download URLs ]
```

---

## 4. Project Folder Structure

```
stlforge/
├── prisma/
│   ├── schema.prisma           # Complete database schema (User, Order, Product, etc.)
│   └── seed.js                 # Database seeder with realistic 3D models & prices
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── (store)/            # Homepage, Products, Categories, Cart, Checkout, Legal
│   │   ├── account/            # Customer Overview, Orders, Downloads, Profile, Wishlist
│   │   ├── admin/              # Admin Analytics, Products CRUD, Orders, Customers, Settings
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth handlers & Registration
│   │   │   ├── products/       # Public product search & filters
│   │   │   ├── orders/         # Order creation & server-side pricing
│   │   │   ├── payments/       # Cryptographic signature verification
│   │   │   ├── webhooks/       # Razorpay webhook listener
│   │   │   ├── downloads/      # Authenticated signed URL resolver & streaming fallback
│   │   │   └── admin/          # Admin analytics & CRUD APIs
│   │   ├── payment/            # Success (/payment/success) & Failed routes
│   │   ├── globals.css         # Minimalist charcoal design tokens
│   │   └── layout.tsx          # Root layout with Auth & Store providers
│   ├── components/
│   │   ├── admin/              # AdminNav, AnalyticsCharts (Recharts)
│   │   ├── cart/               # CartDrawer & line items
│   │   ├── checkout/           # UPIQRCodeModal, Payment scripts
│   │   ├── layout/             # Header, Footer, CurrencySelector
│   │   ├── products/           # ProductCard, ProductGrid, ProductGallery, PrintSpecsTable
│   │   ├── providers/          # NextAuth & Store state context
│   │   └── ui/                 # Button, Input, Card, Badge
│   ├── context/
│   │   └── StoreContext.tsx    # Multi-currency state & persistent shopping cart
│   ├── lib/
│   │   ├── auth/               # NextAuth credentials & JWT callbacks
│   │   ├── currency/           # Regional country mapping & subunit calculators
│   │   ├── database/           # Prisma client singleton, products, categories, orders, downloads
│   │   ├── email/              # Resend templates (Order confirmation, downloads ready)
│   │   ├── razorpay/           # Orders API client & HMAC SHA-256 verifier
│   │   ├── storage/            # Supabase private storage signed URL generator
│   │   └── validation/         # Zod schemas
│   ├── types/                  # TypeScript interface definitions
│   └── utils/                  # Tailwind merge helper
├── .env.example                # Documented environment variables
├── next.config.mjs             # Next.js image domain configuration
├── tailwind.config.ts          # Minimalist brand color palette
├── tsconfig.json               # TypeScript path alias configuration
└── package.json
```

---

## 5. Prerequisites

Before installing, ensure your environment has:
- **Node.js:** v18.17.0+ or v20+ (Node v26 verified compatible)
- **npm:** v9+ or **pnpm** / **yarn**
- **PostgreSQL Database:** Supabase, Neon, or local PostgreSQL instance
- **Razorpay Account:** Test or Live API keys
- **Supabase Storage:** Project with private bucket for STL files

---

## 6. Installation & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-username/stlforge.git
cd stlforge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL and API keys (defaults work out-of-the-box in local development mode).

### 4. Initialize Database & Seed Sample Models
```bash
# Generate the Prisma Client
npx prisma generate

# Push the schema to your PostgreSQL database
npx prisma db push

# Seed products, categories, multi-currency prices, and default admin
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Environment Variables Reference

| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/stlforge` |
| `NEXTAUTH_URL` | NextAuth canonical URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | 32+ character encryption secret | `your-secure-random-32char-string` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `your-razorpay-key-secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook HMAC secret | `your-webhook-secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-accessible Razorpay Key | `rzp_live_...` |
| `NEXT_PUBLIC_MERCHANT_PROFILE_URL` | Personal payment link fallback | `https://razorpay.me/@meiyarasan` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key for signing URLs | `eyJhbGciOi...` |
| `SUPABASE_STORAGE_BUCKET_PRIVATE` | Private bucket for digital STLs | `stl-files-private` |
| `SUPABASE_STORAGE_BUCKET_PUBLIC` | Public bucket for preview renders | `stl-images-public` |
| `RESEND_API_KEY` | Resend transactional email API key | `re_123456...` |
| `RESEND_FROM_EMAIL` | Verified sending address | `STLForge <orders@stlforge.com>` |
| `ADMIN_DEFAULT_EMAIL` | Initial admin login | `admin@stlforge.com` |
| `ADMIN_DEFAULT_PASSWORD` | Initial admin password | `Admin@STLForge2026!` |

---

## 8. Multi-Currency International Pricing

Unlike stores that blindly multiply by live fluctuating forex rates, STLForge implements **Explicit Multi-Currency Models**:
- Products contain a `ProductPrice` row for each currency code (`INR`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`).
- When an administrator configures a product, they can set:
  - **INR:** ₹999
  - **USD:** $14.99
  - **EUR:** €13.99
  - **GBP:** £11.99
- When an Indian customer visits, prices display natively in ₹INR, checkout calculates in INR paise, and Razorpay standard checkout requests ₹999.
- Subunit conversion rules:
  - Standard Currencies (USD, INR, EUR, GBP): multiplied by `100` (cents/paise)
  - Zero-Decimal Currencies (JPY): multiplied by `1`

---

## 9. Razorpay Payment Architecture

1. **Cart Checkout:** Customer initiates checkout. Next.js Route Handler `/api/orders/create` calculates authoritative server-side totals.
2. **Internal Pending Order:** Record saved with status `PENDING` and unique order number (`STL-XXXXXX`).
3. **Razorpay Orders API:** Initiated with amount in smallest currency units.
4. **Standard Checkout Modal:** Customer completes card payment, net banking, or UPI.
5. **Cryptographic Verification:**
   - Client sends signature to `/api/payments/verify`.
   - Node.js crypto calculates `HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)` using timing-safe buffers.
   - If valid, order transitions to `PAID`, download records are unlocked, and confirmation email dispatches.
6. **Webhook Redundancy:** Independent webhook `/api/webhooks/razorpay` captures server-to-server notifications and prevents duplicate event processing.
7. **Dynamic UPI QR:** For eligible Indian buyers, dynamic amount-bound QR codes are rendered for direct scanning.

---

## 10. Secure Digital Download Protection

- Original `.stl` and `.zip` archives are stored in **private, non-public** Supabase storage buckets.
- Download links are NEVER permanent public URLs.
- When an authorized user requests a file, the server:
  1. Verifies order ownership.
  2. Confirms payment status is `PAID`.
  3. Checks download count (`maxDownloads = 25`).
  4. Checks token expiration (`expiresAt = 365 days`).
  5. Requests a time-limited signed download URL (`createSignedUrl(path, 300)`).
  6. Increments the download counter and logs the IP and user-agent.

---

## 11. Admin Access & Management

1. Access the admin dashboard at `/admin`.
2. Default Seed Credentials:
   - **Email:** `admin@stlforge.com`
   - **Password:** `Admin@STLForge2026!`
3. Features:
   - **Analytics:** Weekly revenue velocity, geographic buyer distribution, multi-currency settlement.
   - **Products CRUD:** Add new models, upload preview images, set multi-currency prices, enter slicer parameters.
   - **Orders Audit:** Search orders by reference, customer email, or payment gateway status.
   - **Customers:** View registered makers, country distribution, and toggle suspended accounts.

---

## 12. Vercel Production Deployment

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete production STLForge marketplace"
   git push origin main
   ```
2. Import project into [Vercel](https://vercel.com).
3. Set the Root Directory to `./` and Framework Preset to `Next.js`.
4. Add all environment variables listed in `.env.example`.
5. Deploy. Vercel will automatically build the static and server-rendered routes.

---

## 13. License

Copyright © 2026 STLForge. All rights reserved.
Source code provided for personal, commercial, and enterprise deployment under the Standard Software License.

