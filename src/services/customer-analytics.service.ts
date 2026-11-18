import prisma from "@/lib/database/prisma";
import { getLiveExchangeRates, SupportedTargetCurrency } from "@/services/currency.service";

export type AnalyticsTimeframe = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export interface CustomerAnalyticsData {
  timeframe: AnalyticsTimeframe;
  dateRange: {
    startDate: string;
    endDate: string;
    label: string;
  };

  // 1. Overview Cards
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    totalPageViews: number;
    registeredCustomers: number;
    totalRegisteredAllTime: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenueINR: number;
    totalRevenueUSD: number;
    conversionRate: number; // percentage
  };

  // 2. Traffic Analytics
  traffic: {
    trends: {
      date: string;
      label: string;
      pageViews: number;
      uniqueVisitors: number;
      orders: number;
      revenueINR: number;
    }[];
    mostVisitedPages: {
      path: string;
      pageViews: number;
      uniqueVisitors: number;
      percentage: number;
    }[];
    newVsReturning: {
      newVisitors: number;
      returningVisitors: number;
      newPercentage: number;
      returningPercentage: number;
    };
    trafficSources: {
      source: string;
      visitors: number;
      percentage: number;
    }[];
  };

  // 3. Product Analytics
  products: {
    mostViewed: {
      productId: string;
      title: string;
      slug: string;
      imageUrl: string | null;
      categoryName: string;
      views: number;
    }[];
    bestSellers: {
      productId: string;
      title: string;
      slug: string;
      imageUrl: string | null;
      categoryName: string;
      unitsSold: number;
      revenueINR: number;
    }[];
    highestRevenue: {
      productId: string;
      title: string;
      slug: string;
      revenueINR: number;
      unitsSold: number;
    }[];
    highestConverting: {
      productId: string;
      title: string;
      slug: string;
      views: number;
      orders: number;
      conversionRate: number;
    }[];
    productStats: {
      productId: string;
      title: string;
      slug: string;
      category: string;
      views: number;
      unitsSold: number;
      revenueINR: number;
      conversionRate: number;
    }[];
  };

  // 4. Customer Analytics
  customers: {
    totalRegistered: number;
    newRegistrations: number;
    returningCustomers: number;
    recentActivity: {
      id: string;
      type: "ORDER" | "REGISTRATION" | "DOWNLOAD";
      customerName: string;
      customerEmail: string;
      customerCountry: string | null;
      timestamp: string;
      description: string;
      amount?: number;
      currency?: string;
    }[];
    topCustomers: {
      id: string;
      name: string | null;
      email: string;
      country: string | null;
      orderCount: number;
      totalSpentINR: number;
      registeredAt: string;
    }[];
  };

  // 5. Sales Analytics
  sales: {
    totalSales: number;
    completedOrders: number;
    pendingOrders: number;
    failedOrders: number;
    refundedOrders: number;
    totalRevenueINR: number;
    totalRevenueUSD: number;
    averageOrderValueINR: number;
    averageOrderValueUSD: number;
    revenueTrends: {
      date: string;
      label: string;
      revenueINR: number;
      revenueUSD: number;
      orders: number;
    }[];
  };

  lastUpdated: string;
}

export function parseDateRange(
  filter: AnalyticsTimeframe = "30d",
  customStart?: string,
  customEnd?: string
): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();
  const endDate = customEnd ? new Date(customEnd) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let startDate: Date;
  let label = "Last 30 Days";

  switch (filter) {
    case "today": {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      label = "Today";
      break;
    }
    case "7d": {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      label = "Last 7 Days";
      break;
    }
    case "30d": {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      label = "Last 30 Days";
      break;
    }
    case "90d": {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      label = "Last 90 Days";
      break;
    }
    case "year": {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      label = "This Year";
      break;
    }
    case "custom": {
      if (customStart) {
        startDate = new Date(customStart);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
      }
      label = "Custom Range";
      break;
    }
    default: {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      label = "Last 30 Days";
    }
  }

  return { startDate, endDate, label };
}

