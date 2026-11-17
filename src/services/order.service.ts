import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { getProductById } from "./product.service";
import { CurrencyCode, OrderDTO, OrderStatusType, PaymentStatusType } from "@/types";
import { getEffectiveProductPrice } from "@/lib/currency/currencies";
import {
  saveLocalDevOrder,
  getLocalDevOrder,
  getAllLocalDevOrders,
  getLocalDevOrdersByUser,
  saveLocalDevDownload,
  StoredOrder,
} from "./user.service";

export interface CreateOrderParams {
  userId?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  customerCountry: string;
  currency: CurrencyCode;
  items: {
    productId: string;
    quantity: number;
  }[];
  couponCode?: string;
}

export async function createPendingOrder(params: CreateOrderParams): Promise<{
  order: OrderDTO;
  internalId: string;
  amount: number;
  currency: CurrencyCode;
}> {
  const { customerEmail, customerName, customerPhone, customerCountry, currency, items } = params;

  // 1. Authoritative price calculation on server
  let subtotal = 0;
  const resolvedItems: {
    productId: string;
    productTitle: string;
    productSlug: string;
    currency: CurrencyCode;
    unitPrice: number;
    quantity: number;
    total: number;
  }[] = [];

  for (const item of items) {
    const prod = await getProductById(item.productId);
    if (!prod) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const { amount } = getEffectiveProductPrice(prod.prices, currency);
    const itemTotal = Number((amount * item.quantity).toFixed(2));
    subtotal += itemTotal;

    resolvedItems.push({
      productId: prod.id,
      productTitle: prod.title,
      productSlug: prod.slug,
      currency,
      unitPrice: amount,
      quantity: item.quantity,
      total: itemTotal,
    });
  }

  const discount = 0;
  const tax = 0;
  const total = Number((subtotal - discount + tax).toFixed(2));
  const orderNumber = `STL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const dbOrder = await prisma.order.create({
        data: {
          orderNumber,
          userId: params.userId || null,
          customerEmail,
          customerName,
          customerPhone,
          customerCountry,
          currency,
          subtotal,
          discount,
          tax,
          total,
          paymentStatus: "PENDING",
          orderStatus: "PROCESSING",
          items: {
            create: resolvedItems.map((i) => ({
              productId: i.productId,
              productTitle: i.productTitle,
              productSlug: i.productSlug,
              currency: i.currency,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              total: i.total,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        order: {
          id: dbOrder.id,
          orderNumber: dbOrder.orderNumber,
          userId: dbOrder.userId,
          customerEmail: dbOrder.customerEmail,
          customerName: dbOrder.customerName,
          customerPhone: dbOrder.customerPhone,
          customerCountry: dbOrder.customerCountry,
          currency: dbOrder.currency as CurrencyCode,
          subtotal: Number(dbOrder.subtotal),
          discount: Number(dbOrder.discount),
          tax: Number(dbOrder.tax),
          total: Number(dbOrder.total),
          paymentStatus: dbOrder.paymentStatus as PaymentStatusType,
          orderStatus: dbOrder.orderStatus as OrderStatusType,
          razorpayOrderId: dbOrder.razorpayOrderId,
          createdAt: dbOrder.createdAt.toISOString(),
          items: dbOrder.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productTitle: i.productTitle,
            productSlug: i.productSlug,
            currency: i.currency as CurrencyCode,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            total: Number(i.total),
          })),
        },
        internalId: dbOrder.id,
        amount: total,
        currency,
      };
    } catch (err) {
      console.warn("Prisma order creation fallback for local development:", err);
    }
  }

  // File-backed local dev store
  const mockId = `order_${Date.now()}`;
  const localOrder: StoredOrder = {
    id: mockId,
    orderNumber,
    userId: params.userId || null,
    customerEmail,
    customerName,
    customerPhone: customerPhone || null,
    customerCountry,
    currency,
    subtotal,
    discount,
    tax,
    total,
    paymentStatus: "PENDING",
    orderStatus: "PROCESSING",
    createdAt: new Date().toISOString(),
    items: resolvedItems.map((i, idx) => ({
      id: `item_${mockId}_${idx}`,
      ...i,
    })),
  };
  saveLocalDevOrder(localOrder);

  return {
    order: {
      ...localOrder,
      currency: localOrder.currency as CurrencyCode,
      paymentStatus: localOrder.paymentStatus as PaymentStatusType,
      orderStatus: localOrder.orderStatus as OrderStatusType,
      items: localOrder.items.map((i: any) => ({ ...i, currency: i.currency as CurrencyCode })),
    },
    internalId: mockId,
    amount: total,
    currency,
  };
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  const dbOnline = await isDatabaseReachable();
  if (dbOnline) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpayOrderId },
      });
      return;
    } catch (err) {
      console.warn("attachRazorpayOrderId error:", err);
    }
  }

  const local = getLocalDevOrder(orderId);
  if (local) {
    local.razorpayOrderId = razorpayOrderId;
    saveLocalDevOrder(local);
  }
}

export async function markOrderPaidAndGenerateDownloads({
  orderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = "Razorpay",
}: {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod?: string;
}): Promise<OrderDTO | null> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: { files: true },
              },
            },
          },
        },
      });

      if (order) {
        if (order.paymentStatus === "PAID") {
          return getOrderById(order.id);
        }

        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            orderStatus: "COMPLETED",
            razorpayPaymentId,
            razorpaySignature,
            paymentMethod,
            paidAt: new Date(),
          },
          include: {
            items: {
              include: {
                product: {
                  include: { files: true },
                },
              },
            },
          },
        });

        // Generate Downloads and Record Payment concurrently in parallel
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);

        const downloadOps: Promise<any>[] = [];
        for (const item of updatedOrder.items) {
          if (item.product?.files && item.product.files.length > 0) {
            for (const file of item.product.files) {
              downloadOps.push(
                prisma.download.create({
                  data: {
                    orderId: updatedOrder.id,
                    orderItemId: item.id,
                    productId: item.productId,
                    productFileId: file.id,
                    userId: updatedOrder.userId,
                    expiresAt,
                    maxDownloads: 25,
                  },
                }).catch(() => {})
              );
            }
          }
        }

        const paymentOp = prisma.payment.create({
          data: {
            orderId: updatedOrder.id,
            razorpayOrderId: updatedOrder.razorpayOrderId || "manual_order",
            razorpayPaymentId,
            razorpaySignature,
            amount: updatedOrder.total,
            currency: updatedOrder.currency,
            status: "PAID",
            paymentMethod,
          },
        }).catch(() => {});

        // Await all writes concurrently
        await Promise.all([paymentOp, ...downloadOps]);

        // Return order directly without redundant roundtrip query
        return {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          userId: updatedOrder.userId,
          customerEmail: updatedOrder.customerEmail,
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          customerCountry: updatedOrder.customerCountry,
          currency: updatedOrder.currency as CurrencyCode,
          subtotal: Number(updatedOrder.subtotal),
          discount: Number(updatedOrder.discount),
          tax: Number(updatedOrder.tax),
          total: Number(updatedOrder.total),
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          razorpayOrderId: updatedOrder.razorpayOrderId,
          razorpayPaymentId: updatedOrder.razorpayPaymentId,
          paymentMethod: updatedOrder.paymentMethod,
          paidAt: updatedOrder.paidAt?.toISOString() || null,
          createdAt: updatedOrder.createdAt.toISOString(),
          items: updatedOrder.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productTitle: i.productTitle,
            productSlug: i.productSlug,
            currency: i.currency as CurrencyCode,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            total: Number(i.total),
          })),
        };
      }
    } catch (err) {
      console.warn("markOrderPaid database error:", err);
    }
  }

  // Local file-backed dev order update
  const localOrder = getLocalDevOrder(orderId);
  if (localOrder) {
    localOrder.paymentStatus = "PAID";
    localOrder.orderStatus = "COMPLETED";
    localOrder.razorpayPaymentId = razorpayPaymentId;
    localOrder.paymentMethod = paymentMethod;
    saveLocalDevOrder(localOrder);

    // Generate local download tokens for each item
    for (const item of localOrder.items) {
      const prod = await getProductById(item.productId);
      const files = prod?.files || [
        {
          fileName: `${item.productSlug}.stl`,
          fileType: "STL",
          fileSizeBytes: 24500000,
        },
      ];

      for (const f of files) {
        saveLocalDevDownload({
          id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: localOrder.id,
          orderNumber: localOrder.orderNumber,
          userId: localOrder.userId,
          productId: item.productId,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          fileName: f.fileName,
          fileType: f.fileType,
          fileSizeBytes: Number(f.fileSizeBytes),
          downloadToken: `token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          downloadCount: 0,
          maxDownloads: 25,
          expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
          isExpired: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    return {
      ...localOrder,
      currency: localOrder.currency as CurrencyCode,
      paymentStatus: "PAID",
      orderStatus: "COMPLETED",
      items: localOrder.items.map((i: any) => ({ ...i, currency: i.currency as CurrencyCode })),
    };
  }

  return null;
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  const dbOnline = await isDatabaseReachable();
  if (dbOnline) {
    try {
      const o = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (o) {
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerCountry: o.customerCountry,
          currency: o.currency as CurrencyCode,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          tax: Number(o.tax),
          total: Number(o.total),
          paymentStatus: o.paymentStatus as PaymentStatusType,
          orderStatus: o.orderStatus as OrderStatusType,
          razorpayOrderId: o.razorpayOrderId,
          razorpayPaymentId: o.razorpayPaymentId,
          paymentMethod: o.paymentMethod,
          paidAt: o.paidAt?.toISOString() || null,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productTitle: i.productTitle,
            productSlug: i.productSlug,
            currency: i.currency as CurrencyCode,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            total: Number(i.total),
          })),
        };
      }
    } catch (err) {
      console.warn("getOrderById database error:", err);
    }
  }

  const local = getLocalDevOrder(id);
  if (local) {
    return {
      ...local,
      currency: local.currency as CurrencyCode,
      paymentStatus: local.paymentStatus as PaymentStatusType,
      orderStatus: local.orderStatus as OrderStatusType,
      items: local.items.map((i: any) => ({ ...i, currency: i.currency as CurrencyCode })),
    };
  }

  return null;
}

