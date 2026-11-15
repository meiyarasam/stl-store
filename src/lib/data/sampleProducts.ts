import { CurrencyCode } from "@/types";

export interface SampleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  isFeatured: boolean;
}

export interface SampleProduct {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  supportedPrinters: string;
  printingSettings: string;
  licenceType: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  prices: Record<CurrencyCode, number>;
  compareAtPrices?: Partial<Record<CurrencyCode, number>>;
  images: {
    url: string;
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
  files: {
    fileName: string;
    fileType: "STL" | "ZIP" | "OBJ" | "THREE_MF";
    fileSizeBytes: number;
    version: string;
  }[];
  specs: {
    dimensions: string;
    polygonCount: string;
    estimatedPrintTime: string;
    materialUsage: string;
    supportsRequired: string;
    infillRecommended: string;
    recommendedFilament: string;
  };
}

export const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    id: "cat_miniatures",
    name: "Miniatures & Figures",
    slug: "miniatures-figures",
    description: "Highly detailed character models, tabletop miniatures, and artistic sculptures optimized for SLA resin and high-resolution FDM.",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    icon: "Crown",
    isFeatured: true,
  },
  {
    id: "cat_functional",
    name: "Functional & Mechanical",
    slug: "functional-mechanical",
    description: "Precision engineered print-in-place mechanisms, gears, tools, and interlocking functional assemblies.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    icon: "Cog",
    isFeatured: true,
  },
  {
    id: "cat_home_decor",
    name: "Home & Decor",
    slug: "home-decor",
    description: "Modern parametric vases, ambient lampshades, geometric planters, and architectural desk accessories.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    icon: "Home",
    isFeatured: true,
  },
  {
    id: "cat_cosplay",
    name: "Cosplay & Props",
    slug: "cosplay-props",
    description: "Wearable helmets, armor segments, prop replicas, and futuristic sci-fi accessories with alignment dowels.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    icon: "Shield",
    isFeatured: true,
  },
  {
    id: "cat_gadgets",
    name: "Tech & Organization",
    slug: "tech-organization",
    description: "Modular desk organizers, phone docks, custom cable managers, and computer peripheral accessories.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    icon: "Cpu",
    isFeatured: false,
  },
  {
    id: "cat_articulated",
    name: "Articulated & Toys",
    slug: "articulated-toys",
    description: "Seamless print-in-place articulated creatures, kinetic desk toys, and flexible jointed models.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    icon: "Sparkles",
    isFeatured: true,
  },
];

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: "prod_ronin_bust",
    title: "Cyberpunk Ronin Collectible Bust",
    slug: "cyberpunk-ronin-collectible-bust",
    shortDescription: "Ultra-high detail sci-fi warrior bust featuring cybernetic augmentations and precision mesh detailing.",
    fullDescription: `The Cyberpunk Ronin Collectible Bust represents the apex of digital sculpting for 3D printing enthusiasts. Designed with meticulous attention to hard-surface mechanical lines juxtaposed against organic anatomy, this bust features detailed cybernetic implants, a tactical visor, and layered composite battle armor.

Optimized for both SLA UV-curable resin printers (yielding museum-grade fidelity) and standard FDM printers with tree supports. The model includes both a solid version and a hollowed version with drainage channels for efficient resin usage. Comes with a dedicated heavy-base display pedestal and alignment keying pins for painless assembly.`,
    categoryId: "cat_miniatures",
    categorySlug: "miniatures-figures",
    categoryName: "Miniatures & Figures",
    supportedPrinters: "SLA / DLP / MSLA Resin & FDM",
    printingSettings: "Layer Height: 0.05mm (Resin) / 0.12mm (FDM) | Infill: 15% Gyroid | Supports: Tree Supports recommended for chin & shoulder pauldrons | Recommended resin: ABS-like Grey",
    licenceType: "Standard Personal Use Licence (Non-commercial, digital resale prohibited)",
    isPublished: true,
    isFeatured: true,
    viewCount: 1842,
    downloadCount: 341,
    prices: {
      USD: 14.99,
      INR: 999,
      EUR: 13.99,
      GBP: 11.99,
      CAD: 19.99,
      AUD: 22.99,
      JPY: 2200,
    },
    compareAtPrices: {
      USD: 24.99,
      INR: 1499,
      EUR: 22.99,
      GBP: 19.99,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
        altText: "Cyberpunk Ronin Bust Render View",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80",
        altText: "Ronin Bust Close-up Details",
        isPrimary: false,
        sortOrder: 1,
      },
      {
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
        altText: "Ronin Bust Display Stand Assembly",
        isPrimary: false,
        sortOrder: 2,
      },
    ],
    files: [
      { fileName: "Cyberpunk_Ronin_Complete_Set.zip", fileType: "ZIP", fileSizeBytes: 184500000, version: "2.1" },
      { fileName: "Ronin_Bust_Solid.stl", fileType: "STL", fileSizeBytes: 89200000, version: "2.1" },
      { fileName: "Ronin_Bust_Hollowed_PreSupported.stl", fileType: "STL", fileSizeBytes: 62400000, version: "2.1" },
      { fileName: "Display_Pedestal_Base.stl", fileType: "STL", fileSizeBytes: 32900000, version: "2.0" },
    ],
    specs: {
      dimensions: "165mm (H) x 112mm (W) x 98mm (D)",
      polygonCount: "1,850,000 Polygons (Water-tight manifold)",
      estimatedPrintTime: "7h 45m on SLA / 14h 20m on FDM",
      materialUsage: "~185g Resin / ~210g PLA",
      supportsRequired: "Yes (Pre-supported resin files included)",
      infillRecommended: "15% Gyroid",
      recommendedFilament: "Elegoo Standard 8K Resin / eSun Matte PLA",
    },
  },
  {
    id: "prod_mechanical_iris",
    title: "Print-in-Place Mechanical Iris Box",
    slug: "print-in-place-mechanical-iris-box",
    shortDescription: "Zero-assembly 8-blade mechanical aperture container. Twisting the outer knurled ring smoothly opens the iris.",
    fullDescription: `The Print-in-Place Mechanical Iris Box is a masterpiece of precision mechanical tolerance design. Fresh off the print bed with zero assembly, glue, or screws required, turning the knurled outer ring causes 8 interconnected curved blades to glide open simultaneously in a cinematic camera aperture motion.

Calibrated specifically for 0.4mm nozzles with 0.35mm internal clearances that snap free on the first twist. Features an internal secure storage cavity perfect for dice, jewelry, keepsake items, or mechanical desk display.`,
    categoryId: "cat_functional",
    categorySlug: "functional-mechanical",
    categoryName: "Functional & Mechanical",
    supportedPrinters: "FDM (Bambu Lab, Prusa, Creality, Anycubic)",
    printingSettings: "Layer Height: 0.16mm - 0.20mm | Infill: 20% Cubic | Supports: NO SUPPORTS (100% Print-in-Place) | Brim: Optional 5mm if bed adhesion is weak | Ironing: Top surfaces enabled",
    licenceType: "Standard Personal Use Licence (Non-commercial)",
    isPublished: true,
    isFeatured: true,
    viewCount: 3120,
    downloadCount: 890,
    prices: {
      USD: 8.99,
      INR: 599,
      EUR: 8.49,
      GBP: 7.49,
      CAD: 11.99,
      AUD: 13.99,
      JPY: 1350,
    },
    compareAtPrices: {
      USD: 14.99,
      INR: 999,
      EUR: 13.99,
      GBP: 11.99,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        altText: "Mechanical Iris Aperture Box in Open State",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
        altText: "Iris Box Mechanism Detail",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    files: [
      { fileName: "Mechanical_Iris_Box_Package.zip", fileType: "ZIP", fileSizeBytes: 42300000, version: "1.4" },
      { fileName: "Mechanical_Iris_Box_PrintInPlace.stl", fileType: "STL", fileSizeBytes: 24100000, version: "1.4" },
      { fileName: "Tolerance_Test_Gauge.stl", fileType: "STL", fileSizeBytes: 5200000, version: "1.0" },
    ],
    specs: {
      dimensions: "95mm (Diameter) x 62mm (Height)",
      polygonCount: "420,000 Polygons",
      estimatedPrintTime: "5h 10m on modern high-speed FDM",
      materialUsage: "~125g Filament",
      supportsRequired: "None (Designed specifically for bridging)",
      infillRecommended: "20% Cubic or Gyroid",
      recommendedFilament: "PLA+ or PETG (Polymaker PolyLite / Prusament)",
    },
  },
  {
    id: "prod_crystal_dragon",
    title: "Articulated Crystal Dragon (Print-in-Place)",
    slug: "articulated-crystal-dragon-print-in-place",
    shortDescription: "Majestic fully articulated crystal-scaled dragon. 48 interconnected joint segments print fully assembled.",
    fullDescription: `A mesmerizing print-in-place articulated dragon featuring razor-sharp crystalline facet plates along its back, head crest, and tail barb. With 48 interconnected ball-and-socket links, the dragon flows with remarkable kinetic flexibility right off the build plate without any assembly.

Engineered with generous print tolerances so even printers without perfect calibration can achieve buttery smooth articulation. Looks extraordinary in dual-color co-extrusion silk filaments, glow-in-the-dark blends, or clear tinted resins.`,
    categoryId: "cat_articulated",
    categorySlug: "articulated-toys",
    categoryName: "Articulated & Toys",
    supportedPrinters: "FDM & Large Format Resin",
    printingSettings: "Layer Height: 0.16mm - 0.20mm | Infill: 15% | Supports: None | Bed Adhesion: Clean textured PEI sheet | First layer speed: 25mm/s",
    licenceType: "Standard Personal Use Licence",
    isPublished: true,
    isFeatured: true,
    viewCount: 5240,
    downloadCount: 1420,
    prices: {
      USD: 11.99,
      INR: 799,
      EUR: 10.99,
      GBP: 9.49,
      CAD: 15.99,
      AUD: 17.99,
      JPY: 1800,
    },
    compareAtPrices: {
      USD: 18.99,
      INR: 1299,
      EUR: 17.49,
      GBP: 14.99,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
        altText: "Articulated Crystal Dragon Coiled",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        altText: "Crystal Dragon Scaled Texture Close-up",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    files: [
      { fileName: "Articulated_Crystal_Dragon_Bundle.zip", fileType: "ZIP", fileSizeBytes: 95400000, version: "3.0" },
      { fileName: "Crystal_Dragon_Full_Length_600mm.stl", fileType: "STL", fileSizeBytes: 48600000, version: "3.0" },
      { fileName: "Crystal_Dragon_Curled_Bed_Fit.stl", fileType: "STL", fileSizeBytes: 46800000, version: "3.0" },
    ],
    specs: {
      dimensions: "610mm (Length outstretched) / 190x190mm (Curled)",
      polygonCount: "860,000 Polygons",
      estimatedPrintTime: "9h 30m on FDM",
      materialUsage: "~160g Silk PLA",
      supportsRequired: "No supports needed",
      infillRecommended: "15% - 20% Gyroid",
      recommendedFilament: "Silk Rainbow PLA / Dichromatic Dual-Color PLA",
    },
  },
  {
    id: "prod_hex_desk_organizer",
    title: "Modular Hexagon Desk Workspace Organizer",
    slug: "modular-hexagon-desk-workspace-organizer",
    shortDescription: "Architectural honeycomb workstation storage grid. Snap-together magnetic modules for pens, phones, and tools.",
    fullDescription: `The Modular Hexagon Desk Organizer is designed for makers, designers, and tech enthusiasts seeking a clean, clutter-free desk setup. Inspired by brutalist and parametric architecture, each hexagonal module interlocks seamlessly using hidden 6x2mm neodymium magnet slots or mechanical snap-tabs.

Includes 7 specialized module layouts:
- Smartphone charging cradle with routed cable channel.
- Micro-SD & USB drive vault.
- Angled stationery / digital stylus slot.
- Deep utility cup for calipers and screwdrivers.
- Low-profile tray for paperclips and small hardware.
- Post-it and sticky pad dispenser.
- Blank customizable core tile.`,
    categoryId: "cat_gadgets",
    categorySlug: "tech-organization",
    categoryName: "Tech & Organization",
    supportedPrinters: "All FDM 3D Printers",
    printingSettings: "Layer Height: 0.20mm | Infill: 15% Grid | Walls: 3 perimeters for strength | Supports: None required",
    licenceType: "Standard Personal Use Licence",
    isPublished: true,
    isFeatured: false,
    viewCount: 1410,
    downloadCount: 395,
    prices: {
      USD: 6.99,
      INR: 449,
      EUR: 6.49,
      GBP: 5.49,
      CAD: 9.49,
      AUD: 10.49,
      JPY: 1050,
    },
    compareAtPrices: {
      USD: 11.99,
      INR: 749,
      EUR: 10.99,
      GBP: 9.49,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
        altText: "Modular Hexagon Organizer Arranged on Desk",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=80",
        altText: "Individual Module Interlocking Detail",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    files: [
      { fileName: "Modular_Hex_Organizer_Full_Pack.zip", fileType: "ZIP", fileSizeBytes: 54200000, version: "1.2" },
      { fileName: "Module_Phone_Dock.stl", fileType: "STL", fileSizeBytes: 7800000, version: "1.2" },
      { fileName: "Module_Pen_Stationery.stl", fileType: "STL", fileSizeBytes: 6900000, version: "1.2" },
      { fileName: "Module_Cable_Organizer.stl", fileType: "STL", fileSizeBytes: 5400000, version: "1.2" },
      { fileName: "Module_SD_USB_Vault.stl", fileType: "STL", fileSizeBytes: 8200000, version: "1.2" },
    ],
    specs: {
      dimensions: "Each module: 85mm (Point-to-point) x 65mm (H)",
      polygonCount: "310,000 Polygons across all 7 modules",
      estimatedPrintTime: "1h 45m per module",
      materialUsage: "~45g PLA per module",
      supportsRequired: "None",
      infillRecommended: "15%",
      recommendedFilament: "Matte Charcoal Black PLA / Stone Grey PLA",
    },
  },
  {
    id: "prod_voronoi_lamp",
    title: "Voronoi Ambient Spiral Vase Lamp",
    slug: "voronoi-ambient-spiral-vase-lamp",
    shortDescription: "Striking parametric Voronoi lattice lampshade. Prints in a single continuous spiral vase mode.",
    fullDescription: `Transform your living space with this parametric Voronoi ambient lampshade. Engineered using mathematical cell-relaxation algorithms, the intricate web-like structure casts gorgeous organic shadow silhouettes across your walls.

Optimized for 1-click Vase Mode (Spiralize Outer Contour in Cura / Spiral Vase in PrusaSlicer and Bambu Studio). Prints seamlessly in under 3 hours without a single retraction or seam line. Sized to fit standard E26/E27 LED lamp sockets and Ikea lamp cords.`,
    categoryId: "cat_home_decor",
    categorySlug: "home-decor",
    categoryName: "Home & Decor",
    supportedPrinters: "All FDM 3D Printers with Vase Mode",
    printingSettings: "Spiral Vase Mode ON | Layer Height: 0.28mm | Line Width: 0.6mm - 0.8mm (using 0.4mm nozzle) | Bottom Solid Layers: 4 | Top Solid Layers: 0",
    licenceType: "Standard Personal Use Licence",
    isPublished: true,
    isFeatured: true,
    viewCount: 2430,
    downloadCount: 615,
    prices: {
      USD: 7.99,
      INR: 499,
      EUR: 7.49,
      GBP: 6.49,
      CAD: 10.99,
      AUD: 11.99,
      JPY: 1200,
    },
    compareAtPrices: {
      USD: 12.99,
      INR: 799,
      EUR: 11.99,
      GBP: 9.99,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
        altText: "Voronoi Spiral Lamp Glowing Warm Light",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
        altText: "Lampshade Geometry Detail",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    files: [
      { fileName: "Voronoi_Spiral_Lamp_Pack.zip", fileType: "ZIP", fileSizeBytes: 38100000, version: "1.1" },
      { fileName: "Voronoi_Lampshade_E27_Base.stl", fileType: "STL", fileSizeBytes: 22400000, version: "1.1" },
      { fileName: "Voronoi_Lampshade_E14_Base.stl", fileType: "STL", fileSizeBytes: 15700000, version: "1.1" },
    ],
    specs: {
      dimensions: "180mm (Diameter) x 215mm (Height)",
      polygonCount: "540,000 Polygons",
      estimatedPrintTime: "2h 45m in Spiral Vase Mode",
      materialUsage: "~95g Translucent PLA / PETG",
      supportsRequired: "None (Zero overhang violations)",
      infillRecommended: "0% (Spiral vase mode)",
      recommendedFilament: "Translucent Clear PETG, Warm White PLA, or Woodfill",
    },
  },
  {
    id: "prod_steampunk_skull",
    title: "Steampunk Chrono-Mechanic Skull",
    slug: "steampunk-chrono-mechanic-skull",
    shortDescription: "Intricate gothic steampunk skull infused with interlocking clockwork gears, vacuum tubes, and rivets.",
    fullDescription: `The Steampunk Chrono-Mechanic Skull is a premier display centerpiece combining Victorian industrial aesthetics with dark fantasy sculpting. Every tooth, gear tooth, copper pressure gauge, and steam valve has been modeled with tactile realism.

Features modular components that can be printed in contrasting materials (e.g. bronze-infused PLA for the gears, bone-white matte resin for the cranium, and dark gunmetal for the ocular lens frame). Includes keyed sockets for effortless press-fit assembly.`,
    categoryId: "cat_miniatures",
    categorySlug: "miniatures-figures",
    categoryName: "Miniatures & Figures",
    supportedPrinters: "Resin (SLA/MSLA) & Precision FDM",
    printingSettings: "Layer Height: 0.04mm (Resin) / 0.12mm (FDM) | Infill: 20% | Supports: Required on jaw underside and eyecup rivets",
    licenceType: "Standard Personal Use Licence",
    isPublished: true,
    isFeatured: false,
    viewCount: 1670,
    downloadCount: 280,
    prices: {
      USD: 16.99,
      INR: 1199,
      EUR: 15.99,
      GBP: 13.99,
      CAD: 22.99,
      AUD: 25.99,
      JPY: 2500,
    },
    compareAtPrices: {
      USD: 24.99,
      INR: 1799,
      EUR: 23.99,
      GBP: 19.99,
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
        altText: "Steampunk Clockwork Skull Frontal Angle",
        isPrimary: true,
        sortOrder: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
        altText: "Steampunk Skull Internal Clockwork Detail",
        isPrimary: false,
        sortOrder: 1,
      },
    ],
    files: [
      { fileName: "Steampunk_Skull_Master_Archive.zip", fileType: "ZIP", fileSizeBytes: 142000000, version: "1.0" },
      { fileName: "Skull_Main_Cranium.stl", fileType: "STL", fileSizeBytes: 68000000, version: "1.0" },
      { fileName: "Steampunk_Gears_Set.stl", fileType: "STL", fileSizeBytes: 42000000, version: "1.0" },
      { fileName: "Monocle_Ocular_Assembly.stl", fileType: "STL", fileSizeBytes: 32000000, version: "1.0" },
    ],
    specs: {
      dimensions: "140mm (W) x 175mm (H) x 195mm (D)",
      polygonCount: "2,100,000 Polygons",
      estimatedPrintTime: "16h 30m on FDM / 8h 15m on MSLA",
      materialUsage: "~340g Material",
      supportsRequired: "Yes (Organic / Tree supports)",
      infillRecommended: "15% - 20%",
      recommendedFilament: "ColorFabb BronzeFill / Anycubic Craftsman Resin",
    },
  },
];
