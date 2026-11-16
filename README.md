# The Print Factory – International Digital 3D Printing Marketplace

> **"BUY. PRINT. RELAX."**  
> A production-grade, international e-commerce platform engineered specifically for discovering, purchasing, and securely downloading high-precision 3D-printable STL files.

Inspired by modern digital product storefronts, The Print Factory implements an enterprise-grade full-stack architecture featuring multi-currency native pricing (`INR`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`), Razorpay standard checkout, dynamic UPI QR payments, signed cryptographic file delivery via Supabase Storage, self-serve customer dashboards, and a complete admin management portal.

---

## 1. Project Overview

The Print Factory bridges modern digital manufacturing with international e-commerce. Every 3D model hosted on the marketplace undergoes rigorous manifold geometry checks, ensuring 100% watertight prints without mesh inversions or non-manifold topology errors.

### Key Capabilities
- **Universal Multi-Currency System:** Country-based automatic selection with explicit per-product currency configuration (not lossy exchange rate conversions).
- **Authorized Razorpay Checkout:** Server-side Orders API with HMAC-SHA256 signature verification and webhook idempotency.
- **Dynamic UPI QR Support:** Dynamic QR code generation for eligible Indian buyers.
- **Secure Digital Downloads:** Cryptographic signed URLs generated via private Supabase Storage buckets with strict 300s expiry windows and download counters.
- **Customer & Admin Dashboards:** Self-serve customer order and download management alongside real-time admin analytics powered by Recharts.
- **Resilient Fallback Mode:** Zero-latency connectivity guards (`isDatabaseReachable`) that automatically serve persistent local models when external databases are offline.

---

## 2. Features

- **Public Marketplace:**
  - Modern, minimalist charcoal & neutral aesthetic (no flashy gradients or fake counters).
  - High-performance responsive product grid with instant search, category navigation pills, and sort filters.
  - Comprehensive 3D print specifications: supported printers (FDM, SLA, Resin), nozzle sizes, infill percentages, layer heights, and personal licence terms.
- **Customer Authentication:**
  - Secure bcrypt password hashing.
  - Interactive password visibility toggles (eye icons) on registration, login, and admin login forms.
  - Session preservation across "Buy Now" redirects without cart abandonment.
- **Shopping Cart & Checkout:**
  - Persistent cart state with drawer and dedicated cart summary page.
  - Authoritative server-side pricing calculations (never trusts frontend totals).
  - Support for international card payments, Indian netbanking, and UPI.
- **Admin Management Portal:**
  - Real-time revenue charts (daily revenue curves in USD/INR, geographic distributions).
  - Product catalog management and model creation.
  - Order audit logs with payment IDs and customer details.
  - Customer directory with account standing controls.

---

## 3. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Analytics Visualizations:** Recharts
- **QR Code Engine:** QRCode.js

### Backend & Architecture
- **API Routing:** Next.js Route Handlers (Serverless)
- **Validation:** Zod schemas
- **Authentication:** Auth.js / NextAuth v4 (JWT session strategy, Credentials provider)
- **Database ORM:** Prisma ORM with PostgreSQL

### Infrastructure & External Services
- **Database:** PostgreSQL (Supabase Connection Pooler with PgBouncer)
- **Storage:** Supabase Storage (Private bucket for STL/ZIP archives; public bucket for previews)
- **Payment Gateway:** Razorpay Standard Checkout & Orders API
  - Merchant Payment Profile: [https://razorpay.me/@meiyarasan](https://razorpay.me/@meiyarasan)
- **Transactional Email:** Resend
- **Hosting Platform:** Vercel

---

## 4. Folder Structure

```
STLForge/
├── .env.example                     # Production environment variable template
├── .gitignore                       # Clean Git exclusion rules
├── next.config.mjs                  # Next.js configuration with remote patterns
├── package.json                     # Scripts (postinstall: prisma generate)
├── postcss.config.mjs               # PostCSS config
├── tailwind.config.ts               # Minimalist charcoal design tokens
├── tsconfig.json                    # Path aliases (@/*, @/services/*, etc.)
├── README.md                        # Documentation
│
├── docs/
│   ├── deployment.md                # Step-by-step Vercel deployment guide
│   ├── environment-variables.md     # Production & local environment variables reference
│   ├── database-setup.md            # Supabase PostgreSQL & Prisma migration guide
│   ├── razorpay-setup.md            # Razorpay live keys, webhooks & international payments
│   ├── storage-setup.md             # Supabase private STL & public image buckets
│   ├── payment-integration.md       # Technical payment gateway & UPI QR specification
│   └── architecture.md              # Architectural specification & data flow
│
├── prisma/
│   ├── schema.prisma                # Database models with directUrl support
│   ├── migrations/                  # Schema migrations tracking
│   └── seed.js                      # Database seeder script
│
├── public/
│   ├── fonts/                       # Static fonts
│   ├── icons/                       # Platform icons
│   └── images/                      # Fallback product assets
│
└── src/
    ├── app/                         # App Router pages & route handlers
    │   ├── (auth)/                  # /login, /register, /forgot-password
    │   ├── (store)/                 # Homepage, /products, /categories, /cart, /checkout
    │   ├── account/                 # /account, /orders, /downloads, /profile, /wishlist
    │   ├── admin/                   # /admin, /login, /products, /orders, /customers
    │   ├── payment/                 # /payment/success, /payment/failed
    │   └── api/                     # Backend API Route Handlers
    ├── components/                  # Reusable React components
    │   ├── admin/                   # AdminNav, AnalyticsCharts, DashboardMetrics
    │   ├── auth/                    # LoginForm, RegisterForm, AdminLoginForm
    │   ├── cart/                    # CartDrawer, CartSummary
    │   ├── checkout/                # OrderSummary, UPIQRCodeModal
    │   ├── layout/                  # Header, Footer, CurrencySelector
    │   ├── products/                # ProductCard, ProductGrid, ProductFilters, ProductPurchaseCard
    │   └── ui/                      # Button, Input, Card, Badge
    ├── services/                    # Backend Domain Services
    │   ├── product.service.ts       # Catalog querying & fallback
    │   ├── order.service.ts         # Authoritative pricing & order creation
    │   ├── payment.service.ts       # Razorpay orders & signature verification
    │   ├── download.service.ts      # Cryptographic signed URLs & streaming
    │   ├── user.service.ts          # Registration & persistent dev store
    │   ├── email.service.ts         # Resend confirmation email dispatch
    │   └── analytics.service.ts     # Platform revenue & metrics aggregation
    ├── lib/                         # Infrastructure Singletons
    │   ├── prisma.ts                # Prisma client with socket connectivity probe
    │   ├── razorpay.ts              # Razorpay client & verification
    │   ├── supabase.ts              # Supabase storage client
    │   ├── auth.ts                  # NextAuth options
    │   └── utils.ts                 # Tailwind cn utility helper
    ├── hooks/                       # Custom React hooks (useCart, useCurrency)
    ├── context/                     # Global StoreContext (cart, currency, drawer)
    ├── types/                       # TypeScript interfaces & DTOs
    ├── schemas/                     # Zod validation schemas
    ├── constants/                   # Currencies & domain constants
    └── data/                        # Static seed products & models
```

---

## 5. Installation Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meiyarasam/stl-store.git
   cd stl-store
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

---

## 6. Environment Configuration

Edit your local `.env` file with appropriate keys:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stlforge?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/stlforge?schema=public"
AUTH_SECRET="your-development-secret-key-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key-32-chars-min"

RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_webhook_secret_placeholder"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder_key"
NEXT_PUBLIC_MERCHANT_PROFILE_URL="https://razorpay.me/@meiyarasan"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET_PRIVATE="stl-files-private"
SUPABASE_STORAGE_BUCKET_PUBLIC="stl-images-public"

RESEND_API_KEY="re_placeholder_key"
RESEND_FROM_EMAIL="STLForge <orders@stlforge.com>"

ADMIN_DEFAULT_EMAIL="admin@stlforge.com"
ADMIN_DEFAULT_PASSWORD="Admin@STLForge2026!"
```

---

## 7. Database Setup

When connecting to a remote PostgreSQL database (such as Supabase):
1. Create a PostgreSQL database instance on [Supabase](https://supabase.com).
2. Set `DATABASE_URL` (pooler port 6543) and `DIRECT_URL` (direct port 5432) in `.env`.
3. Push schema and seed initial products:
   ```bash
   npm run db:push
   npm run db:seed
   ```

---

## 8. Prisma Commands

- **Generate Client:** `npm run db:generate` (`prisma generate`)
- **Push Schema Changes:** `npm run db:push` (`prisma db push`)
- **Seed Database:** `npm run db:seed` (`node prisma/seed.js`)
- **Open Prisma Studio:** `npx prisma studio`

---

## 9. Local Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Customer Registration:** [http://localhost:3000/register](http://localhost:3000/register)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Email:** `admin@theprintfactory.com`
  - **Password:** Configured via `ADMIN_DEFAULT_PASSWORD` in `.env`

---

## 10. Vercel Deployment

For comprehensive step-by-step instructions, see [docs/deployment.md](docs/deployment.md).

Quick summary:
1. Push your repository to GitHub: `git push origin main`.
2. Import repository in [Vercel](https://vercel.com).
3. Set environment variables matching `.env.example`.
4. Deploy. Vercel will execute `npm run build` with automated `prisma generate` post-install hook.

---

## 11. Razorpay Integration Setup

1. Sign up on [Razorpay](https://razorpay.com).
2. Navigate to **API Keys** and generate Test/Live Key ID and Secret.
3. Configure **Webhooks** pointing to `https://your-domain.vercel.app/api/webhooks/razorpay` with `payment.captured`, `payment.failed`, and `order.paid` events.
4. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in environment variables.

---

## 12. Supabase Configuration

1. Create bucket `stl-files-private` (Private bucket) for digital STL files.
2. Create bucket `stl-images-public` (Public bucket) for 3D preview images.
3. Obtain API URL, Anon Key, and Service Role Key from **Project Settings** > **API**.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in environment variables.

---

## 13. Troubleshooting

### Prisma Connection Timeout in Local Development
- If local PostgreSQL is not running, The Print Factory automatically activates its 2ms connectivity guard (`isDatabaseReachable`) and serves persistent local data with zero latency.

### EPERM errors during build on Windows
- Close any background processes holding file locks on `.next/` and run `npm run build`.

### Dynamic Server Usage Error on Vercel
- All API route handlers reading request headers, cookies, or search parameters export `export const dynamic = "force-dynamic"`.
- All client components using `useSearchParams()` are wrapped inside `<Suspense>` boundaries.
