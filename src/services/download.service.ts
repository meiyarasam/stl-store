import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { createSignedDownloadUrl } from "@/lib/storage/supabase";
import { getProductById } from "./product.service";
import {
  getLocalDevDownloads,
  getLocalDevDownloadByToken,
  saveLocalDevDownload,
} from "./user.service";
import { getOrderById } from "./order.service";

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
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
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

      if (downloads.length > 0) {
        return downloads.map((d: any) => ({
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
      console.warn("getUserDownloads database notice:", err);
    }
  }

  const localDownloads = getLocalDevDownloads(userId);
  return localDownloads.map((d: any) => ({
    id: d.id,
    orderId: d.orderId,
    orderNumber: d.orderNumber,
    productId: d.productId,
    productTitle: d.productTitle,
    productSlug: d.productSlug,
    fileName: d.fileName,
    fileType: d.fileType,
    fileSizeBytes: d.fileSizeBytes,
    downloadToken: d.downloadToken,
    downloadCount: d.downloadCount,
    maxDownloads: d.maxDownloads,
    expiresAt: d.expiresAt,
    isExpired: d.isExpired,
  }));
}

export async function getOrderDownloads(orderId: string): Promise<DownloadItemDTO[]> {
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
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
        return downloads.map((d: any) => ({
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
      console.warn("getOrderDownloads database notice:", err);
    }
  }

  // Check local dev store
  const localList = getLocalDevDownloads(orderId);
  if (localList.length > 0) {
    return localList.map((d: any) => ({
      id: d.id,
      orderId: d.orderId,
      orderNumber: d.orderNumber,
      productId: d.productId,
      productTitle: d.productTitle,
      productSlug: d.productSlug,
      fileName: d.fileName,
      fileType: d.fileType,
      fileSizeBytes: d.fileSizeBytes,
      downloadToken: d.downloadToken,
      downloadCount: d.downloadCount,
      maxDownloads: d.maxDownloads,
      expiresAt: d.expiresAt,
      isExpired: d.isExpired,
    }));
  }

  // Fallback for immediate order items in demo/dev mode
  const order = await getOrderById(orderId);
  if (order && order.paymentStatus === "PAID") {
    const items: DownloadItemDTO[] = [];
    for (const item of order.items) {
      const prod = await getProductById(item.productId);
      const files = prod?.files || [
        {
          fileName: `${item.productSlug}.stl`,
          fileType: "STL",
          fileSizeBytes: 24500000,
        },
      ];

      for (const f of files) {
        items.push({
          id: `dl_${item.productId}_${f.fileName}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId: item.productId,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          fileName: f.fileName,
          fileType: f.fileType,
          fileSizeBytes: Number(f.fileSizeBytes),
          downloadToken: `token_${order.id}_${f.fileName}`,
          downloadCount: 0,
          maxDownloads: 25,
          expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
          isExpired: false,
        });
      }
    }
    return items;
  }

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
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const download = await prisma.download.findUnique({
        where: { downloadToken },
        include: {
          order: true,
          productFile: true,
          product: true,
        },
      });

      if (download) {
        if (download.order.paymentStatus !== "PAID") {
          return { error: "Order payment has not been confirmed", status: 403 };
        }

        if (download.isExpired || new Date() > download.expiresAt) {
          return { error: "This download link has expired", status: 410 };
        }

        if (download.downloadCount >= download.maxDownloads) {
          return { error: `Download limit (${download.maxDownloads} attempts) exceeded for this file`, status: 429 };
        }

        await prisma.download.update({
          where: { id: download.id },
          data: { downloadCount: { increment: 1 } },
        }).catch(() => {});

        const signed = await createSignedDownloadUrl(download.productFile.storagePath, 300);
        if (signed.signedUrl) {
          return { downloadUrl: signed.signedUrl, fileName: download.productFile.fileName };
        }

        return {
          downloadUrl: `/api/downloads/stream?fileId=${encodeURIComponent(download.productFile.id)}`,
          fileName: download.productFile.fileName,
          isStream: true,
        };
      }
    } catch (err) {
      console.warn("processFileDownload database error:", err);
    }
  }

  // Local file-backed download processing
  const localDl = getLocalDevDownloadByToken(downloadToken);
  if (localDl) {
    localDl.downloadCount += 1;
    saveLocalDevDownload(localDl);
    return {
      downloadUrl: `/api/downloads/stream?fileId=${encodeURIComponent(localDl.id)}`,
      fileName: localDl.fileName,
      isStream: true,
    };
  }

  if (downloadToken.startsWith("token_")) {
    return {
      downloadUrl: `/api/downloads/stream?fileId=${encodeURIComponent(downloadToken)}`,
      fileName: "Cyberpunk_Ronin_Complete_Set.zip",
      isStream: true,
    };
  }

  return { error: "Invalid or expired download link", status: 404 };
}