export async function getCustomerAnalyticsData(
  filter: AnalyticsTimeframe = "30d",
  customStart?: string,
  customEnd?: string
): Promise<CustomerAnalyticsData> {
  const { startDate, endDate, label } = parseDateRange(filter, customStart, customEnd);

  // 1. Exchange rates for currency conversion
  let exchangeRatesMap: Record<SupportedTargetCurrency, number> = {
    USD: 0.01059,
    EUR: 0.00962,
    GBP: 0.00803,
    CAD: 0.01514,
    AUD: 0.01563,
    JPY: 1.69658,
  };
  try {
    const ratesData = await getLiveExchangeRates();
    if (ratesData?.rates) exchangeRatesMap = ratesData.rates;
  } catch (err) {
    console.warn("Live exchange rate lookup in customer analytics:", err);
  }

  // 2. Fetch data in parallel
  const [
    // Events in period
    events,
    // Prior visitors to detect new vs returning
    priorVisitors,
    // All orders in period
    ordersInPeriod,
    // All time orders for returning customer calculation
    allOrders,
    // Customers created in period
    newCustomersCount,
    // Total registered customers all time
    totalRegisteredAllTime,
    // Products
    allProducts,
    // Recent registrations
    recentRegistrations,
    // Recent downloads
    recentDownloads,
  ] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { lt: startDate },
      },
      select: { visitorId: true },
      distinct: ["visitorId"],
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      select: {
        customerEmail: true,
        paymentStatus: true,
      },
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, country: true, createdAt: true },
    }),
    prisma.download.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { title: true } },
        order: { select: { customerName: true, customerEmail: true, customerCountry: true } },
      },
    }),
  ]);

  // 3. Process Visitors & Page Views
  const priorVisitorIds = new Set(priorVisitors.map((v) => v.visitorId));
  const uniqueVisitorIds = new Set<string>();
  let totalPageViews = 0;
  const pathViews: Record<string, { views: number; uniqueVisitors: Set<string> }> = {};
  const productViewsCount: Record<string, number> = {};
  const referrerMap: Record<string, Set<string>> = {};

  let newVisitorsCount = 0;
  let returningVisitorsCount = 0;

  for (const ev of events) {
    uniqueVisitorIds.add(ev.visitorId);

    if (ev.eventType === "PAGE_VIEW") {
      totalPageViews++;

      if (!pathViews[ev.path]) {
        pathViews[ev.path] = { views: 0, uniqueVisitors: new Set() };
      }
      pathViews[ev.path].views++;
      pathViews[ev.path].uniqueVisitors.add(ev.visitorId);

      // Traffic source parsing
      let source = "Direct / Bookmark";
      if (ev.referrer) {
        try {
          const refHost = new URL(ev.referrer).hostname.toLowerCase().replace(/^www\./, "");
          if (refHost.includes("google")) source = "Google Search";
          else if (refHost.includes("bing")) source = "Bing Search";
          else if (refHost.includes("facebook") || refHost.includes("fb.me")) source = "Facebook";
          else if (refHost.includes("twitter") || refHost.includes("x.com")) source = "X (Twitter)";
          else if (refHost.includes("reddit")) source = "Reddit";
          else if (refHost.includes("instagram")) source = "Instagram";
          else if (refHost.includes("youtube")) source = "YouTube";
          else source = refHost;
        } catch {
          source = "Referral";
        }
      }
      if (!referrerMap[source]) referrerMap[source] = new Set();
      referrerMap[source].add(ev.visitorId);
    } else if (ev.eventType === "PRODUCT_VIEW" && ev.productId) {
      productViewsCount[ev.productId] = (productViewsCount[ev.productId] || 0) + 1;
    }
  }

  // Calculate new vs returning visitors
  for (const vId of uniqueVisitorIds) {
    if (priorVisitorIds.has(vId)) {
      returningVisitorsCount++;
    } else {
      newVisitorsCount++;
    }
  }

  const totalUniqueVisitors = uniqueVisitorIds.size;
  const newVsReturningTotal = newVisitorsCount + returningVisitorsCount;
  const newPercentage = newVsReturningTotal > 0 ? Math.round((newVisitorsCount / newVsReturningTotal) * 100) : 0;
  const returningPercentage = newVsReturningTotal > 0 ? Math.round((returningVisitorsCount / newVsReturningTotal) * 100) : 0;

  // Most Visited Pages
  const mostVisitedPages = Object.entries(pathViews)
    .map(([path, data]) => ({
      path,
      pageViews: data.views,
      uniqueVisitors: data.uniqueVisitors.size,
      percentage: totalPageViews > 0 ? Math.round((data.views / totalPageViews) * 100) : 0,
    }))
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, 10);

  // Traffic Sources
  const trafficSources = Object.entries(referrerMap)
    .map(([source, visitorSet]) => ({
      source,
      visitors: visitorSet.size,
      percentage: totalUniqueVisitors > 0 ? Math.round((visitorSet.size / totalUniqueVisitors) * 100) : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);

  // 4. Process Orders & Revenue
  const completedOrdersList = ordersInPeriod.filter((o) => o.paymentStatus === "PAID");
  const pendingOrdersList = ordersInPeriod.filter((o) => o.paymentStatus === "PENDING");
  const failedOrdersList = ordersInPeriod.filter((o) => o.paymentStatus === "FAILED");

  let totalRevenueINR = 0;
  let totalRevenueUSD = 0;

  for (const o of completedOrdersList) {
    const amt = Number(o.total) || 0;
    if (o.currency === "INR") {
      totalRevenueINR += amt;
      totalRevenueUSD += amt * exchangeRatesMap.USD;
    } else if (o.currency === "USD") {
      totalRevenueUSD += amt;
      totalRevenueINR += exchangeRatesMap.USD > 0 ? amt / exchangeRatesMap.USD : amt * 85;
    } else {
      totalRevenueINR += amt;
      totalRevenueUSD += amt * exchangeRatesMap.USD;
    }
  }

  totalRevenueINR = Math.round(totalRevenueINR);
  totalRevenueUSD = Number(totalRevenueUSD.toFixed(2));

  const averageOrderValueINR = completedOrdersList.length > 0 ? Math.round(totalRevenueINR / completedOrdersList.length) : 0;
  const averageOrderValueUSD = completedOrdersList.length > 0 ? Number((totalRevenueUSD / completedOrdersList.length).toFixed(2)) : 0;

  // Conversion Rate: (completedOrders / uniqueVisitors) * 100
  const conversionRate = totalUniqueVisitors > 0
    ? Number(((completedOrdersList.length / totalUniqueVisitors) * 100).toFixed(2))
    : completedOrdersList.length > 0 ? 100 : 0;

  // Returning Customers (from all orders)
  const paidOrdersByEmail: Record<string, number> = {};
  for (const o of allOrders) {
    if (o.paymentStatus === "PAID" && o.customerEmail) {
      paidOrdersByEmail[o.customerEmail] = (paidOrdersByEmail[o.customerEmail] || 0) + 1;
    }
  }
  const returningCustomersCount = Object.values(paidOrdersByEmail).filter((cnt) => cnt > 1).length;

  // 5. Daily Trends Timeline
  const trendBuckets: Record<string, { label: string; pageViews: number; uniqueVisitors: Set<string>; orders: number; revenueINR: number }> = {};
  
  // Initialize date buckets for each day in range (up to 30 days)
  const daysDiff = Math.max(1, Math.min(60, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))));
  for (let i = daysDiff - 1; i >= 0; i--) {
    const d = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    trendBuckets[key] = { label, pageViews: 0, uniqueVisitors: new Set(), orders: 0, revenueINR: 0 };
  }

  // Populate events into trend buckets
  for (const ev of events) {
    const key = ev.createdAt.toISOString().split("T")[0];
    if (trendBuckets[key]) {
      if (ev.eventType === "PAGE_VIEW") trendBuckets[key].pageViews++;
      trendBuckets[key].uniqueVisitors.add(ev.visitorId);
    }
  }

  // Populate orders into trend buckets
  for (const o of completedOrdersList) {
    const key = o.createdAt.toISOString().split("T")[0];
    if (trendBuckets[key]) {
      trendBuckets[key].orders++;
      const amt = Number(o.total) || 0;
      trendBuckets[key].revenueINR += o.currency === "INR" ? amt : (exchangeRatesMap.USD > 0 ? amt / exchangeRatesMap.USD : amt * 85);
    }
  }

  const trends = Object.entries(trendBuckets).map(([date, data]) => ({
    date,
    label: data.label,
    pageViews: data.pageViews,
    uniqueVisitors: data.uniqueVisitors.size,
    orders: data.orders,
    revenueINR: Math.round(data.revenueINR),
  }));

  const revenueTrends = trends.map((t) => ({
    date: t.date,
    label: t.label,
    revenueINR: t.revenueINR,
    revenueUSD: Number((t.revenueINR * exchangeRatesMap.USD).toFixed(2)),
    orders: t.orders,
  }));

  // 6. Product Sales & View Performance
  const productSalesMap: Record<string, { unitsSold: number; revenueINR: number; ordersCount: number }> = {};
  for (const o of completedOrdersList) {
    for (const item of o.items) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { unitsSold: 0, revenueINR: 0, ordersCount: 0 };
      }
      const itemQty = item.quantity || 1;
      const itemTotal = Number(item.total) || 0;
      productSalesMap[item.productId].unitsSold += itemQty;
      productSalesMap[item.productId].ordersCount += 1;
      productSalesMap[item.productId].revenueINR += item.currency === "INR" ? itemTotal : (exchangeRatesMap.USD > 0 ? itemTotal / exchangeRatesMap.USD : itemTotal * 85);
    }
  }

  const productStats = allProducts.map((p) => {
    const sales = productSalesMap[p.id] || { unitsSold: 0, revenueINR: 0, ordersCount: 0 };
    const views = productViewsCount[p.id] || p.viewCount || 0;
    const conversionRate = views > 0 ? Number(((sales.ordersCount / views) * 100).toFixed(1)) : 0;
    const imageUrl = p.images[0]?.url || "/images/logo.png";

    return {
      productId: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category?.name || "General",
      imageUrl,
      views,
      unitsSold: sales.unitsSold,
      revenueINR: Math.round(sales.revenueINR),
      conversionRate,
    };
  });

  const mostViewed = [...productStats]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((p) => ({
      productId: p.productId,
      title: p.title,
      slug: p.slug,
      imageUrl: p.imageUrl,
      categoryName: p.category,
      views: p.views,
    }));

  const bestSellers = [...productStats]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)
    .map((p) => ({
      productId: p.productId,
      title: p.title,
      slug: p.slug,
      imageUrl: p.imageUrl,
      categoryName: p.category,
      unitsSold: p.unitsSold,
      revenueINR: p.revenueINR,
    }));

  const highestRevenue = [...productStats]
    .filter((p) => p.revenueINR > 0)
    .sort((a, b) => b.revenueINR - a.revenueINR)
    .slice(0, 5)
    .map((p) => ({
      productId: p.productId,
      title: p.title,
      slug: p.slug,
      revenueINR: p.revenueINR,
      unitsSold: p.unitsSold,
    }));

  const highestConverting = [...productStats]
    .filter((p) => p.views > 0 && p.conversionRate > 0)
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5)
    .map((p) => ({
      productId: p.productId,
      title: p.title,
      slug: p.slug,
      views: p.views,
      orders: productSalesMap[p.productId]?.ordersCount || 0,
      conversionRate: p.conversionRate,
    }));

  // 7. Customer Activity & Top Customers
  const customerSpendMap: Record<string, { name: string; email: string; country: string | null; count: number; spendINR: number; firstSeen: Date }> = {};
  for (const o of completedOrdersList) {
    const email = o.customerEmail.toLowerCase().trim();
    if (!customerSpendMap[email]) {
      customerSpendMap[email] = {
        name: o.customerName,
        email,
        country: o.customerCountry,
        count: 0,
        spendINR: 0,
        firstSeen: o.createdAt,
      };
    }
    customerSpendMap[email].count++;
    const amt = Number(o.total) || 0;
    customerSpendMap[email].spendINR += o.currency === "INR" ? amt : (exchangeRatesMap.USD > 0 ? amt / exchangeRatesMap.USD : amt * 85);
  }

  const topCustomers = Object.entries(customerSpendMap)
    .map(([email, data]) => ({
      id: email,
      name: data.name,
      email,
      country: data.country,
      orderCount: data.count,
      totalSpentINR: Math.round(data.spendINR),
      registeredAt: data.firstSeen.toISOString(),
    }))
    .sort((a, b) => b.totalSpentINR - a.totalSpentINR)
    .slice(0, 10);

  // Recent Activity Feed
  const recentActivity: CustomerAnalyticsData["customers"]["recentActivity"] = [];

  for (const o of ordersInPeriod.slice(0, 10)) {
    recentActivity.push({
      id: `ord_${o.id}`,
      type: "ORDER",
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerCountry: o.customerCountry,
      timestamp: o.createdAt.toISOString(),
      description: `Placed Order #${o.orderNumber} (${o.paymentStatus})`,
      amount: Number(o.total),
      currency: o.currency,
    });
  }

  for (const u of recentRegistrations) {
    recentActivity.push({
      id: `reg_${u.id}`,
      type: "REGISTRATION",
      customerName: u.name || "Customer",
      customerEmail: u.email,
      customerCountry: u.country,
      timestamp: u.createdAt.toISOString(),
      description: "Registered new customer account",
    });
  }

  for (const d of recentDownloads) {
    if (d.order) {
      recentActivity.push({
        id: `dl_${d.id}`,
        type: "DOWNLOAD",
        customerName: d.order.customerName,
        customerEmail: d.order.customerEmail,
        customerCountry: d.order.customerCountry,
        timestamp: d.createdAt.toISOString(),
        description: `Downloaded model "${d.product.title}"`,
      });
    }
  }

  recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    timeframe: filter,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      label,
    },
    overview: {
      totalVisitors: totalUniqueVisitors,
      uniqueVisitors: totalUniqueVisitors,
      totalPageViews,
      registeredCustomers: newCustomersCount,
      totalRegisteredAllTime,
      totalOrders: ordersInPeriod.length,
      completedOrders: completedOrdersList.length,
      totalRevenueINR,
      totalRevenueUSD,
      conversionRate,
    },
    traffic: {
      trends,
      mostVisitedPages,
      newVsReturning: {
        newVisitors: newVisitorsCount,
        returningVisitors: returningVisitorsCount,
        newPercentage,
        returningPercentage,
      },
      trafficSources,
    },
    products: {
      mostViewed,
      bestSellers,
      highestRevenue,
      highestConverting,
      productStats,
    },
    customers: {
      totalRegistered: totalRegisteredAllTime,
      newRegistrations: newCustomersCount,
      returningCustomers: returningCustomersCount,
      recentActivity: recentActivity.slice(0, 15),
      topCustomers,
    },
    sales: {
      totalSales: completedOrdersList.length,
      completedOrders: completedOrdersList.length,
      pendingOrders: pendingOrdersList.length,
      failedOrders: failedOrdersList.length,
      refundedOrders: 0,
      totalRevenueINR,
      totalRevenueUSD,
      averageOrderValueINR,
      averageOrderValueUSD,
      revenueTrends,
    },
    lastUpdated: new Date().toISOString(),
  };
}
