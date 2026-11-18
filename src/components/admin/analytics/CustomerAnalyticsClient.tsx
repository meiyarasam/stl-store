"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CustomerAnalyticsData,
  AnalyticsTimeframe,
} from "@/services/customer-analytics.service";
import {
  Users,
  Eye,
  ShoppingBag,
  TrendingUp,
  Percent,
  Calendar,
  RotateCcw,
  ArrowRight,
  Globe,
  Compass,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Activity,
  DollarSign,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CustomerAnalyticsClientProps {
  initialData: CustomerAnalyticsData;
}

const PIE_COLORS = ["#09090b", "#2563eb", "#4f46e5", "#059669", "#d97706", "#7c3aed", "#64748b"];

export function CustomerAnalyticsClient({ initialData }: CustomerAnalyticsClientProps) {
  const [data, setData] = useState<CustomerAnalyticsData>(initialData);
  const [activeTimeframe, setActiveTimeframe] = useState<AnalyticsTimeframe>(initialData.timeframe);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "traffic" | "products" | "customers" | "sales">("all");
  const [productSearch, setProductSearch] = useState("");

  const fetchAnalytics = async (filter: AnalyticsTimeframe, start?: string, end?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("filter", filter);
      if (start) params.set("start", start);
      if (end) params.set("end", end);

      const res = await fetch(`/api/admin/customer-analytics?${params.toString()}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
        setActiveTimeframe(filter);
      }
    } catch (err) {
      console.error("Failed to load customer analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClick = (filter: AnalyticsTimeframe) => {
    if (filter === "custom") {
      setShowCustomPicker((prev) => !prev);
      return;
    }
    setShowCustomPicker(false);
    fetchAnalytics(filter);
  };

  const handleCustomApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart) return;
    fetchAnalytics("custom", customStart, customEnd || undefined);
    setShowCustomPicker(false);
  };

  const formattedLastUpdated = new Date(data.lastUpdated).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const filteredProductStats = data.products.productStats.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-950 text-white">
              <Activity className="w-5 h-5 text-blue-400" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
              Customer & Traffic Analytics
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Authoritative visitor traffic, product performance, orders, and revenue insights.</span>
            <span className="text-[11px] font-mono text-zinc-400">· Synced at {formattedLastUpdated}</span>
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="inline-flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-semibold">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "year", label: "This Year" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((f) => {
              const isSelected = activeTimeframe === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFilterClick(f.id)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                    isSelected
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(activeTimeframe, customStart, customEnd)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-800 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-zinc-600 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Dropdown */}
      {showCustomPicker && (
        <form
          onSubmit={handleCustomApply}
          className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-md max-w-md ml-auto flex flex-col sm:flex-row items-end gap-3 text-xs"
        >
          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">From Date</label>
            <input
              type="date"
              required
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-[11px] font-semibold text-zinc-600 mb-1">To Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-zinc-950 text-white rounded-lg font-bold hover:bg-zinc-800 transition-colors shrink-0"
          >
            Apply Range
          </button>
        </form>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "Full Dashboard" },
          { id: "traffic", label: "Traffic Analytics" },
          { id: "products", label: "Product Performance" },
          { id: "customers", label: "Customer Behaviour" },
          { id: "sales", label: "Sales & Orders" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
          {data.dateRange.label}
        </span>
      </div>

      {/* 2. OVERVIEW CARDS (7 Primary KPIs) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Executive Overview ({data.dateRange.label})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* Card 1: Total Visitors */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Total Visitors</span>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              {data.overview.totalVisitors.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Unique visitor sessions</span>
          </div>

          {/* Card 2: Unique Visitors */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Unique Visitors</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              {data.overview.uniqueVisitors.toLocaleString()}
            </div>
            <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
              {data.traffic.newVsReturning.newPercentage}% new
            </span>
          </div>

          {/* Card 3: Total Page Views */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Page Views</span>
              <Eye className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              {data.overview.totalPageViews.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Excludes /admin</span>
          </div>

          {/* Card 4: Registered Customers */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">New Customers</span>
              <UserPlus className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              +{data.overview.registeredCustomers}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">
              {data.overview.totalRegisteredAllTime} total all-time
            </span>
          </div>

          {/* Card 5: Total Orders */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Orders</span>
              <ShoppingBag className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              {data.overview.totalOrders}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
              {data.overview.completedOrders} paid
            </span>
          </div>

          {/* Card 6: Total Revenue */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              ₹{data.overview.totalRevenueINR.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
              ${data.overview.totalRevenueUSD} USD
            </span>
          </div>

          {/* Card 7: Conversion Rate */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:border-zinc-300 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[11px] font-semibold">Conversion</span>
              <Percent className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-950 font-display">
              {data.overview.conversionRate}%
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Orders / Visitors</span>
          </div>
        </div>
      </section>

      {/* 3. TRAFFIC ANALYTICS SECTION */}
      {(activeTab === "all" || activeTab === "traffic") && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-950 tracking-tight font-display flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" /> Traffic Trends & Behaviour
              </h2>
              <p className="text-xs text-zinc-500">
                Visitor velocity and page-level engagement on customer-facing routes.
              </p>
            </div>
          </div>

          {/* Traffic Trend Chart */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Visitors & Page Views Over Time</h3>
                <p className="text-xs text-zinc-500">Daily breakdown for {data.dateRange.label}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Page Views
                </span>
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" /> Unique Visitors
                </span>
              </div>
            </div>

            {data.traffic.trends.length > 0 && data.traffic.trends.some((t) => t.pageViews > 0 || t.uniqueVisitors > 0) ? (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.traffic.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#09090b" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#09090b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#09090b",
                        color: "#ffffff",
                        borderRadius: "10px",
                        fontSize: "12px",
                        border: "none",
                      }}
                    />
                    <Area type="monotone" dataKey="pageViews" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorPv)" name="Page Views" />
                    <Area type="monotone" dataKey="uniqueVisitors" stroke="#09090b" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" name="Unique Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6">
                <Globe className="w-8 h-8 text-zinc-300 mb-2" />
                <h4 className="text-xs font-bold text-zinc-800">No Traffic Recorded Yet</h4>
                <p className="text-[11px] text-zinc-400 max-w-sm mt-0.5">
                  Traffic analytics update automatically as customers visit your store.
                </p>
              </div>
            )}
          </div>

          {/* 2-Column: Most Visited Pages & Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Visited Pages */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-950 mb-1">Most Visited Pages</h3>
              <p className="text-xs text-zinc-500 mb-4">Top URLs by page views and audience reach</p>

              {data.traffic.mostVisitedPages.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {data.traffic.mostVisitedPages.map((page, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="truncate max-w-[240px] sm:max-w-[300px]">
                        <span className="font-mono text-zinc-900 block truncate" title={page.path}>
                          {page.path}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {page.uniqueVisitors} unique visitors
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-zinc-950">{page.pageViews} views</span>
                        <span className="text-[11px] text-zinc-400 block">{page.percentage}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center">No page views recorded in this period.</p>
              )}
            </div>

            {/* Traffic Sources & New vs Returning */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1">Audience & Referral Sources</h3>
                <p className="text-xs text-zinc-500 mb-4">Traffic acquisition channels and customer retention</p>

                {/* New vs Returning pill bar */}
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-blue-700">New Visitors ({data.traffic.newVsReturning.newPercentage}%)</span>
                    <span className="text-zinc-900">Returning ({data.traffic.newVsReturning.returningPercentage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${data.traffic.newVsReturning.newPercentage}%` }}
                    />
                    <div
                      className="bg-zinc-900 h-full"
                      style={{ width: `${data.traffic.newVsReturning.returningPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Sources List */}
                <div className="divide-y divide-zinc-100 text-xs">
                  {data.traffic.trafficSources.length > 0 ? (
                    data.traffic.trafficSources.map((src, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <span className="font-medium text-zinc-800">{src.source}</span>
                        <div className="text-right">
                          <span className="font-bold text-zinc-950">{src.visitors} visitors</span>
                          <span className="text-[11px] text-zinc-400 ml-1.5">({src.percentage}%)</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 py-4 text-center">Direct / Bookmark (100%)</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. PRODUCT ANALYTICS SECTION */}
      {(activeTab === "all" || activeTab === "products") && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-950 tracking-tight font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Product Performance & Sales
              </h2>
              <p className="text-xs text-zinc-500">
                View-to-purchase conversion, revenue leaders, and product popularity.
              </p>
            </div>
          </div>

          {/* 3-Column Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Most Viewed */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Most Viewed 3D Models
              </h3>
              {data.products.mostViewed.length > 0 ? (
                <div className="space-y-3">
                  {data.products.mostViewed.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <Link href={`/products/${p.slug}`} className="font-semibold text-zinc-900 hover:text-blue-600 truncate block">
                          {p.title}
                        </Link>
                        <span className="text-[11px] text-zinc-400">{p.categoryName}</span>
                      </div>
                      <span className="font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded font-mono shrink-0">
                        {p.views} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-4 text-center">No product views recorded yet.</p>
              )}
            </div>

            {/* Best Sellers */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Best-Selling Models (Units Sold)
              </h3>
              {data.products.bestSellers.length > 0 ? (
                <div className="space-y-3">
                  {data.products.bestSellers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <Link href={`/products/${p.slug}`} className="font-semibold text-zinc-900 hover:text-blue-600 truncate block">
                          {p.title}
                        </Link>
                        <span className="text-[11px] text-emerald-600 font-medium">₹{p.revenueINR} revenue</span>
                      </div>
                      <span className="font-bold text-zinc-950 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono shrink-0">
                        {p.unitsSold} units
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-4 text-center">No completed sales in this period.</p>
              )}
            </div>

            {/* Top Revenue */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Highest Revenue Generators
              </h3>
              {data.products.highestRevenue.length > 0 ? (
                <div className="space-y-3">
                  {data.products.highestRevenue.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <Link href={`/products/${p.slug}`} className="font-semibold text-zinc-900 hover:text-blue-600 truncate block">
                          {p.title}
                        </Link>
                        <span className="text-[11px] text-zinc-400">{p.unitsSold} units sold</span>
                      </div>
                      <span className="font-bold text-zinc-950 font-mono shrink-0">
                        ₹{p.revenueINR.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-4 text-center">No revenue recorded in this period.</p>
              )}
            </div>
          </div>

          {/* Product Sales Statistics Table */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Catalog Sales & Conversion Statistics</h3>
                <p className="text-xs text-zinc-500">Comprehensive breakdown of all 3D models</p>
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs w-full sm:w-64 focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 font-bold">Product</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold text-right">Views</th>
                    <th className="py-2.5 font-bold text-right">Units Sold</th>
                    <th className="py-2.5 font-bold text-right">Gross Revenue</th>
                    <th className="py-2.5 font-bold text-right">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProductStats.map((p) => (
                    <tr key={p.productId} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-3 font-semibold text-zinc-900">
                        <Link href={`/products/${p.slug}`} className="hover:text-blue-600">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 text-zinc-500">{p.category}</td>
                      <td className="py-3 text-right font-mono text-zinc-700">{p.views}</td>
                      <td className="py-3 text-right font-mono font-bold text-zinc-950">{p.unitsSold}</td>
                      <td className="py-3 text-right font-mono font-bold text-zinc-950">₹{p.revenueINR.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.conversionRate > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-zinc-400"
                          }`}
                        >
                          {p.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredProductStats.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                        No matching 3D models found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 5. CUSTOMER ANALYTICS SECTION */}
      {(activeTab === "all" || activeTab === "customers") && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-950 tracking-tight font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Customer Behaviour & Purchasing Activity
              </h2>
              <p className="text-xs text-zinc-500">
                Retention, repeat buyers, customer spend, and real-time activity stream.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Buyers */}
            <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-950 mb-1">Top Customers by Lifetime Spend</h3>
              <p className="text-xs text-zinc-500 mb-4">Highest spending registered collectors and makers</p>

              {data.customers.topCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 text-[11px] uppercase tracking-wider">
                        <th className="py-2 font-bold">Customer</th>
                        <th className="py-2 font-bold">Country</th>
                        <th className="py-2 font-bold text-center">Paid Orders</th>
                        <th className="py-2 font-bold text-right">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.customers.topCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-50/70">
                          <td className="py-3">
                            <span className="font-semibold text-zinc-900 block">{c.name || "Customer"}</span>
                            <span className="text-[11px] text-zinc-400 font-mono">{c.email}</span>
                          </td>
                          <td className="py-3 text-zinc-600 font-medium">{c.country || "International"}</td>
                          <td className="py-3 text-center font-mono font-bold text-zinc-800">
                            {c.orderCount} {c.orderCount > 1 ? "🔥" : ""}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-zinc-950">
                            ₹{c.totalSpentINR.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center">No customer purchase records in this period.</p>
              )}
            </div>

            {/* Live Customer Activity Feed */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1">Recent Customer Activity</h3>
                <p className="text-xs text-zinc-500 mb-4">Real-time audit log of customer actions</p>

                <div className="space-y-3 divide-y divide-zinc-100">
                  {data.customers.recentActivity.map((act) => (
                    <div key={act.id} className="pt-2.5 first:pt-0 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-0.5">
                        <span className="font-semibold text-zinc-800">{act.customerName}</span>
                        <span>{new Date(act.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="text-zinc-600 leading-snug">{act.description}</p>
                    </div>
                  ))}
                  {data.customers.recentActivity.length === 0 && (
                    <p className="text-xs text-zinc-400 py-6 text-center">No recent activity recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. SALES & ORDERS ANALYTICS SECTION */}
      {(activeTab === "all" || activeTab === "sales") && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-950 tracking-tight font-display flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Sales & Order Health
              </h2>
              <p className="text-xs text-zinc-500">
                Payment status distribution, revenue velocity, and average order metrics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Velocity Chart */}
            <div className="lg:col-span-2 bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Daily Revenue Velocity</h3>
                  <p className="text-xs text-zinc-500">Gross INR sales from completed orders</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-zinc-500">Average Order Value:</span>
                  <span className="text-sm font-black text-zinc-950 font-mono ml-1.5">
                    ₹{data.sales.averageOrderValueINR} (${data.sales.averageOrderValueUSD})
                  </span>
                </div>
              </div>

              {data.sales.revenueTrends.length > 0 && data.sales.revenueTrends.some((r) => r.revenueINR > 0) ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.sales.revenueTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                      <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          color: "#ffffff",
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "none",
                        }}
                        formatter={(val: any) => [`₹${val}`, "Revenue"]}
                      />
                      <Bar dataKey="revenueINR" fill="#09090b" radius={[6, 6, 0, 0]} name="revenueINR" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6">
                  <TrendingUp className="w-8 h-8 text-zinc-300 mb-2" />
                  <h4 className="text-xs font-bold text-zinc-800">No Revenue in Selected Period</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mt-0.5">
                    Orders completed via Razorpay UPI and cards will plot here immediately.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1">Payment Status Distribution</h3>
                <p className="text-xs text-zinc-500 mb-6">Payment settlement rate in this period</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-950">Completed & Paid</span>
                    </div>
                    <span className="text-base font-black text-emerald-950 font-mono">
                      {data.sales.completedOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-950">Pending Checkout</span>
                    </div>
                    <span className="text-base font-black text-amber-950 font-mono">
                      {data.sales.pendingOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-semibold text-red-950">Failed Transactions</span>
                    </div>
                    <span className="text-base font-black text-red-950 font-mono">
                      {data.sales.failedOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-medium text-zinc-600">Refunds & Reversals</span>
                    <span className="text-xs font-bold text-zinc-900 font-mono">
                      {data.sales.refundedOrders}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 mt-6 text-center">
                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
