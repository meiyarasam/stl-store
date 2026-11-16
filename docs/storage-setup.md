# Supabase Storage Configuration Guide

This guide details how to configure private digital file delivery and public preview imagery for **The Print Factory** using **Supabase Storage**.

---

## 1. Storage Architecture Overview

The Print Factory handles two distinct categories of files:

| File Type | Storage Bucket | Privacy | Access Method |
| :--- | :--- | :--- | :--- |
| **Original STL & ZIP Packages** | `stl-files-private` | **Private** | Signed cryptographic URLs (300-second expiry) generated only after verified payment |
| **Rendered Preview Images** | `stl-images-public` | **Public** | Direct CDN URLs embedded in product cards and gallery showcases |

> **Security Rule:** Digital STL files are never stored in public storage. Direct URLs to original files are never exposed to browser source code or public inspect elements.

---

## 2. Bucket Creation in Supabase

1. Open your [Supabase Dashboard](https://supabase.com).
2. Select your project and click **Storage** in the left sidebar.
3. Click **New bucket** and create the first bucket:
   - **Name:** `stl-files-private`
   - **Public bucket:** **OFF** (Keep unchecked)
   - Click **Save bucket**.
4. Click **New bucket** and create the second bucket:
   - **Name:** `stl-images-public`
   - **Public bucket:** **ON** (Check the box to make it public)
   - Click **Save bucket**.

---

## 3. Storage API Credentials

Navigate to **Project Settings** > **API**:

Copy the following into your `.env` and Vercel Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

SUPABASE_STORAGE_BUCKET_PRIVATE="stl-files-private"
SUPABASE_STORAGE_BUCKET_PUBLIC="stl-images-public"
```

> **Security Note:** `SUPABASE_SERVICE_ROLE_KEY` has elevated admin privileges that bypass Row Level Security. It must remain strictly server-side and never be included in frontend code.

---

## 4. How Secure Downloads Work

1. Customer purchases a 3D model.
2. Once the payment signature is verified or confirmed by webhook, an authenticated record is inserted into the `Download` table with a unique `downloadToken`.
3. When the customer clicks **Download** on `/account/downloads` or the receipt page:
   - Request hits `GET /api/downloads/[token]`.
   - The server verifies:
     - Is the associated order marked `PAID`?
     - Does the user own this order (or valid guest token)?
     - Has the 25-attempt download limit been exceeded?
     - Has the link expired?
   - If verified, the server calls `supabaseAdmin.storage.from('stl-files-private').createSignedUrl(storagePath, 300)`.
   - The browser is redirected to the temporary signed URL, which expires automatically in 5 minutes.
