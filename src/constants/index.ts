export * from "./currencies";

export const APP_CONFIG = {
  name: "STLForge",
  tagline: "Design. Download. Create.",
  description: "A premium international marketplace for digital 3D-printable products.",
  supportEmail: "support@stlforge.com",
  adminDefaultEmail: "admin@stlforge.com",
  merchantProfileUrl: "https://razorpay.me/@meiyarasan",
  defaultCurrency: "USD" as const,
  downloadLinkValidityDays: 365,
  maxDownloadAttempts: 25,
  signedUrlExpirationSeconds: 300,
} as const;
