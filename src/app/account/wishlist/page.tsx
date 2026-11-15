import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { getAllProducts } from "@/lib/database/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Heart, ArrowLeft } from "lucide-react";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account/wishlist");
  }

  // Showcase featured wishlist items
  const products = await getAllProducts({ featuredOnly: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/account"
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
          My Saved Designs
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Curated 3D models saved for future printing projects.
        </p>
      </div>

      <ProductGrid
        products={products.slice(0, 3)}
        emptyMessage="You haven't saved any models to your wishlist yet."
      />
    </div>
  );
}

