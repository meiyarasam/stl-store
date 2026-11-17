export * from "./currencies";

export const APP_CONFIG = {
  name: "The Print Factory",
  fullName: "THE PRINT FACTORY",
  tagline: "BUY. PRINT. RELAX.",
  description: "A premium international marketplace for digital 3D-printable products.",
  supportEmail: "theprintfactory2026@gmail.com",
  adminDefaultEmail: "theprintfactory2026@gmail.com",
  merchantProfileUrl: "https://razorpay.me/@meiyarasan",
  defaultCurrency: "USD" as const,
  downloadLinkValidityDays: 365,
  maxDownloadAttempts: 25,
  signedUrlExpirationSeconds: 300,
} as const;
