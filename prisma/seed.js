const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting STLForge database seeding...");

  // 1. Create Default Admin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@stlforge.com";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@STLForge2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash: passwordHash,
    },
    create: {
      email: adminEmail,
      name: "STLForge Administrator",
      role: "ADMIN",
      passwordHash: passwordHash,
      country: "US",
      phoneCountryCode: "+1",
      phone: "5550192834",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin account configured: ${admin.email}`);

  // 2. Categories
  const categoriesData = [
    {
      id: "cat_miniatures",
      name: "Miniatures & Figures",
      slug: "miniatures-figures",
      description: "Highly detailed character models, tabletop miniatures, and artistic sculptures optimized for SLA resin and high-resolution FDM.",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
      icon: "Crown",
      isFeatured: true,
      sortOrder: 1,
    },
    {
      id: "cat_functional",
      name: "Functional & Mechanical",
      slug: "functional-mechanical",
      description: "Precision engineered print-in-place mechanisms, gears, tools, and interlocking functional assemblies.",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      icon: "Cog",
      isFeatured: true,
      sortOrder: 2,
    },
    {
      id: "cat_home_decor",
      name: "Home & Decor",
      slug: "home-decor",
      description: "Modern parametric vases, ambient lampshades, geometric planters, and architectural desk accessories.",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      icon: "Home",
      isFeatured: true,
      sortOrder: 3,
    },
    {
      id: "cat_cosplay",
      name: "Cosplay & Props",
      slug: "cosplay-props",
      description: "Wearable helmets, armor segments, prop replicas, and futuristic sci-fi accessories with alignment dowels.",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
      icon: "Shield",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      id: "cat_gadgets",
      name: "Tech & Organization",
      slug: "tech-organization",
      description: "Modular desk organizers, phone docks, custom cable managers, and computer peripheral accessories.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      icon: "Cpu",
      isFeatured: false,
      sortOrder: 5,
    },
    {
      id: "cat_articulated",
      name: "Articulated & Toys",
      slug: "articulated-toys",
      description: "Seamless print-in-place articulated creatures, kinetic desk toys, and flexible jointed models.",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      icon: "Sparkles",
      isFeatured: true,
      sortOrder: 6,
    },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categoriesData.length} categories`);

  // 3. Products with Multi-Currency Prices, Images and Files
  const productsData = [
    {
      id: "prod_ronin_bust",
      title: "Cyberpunk Ronin Collectible Bust",
      slug: "cyberpunk-ronin-collectible-bust",
      shortDescription: "Ultra-high detail sci-fi warrior bust featuring cybernetic augmentations and precision mesh detailing.",
      fullDescription: `The Cyberpunk Ronin Collectible Bust represents the apex of digital sculpting for 3D printing enthusiasts. Designed with meticulous attention to hard-surface mechanical lines juxtaposed against organic anatomy, this bust features detailed cybernetic implants, a tactical visor, and layered composite battle armor.

Optimized for both SLA UV-curable resin printers and standard FDM printers with tree supports. The model includes both a solid version and a hollowed version with drainage channels for efficient resin usage. Comes with a dedicated heavy-base display pedestal and alignment keying pins for painless assembly.`,
      categoryId: "cat_miniatures",
      supportedPrinters: "SLA / DLP / MSLA Resin & FDM",
      printingSettings: "Layer Height: 0.05mm (Resin) / 0.12mm (FDM) | Infill: 15% Gyroid | Supports: Tree Supports recommended for chin & shoulder pauldrons | Recommended resin: ABS-like Grey",
      licenceType: "Standard Personal Use Licence (Non-commercial, digital resale prohibited)",
      isPublished: true,
      isFeatured: true,
      viewCount: 1842,
      downloadCount: 341,
      prices: [
        { currency: "USD", amount: 14.99, compareAtAmount: 24.99 },
        { currency: "INR", amount: 999.0, compareAtAmount: 1499.0 },
        { currency: "EUR", amount: 13.99, compareAtAmount: 22.99 },
        { currency: "GBP", amount: 11.99, compareAtAmount: 19.99 },
        { currency: "CAD", amount: 19.99, compareAtAmount: 29.99 },
        { currency: "AUD", amount: 22.99, compareAtAmount: 34.99 },
        { currency: "JPY", amount: 2200.0, compareAtAmount: 3500.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80", altText: "Cyberpunk Ronin Bust Render View", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80", altText: "Ronin Bust Close-up Details", isPrimary: false, sortOrder: 1 },
      ],
      files: [
        { fileName: "Cyberpunk_Ronin_Complete_Set.zip", fileType: "ZIP", fileSizeBytes: BigInt(184500000), storagePath: "products/ronin/Cyberpunk_Ronin_Complete_Set.zip", version: "2.1" },
        { fileName: "Ronin_Bust_Solid.stl", fileType: "STL", fileSizeBytes: BigInt(89200000), storagePath: "products/ronin/Ronin_Bust_Solid.stl", version: "2.1" },
      ],
    },
    {
      id: "prod_mechanical_iris",
      title: "Print-in-Place Mechanical Iris Box",
      slug: "print-in-place-mechanical-iris-box",
      shortDescription: "Zero-assembly 8-blade mechanical aperture container. Twisting the outer knurled ring smoothly opens the iris.",
      fullDescription: `The Print-in-Place Mechanical Iris Box is a masterpiece of precision mechanical tolerance design. Fresh off the print bed with zero assembly, glue, or screws required, turning the knurled outer ring causes 8 interconnected curved blades to glide open simultaneously in a cinematic camera aperture motion.`,
      categoryId: "cat_functional",
      supportedPrinters: "FDM (Bambu Lab, Prusa, Creality, Anycubic)",
      printingSettings: "Layer Height: 0.16mm - 0.20mm | Infill: 20% Cubic | Supports: NO SUPPORTS (100% Print-in-Place)",
      licenceType: "Standard Personal Use Licence",
      isPublished: true,
      isFeatured: true,
      viewCount: 3120,
      downloadCount: 890,
      prices: [
        { currency: "USD", amount: 8.99, compareAtAmount: 14.99 },
        { currency: "INR", amount: 599.0, compareAtAmount: 999.0 },
        { currency: "EUR", amount: 8.49, compareAtAmount: 13.99 },
        { currency: "GBP", amount: 7.49, compareAtAmount: 11.99 },
        { currency: "CAD", amount: 11.99, compareAtAmount: 18.99 },
        { currency: "AUD", amount: 13.99, compareAtAmount: 21.99 },
        { currency: "JPY", amount: 1350.0, compareAtAmount: 2100.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80", altText: "Mechanical Iris Aperture Box in Open State", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80", altText: "Iris Box Mechanism Detail", isPrimary: false, sortOrder: 1 },
      ],
      files: [
        { fileName: "Mechanical_Iris_Box_Package.zip", fileType: "ZIP", fileSizeBytes: BigInt(42300000), storagePath: "products/iris/Mechanical_Iris_Box_Package.zip", version: "1.4" },
        { fileName: "Mechanical_Iris_Box_PrintInPlace.stl", fileType: "STL", fileSizeBytes: BigInt(24100000), storagePath: "products/iris/Mechanical_Iris_Box_PrintInPlace.stl", version: "1.4" },
      ],
    },
    {
      id: "prod_crystal_dragon",
      title: "Articulated Crystal Dragon (Print-in-Place)",
      slug: "articulated-crystal-dragon-print-in-place",
      shortDescription: "Majestic fully articulated crystal-scaled dragon. 48 interconnected joint segments print fully assembled.",
      fullDescription: `A mesmerizing print-in-place articulated dragon featuring razor-sharp crystalline facet plates along its back, head crest, and tail barb. With 48 interconnected ball-and-socket links, the dragon flows with remarkable kinetic flexibility right off the build plate without any assembly.`,
      categoryId: "cat_articulated",
      supportedPrinters: "FDM & Large Format Resin",
      printingSettings: "Layer Height: 0.16mm - 0.20mm | Infill: 15% | Supports: None | Bed Adhesion: Clean textured PEI sheet",
      licenceType: "Standard Personal Use Licence",
      isPublished: true,
      isFeatured: true,
      viewCount: 5240,
      downloadCount: 1420,
      prices: [
        { currency: "USD", amount: 11.99, compareAtAmount: 18.99 },
        { currency: "INR", amount: 799.0, compareAtAmount: 1299.0 },
        { currency: "EUR", amount: 10.99, compareAtAmount: 17.49 },
        { currency: "GBP", amount: 9.49, compareAtAmount: 14.99 },
        { currency: "CAD", amount: 15.99, compareAtAmount: 24.99 },
        { currency: "AUD", amount: 17.99, compareAtAmount: 27.99 },
        { currency: "JPY", amount: 1800.0, compareAtAmount: 2700.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80", altText: "Articulated Crystal Dragon Coiled", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80", altText: "Crystal Dragon Scaled Texture Close-up", isPrimary: false, sortOrder: 1 },
      ],
      files: [
        { fileName: "Articulated_Crystal_Dragon_Bundle.zip", fileType: "ZIP", fileSizeBytes: BigInt(95400000), storagePath: "products/dragon/Articulated_Crystal_Dragon_Bundle.zip", version: "3.0" },
        { fileName: "Crystal_Dragon_Curled_Bed_Fit.stl", fileType: "STL", fileSizeBytes: BigInt(46800000), storagePath: "products/dragon/Crystal_Dragon_Curled_Bed_Fit.stl", version: "3.0" },
      ],
    },
    {
      id: "prod_hex_desk_organizer",
      title: "Modular Hexagon Desk Workspace Organizer",
      slug: "modular-hexagon-desk-workspace-organizer",
      shortDescription: "Architectural honeycomb workstation storage grid. Snap-together magnetic modules for pens, phones, and tools.",
      fullDescription: `The Modular Hexagon Desk Organizer is designed for makers, designers, and tech enthusiasts seeking a clean, clutter-free desk setup.`,
      categoryId: "cat_gadgets",
      supportedPrinters: "All FDM 3D Printers",
      printingSettings: "Layer Height: 0.20mm | Infill: 15% Grid | Walls: 3 perimeters for strength",
      licenceType: "Standard Personal Use Licence",
      isPublished: true,
      isFeatured: false,
      viewCount: 1410,
      downloadCount: 395,
      prices: [
        { currency: "USD", amount: 6.99, compareAtAmount: 11.99 },
        { currency: "INR", amount: 449.0, compareAtAmount: 749.0 },
        { currency: "EUR", amount: 6.49, compareAtAmount: 10.99 },
        { currency: "GBP", amount: 5.49, compareAtAmount: 9.49 },
        { currency: "CAD", amount: 9.49, compareAtAmount: 14.99 },
        { currency: "AUD", amount: 10.49, compareAtAmount: 16.99 },
        { currency: "JPY", amount: 1050.0, compareAtAmount: 1650.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80", altText: "Modular Hexagon Organizer", isPrimary: true, sortOrder: 0 },
      ],
      files: [
        { fileName: "Modular_Hex_Organizer_Full_Pack.zip", fileType: "ZIP", fileSizeBytes: BigInt(54200000), storagePath: "products/hex/Modular_Hex_Organizer_Full_Pack.zip", version: "1.2" },
      ],
    },
    {
      id: "prod_voronoi_lamp",
      title: "Voronoi Ambient Spiral Vase Lamp",
      slug: "voronoi-ambient-spiral-vase-lamp",
      shortDescription: "Striking parametric Voronoi lattice lampshade. Prints in a single continuous spiral vase mode.",
      fullDescription: `Transform your living space with this parametric Voronoi ambient lampshade. Engineered using mathematical cell-relaxation algorithms.`,
      categoryId: "cat_home_decor",
      supportedPrinters: "All FDM 3D Printers with Vase Mode",
      printingSettings: "Spiral Vase Mode ON | Layer Height: 0.28mm | Line Width: 0.6mm - 0.8mm",
      licenceType: "Standard Personal Use Licence",
      isPublished: true,
      isFeatured: true,
      viewCount: 2430,
      downloadCount: 615,
      prices: [
        { currency: "USD", amount: 7.99, compareAtAmount: 12.99 },
        { currency: "INR", amount: 499.0, compareAtAmount: 799.0 },
        { currency: "EUR", amount: 7.49, compareAtAmount: 11.99 },
        { currency: "GBP", amount: 6.49, compareAtAmount: 9.99 },
        { currency: "CAD", amount: 10.99, compareAtAmount: 16.99 },
        { currency: "AUD", amount: 11.99, compareAtAmount: 18.99 },
        { currency: "JPY", amount: 1200.0, compareAtAmount: 1850.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80", altText: "Voronoi Spiral Lamp Glowing Warm Light", isPrimary: true, sortOrder: 0 },
      ],
      files: [
        { fileName: "Voronoi_Spiral_Lamp_Pack.zip", fileType: "ZIP", fileSizeBytes: BigInt(38100000), storagePath: "products/lamp/Voronoi_Spiral_Lamp_Pack.zip", version: "1.1" },
      ],
    },
    {
      id: "prod_steampunk_skull",
      title: "Steampunk Chrono-Mechanic Skull",
      slug: "steampunk-chrono-mechanic-skull",
      shortDescription: "Intricate gothic steampunk skull infused with interlocking clockwork gears, vacuum tubes, and rivets.",
      fullDescription: `The Steampunk Chrono-Mechanic Skull is a premier display centerpiece combining Victorian industrial aesthetics with dark fantasy sculpting.`,
      categoryId: "cat_miniatures",
      supportedPrinters: "Resin (SLA/MSLA) & Precision FDM",
      printingSettings: "Layer Height: 0.04mm (Resin) / 0.12mm (FDM) | Infill: 20%",
      licenceType: "Standard Personal Use Licence",
      isPublished: true,
      isFeatured: false,
      viewCount: 1670,
      downloadCount: 280,
      prices: [
        { currency: "USD", amount: 16.99, compareAtAmount: 24.99 },
        { currency: "INR", amount: 1199.0, compareAtAmount: 1799.0 },
        { currency: "EUR", amount: 15.99, compareAtAmount: 23.99 },
        { currency: "GBP", amount: 13.99, compareAtAmount: 19.99 },
        { currency: "CAD", amount: 22.99, compareAtAmount: 32.99 },
        { currency: "AUD", amount: 25.99, compareAtAmount: 37.99 },
        { currency: "JPY", amount: 2500.0, compareAtAmount: 3750.0 },
      ],
      images: [
        { url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80", altText: "Steampunk Clockwork Skull Frontal Angle", isPrimary: true, sortOrder: 0 },
      ],
      files: [
        { fileName: "Steampunk_Skull_Master_Archive.zip", fileType: "ZIP", fileSizeBytes: BigInt(142000000), storagePath: "products/skull/Steampunk_Skull_Master_Archive.zip", version: "1.0" },
      ],
    },
  ];

  for (const item of productsData) {
    const { prices, images, files, ...productData } = item;
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    });

    // Prices
    for (const p of prices) {
      await prisma.productPrice.upsert({
        where: {
          productId_currency: {
            productId: product.id,
            currency: p.currency,
          },
        },
        update: {
          amount: p.amount,
          compareAtAmount: p.compareAtAmount,
          isEnabled: true,
        },
        create: {
          productId: product.id,
          currency: p.currency,
          amount: p.amount,
          compareAtAmount: p.compareAtAmount,
          isEnabled: true,
        },
      });
    }

    // Images
    for (const img of images) {
      const existing = await prisma.productImage.findFirst({
        where: { productId: product.id, url: img.url },
      });
      if (!existing) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          },
        });
      }
    }

    // Files
    for (const f of files) {
      const existing = await prisma.productFile.findFirst({
        where: { productId: product.id, fileName: f.fileName },
      });
      if (!existing) {
        await prisma.productFile.create({
          data: {
            productId: product.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileSizeBytes: f.fileSizeBytes,
            storagePath: f.storagePath,
            version: f.version,
            isDownloadable: true,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${productsData.length} products with complete files and currency prices.`);
  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
