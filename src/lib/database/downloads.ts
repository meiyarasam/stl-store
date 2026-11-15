import prisma from "@/lib/database/prisma";
import { createSignedDownloadUrl } from "@/lib/storage/supabase";
import { getProductById } from "./products";

export interface DownloadItemDTO {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
  isExpired: boolean;
  downloadUrl?: string;
}

export async function getUserDownloads(userId: string): Promise<DownloadItemDTO[]> {
  try {
    const downloads = await prisma.download.findMany({
      where: {
        userId,
        order: { paymentStatus: "PAID" },
      },
      include: {
        order: true,
        product: true,
        productFile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return downloads.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      orderNumber: d.order.orderNumber,
      productId: d.productId,
      productTitle: d.product.title,
      productSlug: d.product.slug,
      fileName: d.productFile.fileName,
      fileType: d.productFile.fileType,
      fileSizeBytes: Number(d.productFile.fileSizeBytes),
      downloadToken: d.downloadToken,
      downloadCount: d.downloadCount,
      maxDownloads: d.maxDownloads,
      expiresAt: d.expiresAt.toISOString(),
      isExpired: d.isExpired || new Date() > d.expiresAt || d.downloadCount >= d.maxDownloads,
    }));
  } catch (err) {
    console.warn("getUserDownloads fallback:", err);
    return [];
  }
}

export async function getOrderDownloads(orderId: string): Promise<DownloadItemDTO[]> {
  try {
    const downloads = await prisma.download.findMany({
      where: {
        orderId,
        order: { paymentStatus: "PAID" },
      },
      include: {
        order: true,
        product: true,
        productFile: true,
      },
    });

    if (downloads.length > 0) {
      return downloads.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        orderNumber: d.order.orderNumber,
        productId: d.productId,
        productTitle: d.product.title,
        productSlug: d.product.slug,
        fileName: d.productFile.fileName,
        fileType: d.productFile.fileType,
        fileSizeBytes: Number(d.productFile.fileSizeBytes),
        downloadToken: d.downloadToken,
        downloadCount: d.downloadCount,
        maxDownloads: d.maxDownloads,
        expiresAt: d.expiresAt.toISOString(),
        isExpired: d.isExpired || new Date() > d.expiresAt || d.downloadCount >= d.maxDownloads,
      }));
    }
  } catch (err) {
    console.warn("getOrderDownloads fallback:", err);
  }

  // Fallback for immediate order items in demo/dev mode
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order && order.paymentStatus === "PAID") {
      const items: DownloadItemDTO[] = [];
      for (const item of order.items) {
        const prod = await getProductById(item.productId);
        if (prod?.files) {
          for (const f of prod.files) {
            items.push({
              id: `dl_${f.id}`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              productId: prod.id,
              productTitle: prod.title,
              productSlug: prod.slug,
              fileName: f.fileName,
              fileType: f.fileType,
              fileSizeBytes: f.fileSizeBytes,
              downloadToken: `token_${order.id}_${f.id}`,
              downloadCount: 0,
              maxDownloads: 25,
              expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
              isExpired: false,
            });
          }
        }
      }
      return items;
    }
  } catch (e) {}

  return [];
}

export async function processFileDownload({
  downloadToken,
  ipAddress,
  userAgent,
}: {
  downloadToken: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ downloadUrl: string; fileName: string; isStream?: boolean } | { error: string; status: number }> {
  try {
    const download = await prisma.download.findUnique({
      where: { downloadToken },
      include: {
        order: true,
        productFile: true,
        product: true,
      },
    });

    if (!download) {
      // Check if it's a dev simulated token
      if (downloadToken.startsWith("token_")) {
        const parts = downloadToken.split("_");
        const fileId = parts.slice(2).join("_");
        return {
          downloadUrl: `/api/downloads/stream?fileId=${encodeURIComponent(fileId)}`,
          fileName: "Cyberpunk_Ronin_Complete_Set.zip",
          isStream: true,
        };
      }
      return { error: "Invalid or expired download link", status: 404 };
    }

    if (download.order.paymentStatus !== "PAID") {
      return { error: "Order payment has not been confirmed", status: 403 };
    }

    if (download.isExpired || new Date() > download.expiresAt) {
      return { error: "This download link has expired", status: 410 };
    }

    if (download.downloadCount >= download.maxDownloads) {
      return { error: `Download limit (${download.maxDownloads} attempts) exceeded for this file`, status: 429 };
    }

    // Increment download counter and log attempt
    await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: { increment: 1 },
        downloadedAt: new Date(),
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    // Request signed URL from Supabase Storage (5 min expiry)
    const { signedUrl, error } = await createSignedDownloadUrl(download.productFile.storagePath, 300);

    if (error || !signedUrl) {
      // Fallback stream
      return {
        downloadUrl: `/api/downloads/stream?path=${encodeURIComponent(download.productFile.storagePath)}`,
        fileName: download.productFile.fileName,
        isStream: true,
      };
    }

    return {
      downloadUrl: signedUrl,
      fileName: download.productFile.fileName,
    };
  } catch (err: any) {
    console.error("processFileDownload error:", err);
    return { error: "Internal download processing error", status: 500 };
  }
}
