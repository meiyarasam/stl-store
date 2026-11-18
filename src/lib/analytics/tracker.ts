"use client";

const VISITOR_COOKIE_NAME = "tpf_vid";
const SESSION_STORAGE_NAME = "tpf_sid";

function getOrGenerateId(key: string, isSession = false): string {
  if (typeof window === "undefined") return "";

  try {
    if (isSession) {
      let sid = sessionStorage.getItem(key);
      if (!sid) {
        sid = "sid_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        sessionStorage.setItem(key, sid);
      }
      return sid;
    } else {
      let vid = localStorage.getItem(key);
      if (!vid) {
        vid = "vid_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem(key, vid);
      }
      return vid;
    }
  } catch {
    return "anon_" + Math.random().toString(36).substring(2, 11);
  }
}

let lastTrackedPath = "";
let lastTrackedTime = 0;

export async function sendAnalyticsEvent(payload: {
  eventType: "PAGE_VIEW" | "PRODUCT_VIEW" | "ADD_TO_CART" | "CHECKOUT_INITIATED" | "PURCHASE_COMPLETED";
  path?: string;
  referrer?: string;
  productId?: string;
  metadata?: Record<string, any>;
}) {
  if (typeof window === "undefined") return;

  const currentPath = payload.path || window.location.pathname;

  // STRICT REQUIREMENT: Exclude all admin and API paths from customer analytics
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/api")) {
    return;
  }

  // Deduplicate rapid consecutive page views on same route
  const now = Date.now();
  if (
    payload.eventType === "PAGE_VIEW" &&
    lastTrackedPath === currentPath &&
    now - lastTrackedTime < 3000
  ) {
    return;
  }

  if (payload.eventType === "PAGE_VIEW") {
    lastTrackedPath = currentPath;
    lastTrackedTime = now;
  }

  const visitorId = getOrGenerateId(VISITOR_COOKIE_NAME, false);
  const sessionId = getOrGenerateId(SESSION_STORAGE_NAME, true);
  const referrer = payload.referrer !== undefined ? payload.referrer : document.referrer || "";

  const eventData = {
    eventType: payload.eventType,
    visitorId,
    sessionId,
    path: currentPath,
    referrer: referrer ? referrer.substring(0, 500) : null,
    productId: payload.productId || null,
    metadata: payload.metadata || null,
  };

  try {
    const body = JSON.stringify(eventData);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/collect", blob);
    } else {
      fetch("/api/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Fail silently without disrupting user experience
  }
}

export function trackPageView(path?: string) {
  return sendAnalyticsEvent({ eventType: "PAGE_VIEW", path });
}

export function trackProductView(productId: string, metadata?: Record<string, any>) {
  return sendAnalyticsEvent({ eventType: "PRODUCT_VIEW", productId, metadata });
}

export function trackAddToCart(productId: string, metadata?: Record<string, any>) {
  return sendAnalyticsEvent({ eventType: "ADD_TO_CART", productId, metadata });
}

export function trackCheckoutInitiated(metadata?: Record<string, any>) {
  return sendAnalyticsEvent({ eventType: "CHECKOUT_INITIATED", metadata });
}

export function trackPurchaseCompleted(metadata?: Record<string, any>) {
  return sendAnalyticsEvent({ eventType: "PURCHASE_COMPLETED", metadata });
}