export async function getUserOrders(userId: string): Promise<OrderDTO[]> {
  const dbOnline = await isDatabaseReachable();
  if (dbOnline) {
    try {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      if (orders.length > 0) {
        return orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          customerCountry: o.customerCountry,
          currency: o.currency as CurrencyCode,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          tax: Number(o.tax),
          total: Number(o.total),
          paymentStatus: o.paymentStatus as PaymentStatusType,
          orderStatus: o.orderStatus as OrderStatusType,
          razorpayOrderId: o.razorpayOrderId,
          razorpayPaymentId: o.razorpayPaymentId,
          paidAt: o.paidAt?.toISOString() || null,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i: any) => ({
            id: i.id,
            productId: i.productId,
            productTitle: i.productTitle,
            productSlug: i.productSlug,
            currency: i.currency as CurrencyCode,
            unitPrice: Number(i.unitPrice),
            quantity: i.quantity,
            total: Number(i.total),
          })),
        }));
      }
    } catch (err) {
      console.warn("getUserOrders database error:", err);
    }
  }

  const localList = getLocalDevOrdersByUser(userId);
  return localList.map((o: any) => ({
    ...o,
    currency: o.currency as CurrencyCode,
    paymentStatus: o.paymentStatus as PaymentStatusType,
    orderStatus: o.orderStatus as OrderStatusType,
    items: o.items.map((i: any) => ({ ...i, currency: i.currency as CurrencyCode })),
  }));
}
