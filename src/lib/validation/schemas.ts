import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters").max(70),
    email: z.string().email("Please provide a valid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    country: z.string().min(2, "Please select your country"),
    phoneCountryCode: z.string().min(1, "Please provide country calling code"),
    phone: z.string().min(6, "Please provide a valid phone number").max(18),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Valid email is required").toLowerCase(),
  customerPhone: z.string().optional(),
  customerCountry: z.string().min(2, "Country is required"),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "CAD", "AUD", "JPY"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1, "Cart cannot be empty"),
  couponCode: z.string().optional(),
});

export const paymentVerifySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export const productCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  shortDescription: z.string().min(10, "Short description required"),
  fullDescription: z.string().min(20, "Full description required"),
  categoryId: z.string().min(1, "Category is required"),
  supportedPrinters: z.string().default("FDM / SLA / Resin"),
  printingSettings: z.string().optional(),
  licenceType: z.string().default("Personal Use Only"),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  prices: z.record(z.string(), z.number().nonnegative()),
  images: z.array(z.string()).min(1, "At least one preview image is required"),
});

