export const BRAND = {
  name: "The Print Factory",
  fullName: "THE PRINT FACTORY",
  shortName: "The Print Factory",
  tagline: "BUY. PRINT. RELAX.",
  subTagline: "International Digital 3D Printing Marketplace",
  description:
    "Buy. Print. Relax. Discover premium 3D printable designs, print-in-place mechanisms, and collectible miniatures. Instant secure digital download.",
  logoUrl: "/images/logo.png",
  logoSquare: "/images/logo.png",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://theprintfactory.com",
  supportEmail: "theprintfactory2026@gmail.com",
  adminEmail: "theprintfactory2026@gmail.com",
  ordersEmail: "theprintfactory2026@gmail.com",
  copyright: `© ${new Date().getFullYear()} The Print Factory. All rights reserved. Precision 3D Digital Assets.`,
} as const;

export default BRAND;
