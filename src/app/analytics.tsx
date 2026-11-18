"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { trackPageView } from "@/lib/analytics/tracker";

/**
 * Tracks customer-facing page views in first-party database.
 * Strictly excludes /admin routes.
 */
function CustomerRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname === "/admin" || pathname.startsWith("/admin/")) {
      return;
    }
    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Client-side Analytics wrapper for Vercel Web Analytics & First-Party Analytics.
 * Filters out all administrative dashboard traffic (/admin and all subpaths)
 * while preserving tracking for all customer-facing routes.
 */
export function AnalyticsWrapper() {
  return (
    <>
      <VercelAnalytics
        beforeSend={(event) => {
          try {
            const url = new URL(event.url, "https://theprintfactory.com");
            const pathname = url.pathname;

            // Exclude /admin and any nested admin routes
            if (pathname === "/admin" || pathname.startsWith("/admin/")) {
              return null;
            }
          } catch {
            if (
              event.url === "/admin" ||
              event.url.startsWith("/admin/") ||
              event.url.includes("/admin/")
            ) {
              return null;
            }
          }
          return event;
        }}
      />
      <Suspense fallback={null}>
        <CustomerRouteTracker />
      </Suspense>
    </>
  );
}

export { AnalyticsWrapper as Analytics };
export default AnalyticsWrapper;
