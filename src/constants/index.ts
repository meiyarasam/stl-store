export * from "./currencies";

export const APP_CONFIG = {
  name: "The Print Factory",
  fullName: "THE PRINT FACTORY",
  tagline: "DESIGN. PRINT. CREATE.",
  description: "A premium international marketplace for digital 3D-printable products.",
  supportEmail: "support@theprintfactory.com",
  adminDefaultEmail: "admin@theprintfactory.com",
  merchantProfileUrl: "https://razorpay.me/@meiyarasan",
  defaultCurrency: "USD" as const,
  downloadLinkValidityDays: 365,
  maxDownloadAttempts: 25,
  signedUrlExpirationSeconds: 300,
} as const;
