# Supabase PostgreSQL & Prisma Database Setup Guide

This guide details how to configure, migrate, and seed the **Supabase PostgreSQL** database for **STLForge** in both local development and production on Vercel.

---

## 1. Create a Supabase Project

1. Log in to [Supabase](https://supabase.com).
2. Click **New Project** and select your preferred organization.
3. Enter Project Name: `stlforge` (or `stl-store`).
4. Set a strong database password (store this securely).
5. Choose the AWS region closest to your primary customer base.
6. Click **Create new project** and wait ~2 minutes for provisioning.

---

## 2. Obtain Connection Strings

Navigate to **Project Settings** > **Database** in your Supabase dashboard:

### A. Transaction Connection Pooler (for `DATABASE_URL`)
- Under **Connection string**, select the **Transaction** mode (port `6543`).
- Format:
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- This pooler URL handles thousands of concurrent serverless functions on Vercel without exceeding PostgreSQL connection limits.

### B. Direct Session Connection (for `DIRECT_URL`)
- Under **Connection string**, select **Session** or **URI** mode (port `5432`).
- Format:
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
  ```
- This direct URL is used by Prisma CLI during build and schema migrations (`prisma db push` / `prisma migrate`).

---

## 3. Configure Prisma Schema

The [prisma/schema.prisma](file:///d:/Files/Project/STL/prisma/schema.prisma) file is pre-configured with both URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 4. Run Schema Migrations

From your local machine or build terminal with `.env` configured:

```bash
# Push schema tables, relations, and enums to Supabase
npm run db:push
# (or: npx prisma db push)
```

Prisma will create all 18 relational models:
- `User`, `Account`, `Session`, `VerificationToken`
- `Category`, `Product`, `ProductPrice`, `ProductImage`, `ProductFile`
- `Cart`, `CartItem`
- `Order`, `OrderItem`, `Payment`, `Download`
- `Wishlist`, `Review`, `Coupon`, `AdminActivity`

---

## 5. Seed Initial Catalog and Models

Run the seed script to populate default categories, 3D printable STL models, and multi-currency prices:

```bash
npm run db:seed
# (or: node prisma/seed.js)
```

The seeder inserts:
- **Categories:** Mechanical Models, Gadgets & EDC, Tabletop Gaming, Home Living, 3D Printer Accessories.
- **Products:** Watertight 3D designs with pre-configured multi-currency prices (`INR`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `JPY`).
- **Initial Administrator:** `admin@stlforge.com` (hashed using 12 rounds of bcrypt).

---

## 6. Verify Tables in Supabase Table Editor

Navigate to **Table Editor** in your Supabase dashboard to verify:
1. `Product` table has sample rows with manifold specifications.
2. `Category` table has slugs: `mechanical-models`, `gadgets-accessories`, `tabletop-gaming`, etc.
3. `ProductPrice` has explicitly configured currency prices.
4. `User` table has the initial administrator account.

---

## 7. Prisma on Vercel Production

In `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

When Vercel builds your application, it executes `npm install`, which automatically triggers `postinstall: prisma generate`. This ensures the Prisma Client binary is always generated matching the Vercel Lambda Linux environment.
