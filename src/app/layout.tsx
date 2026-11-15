import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Script from "next/script";

export const metadata: Metadata = {
  title: "STLForge – International Digital STL Marketplace",
  description:
    "Design. Download. Create. Discover premium 3D printable designs, print-in-place mechanisms, and collectible miniatures. Instant secure digital download.",
  keywords: [
    "STL files",
    "3D printing",
    "Digital marketplace",
    "Print in place",
    "3D models",
    "Resin 3D printing",
    "FDM 3D printing",
  ],
  authors: [{ name: "STLForge" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Razorpay Standard Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-white text-zinc-900 antialiased selection:bg-zinc-950 selection:text-white">
        <AuthProvider>
          <StoreProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
