export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
  rateAgainstUSD: number; // reference fallback rate if custom price is not configured
  minUnitMultiplier: number; // for Razorpay (e.g. 100 for cents/paise, 1 for JPY)
}

export interface CountryConfig {
  code: string;
  name: string;
  defaultCurrency: CurrencyCode;
  dialCode: string;
  flag: string;
}

export type UserRole = "CUSTOMER" | "ADMIN";

export type PaymentStatusType = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderStatusType = "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface ProductPriceItem {
  id?: string;
  currency: CurrencyCode;
  amount: number;
  compareAtAmount?: number | null;
  isEnabled: boolean;
}

export interface ProductFileItem {
  id: string;
  fileName: string;
  fileType: "STL" | "ZIP" | "OBJ" | "THREE_MF";
  fileSizeBytes: number;
  storagePath: string;
  isDownloadable: boolean;
  version: string;
}

export interface ProductImageItem {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  supportedPrinters: string;
  printingSettings?: string | null;
  licenceType: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  prices: ProductPriceItem[];
  images: ProductImageItem[];
  files?: ProductFileItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDTO {
  productId: string;
  product: ProductDTO;
  quantity: number;
  selectedPrice?: number;
  currency?: CurrencyCode;
}

export type CartItem = CartItemDTO;

export interface OrderDTO {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  customerCountry: string;
  currency: CurrencyCode;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatusType;
  orderStatus: OrderStatusType;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productTitle: string;
    productSlug: string;
    currency: CurrencyCode;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
}

