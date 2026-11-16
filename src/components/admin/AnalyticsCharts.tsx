"use client";

import React from "react";
import {
  ResponsiveContainer,
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
import { Globe, Layers, TrendingUp } from "lucide-react";

interface AnalyticsChartsProps {
  dailySales: { date: string; dayLabel: string; revenueUSD: number; revenueINR: number; orders: number }[];
  countrySales: { country: string; percentage: number; orders: number }[];
  currencyBreakdown: { currency: string; amount: number; symbol: string; orders: number }[];
}

const COLORS = ["#09090b", "#2563eb", "#4f46e5", "#059669", "#d97706", "#7c3aed", "#64748b"];

export function AnalyticsCharts({
  dailySales,
  countrySales,
  currencyBreakdown,
}: AnalyticsChartsProps) {
  const hasDailyRevenue = dailySales.some((d) => d.revenueINR > 0);
  const hasCountrySales = countrySales.length > 0;
  const hasCurrencyVolume = currencyBreakdown.some((c) => c.amount > 0);

  return (
    <div className="space-y-6">
      {/* 1. Daily Revenue Chart (Last 7 Days) */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Daily Revenue Velocity (Last 7 Days)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Actual paid order volume recorded in database
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 bg-zinc-100 rounded-full text-zinc-700 self-start sm:self-auto font-mono">
            Real Database Records
          </span>
        </div>

        {hasDailyRevenue ? (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    color: "#ffffff",
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name: any) => [
                    name === "revenueINR" ? `₹${value}` : `$${value}`,
                    name === "revenueINR" ? "Revenue (INR)" : "Revenue (USD)",
                  ]}
                />
                <Bar dataKey="revenueINR" fill="#09090b" radius={[6, 6, 0, 0]} name="revenueINR" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6">
            <TrendingUp className="w-8 h-8 text-zinc-300 mb-2" />
            <h4 className="text-xs font-bold text-zinc-800">No Sales Recorded in the Last 7 Days</h4>
            <p className="text-[11px] text-zinc-400 max-w-sm mt-0.5">
              Daily revenue velocity will plot here in real-time as customers complete purchases.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Geographic Buyer Distribution */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Geographic Buyer Distribution
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">
                {countrySales.length} {countrySales.length === 1 ? "Country" : "Countries"}
              </span>
            </div>

            {hasCountrySales ? (
              <>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countrySales}
                        dataKey="percentage"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {countrySales.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any) => [`${value}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-3 border-t border-zinc-100 mt-2">
                  {countrySales.map((c, i) => (
                    <div key={c.country} className="flex justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-zinc-700 font-medium">{c.country}</span>
                      </span>
                      <span className="font-bold text-zinc-950 font-mono">
                        {c.percentage}% ({c.orders} {c.orders === 1 ? "order" : "orders"})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center text-center p-6 my-auto">
                <Globe className="w-8 h-8 text-zinc-300 mb-2" />
                <h4 className="text-xs font-bold text-zinc-800">No Geographic Buyer Data Yet</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs mt-0.5">
                  Country distribution will populate automatically from actual customer checkouts.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Multi-Currency Revenue Volume Processed */}
        <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Multi-Currency Revenue Breakdown
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">
                Independent Volumes
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Real payment volume collected per currency via Razorpay
            </p>

            <div className="space-y-3">
              {currencyBreakdown.map((cur) => (
                <div key={cur.currency} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-700 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      {cur.currency} Volume
                    </span>
                    <span className="text-zinc-950 font-mono font-bold" suppressHydrationWarning>
                      {cur.symbol}{new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cur.amount)}
                      <span className="text-zinc-400 font-normal ml-1">({cur.orders} paid)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all"
                      style={{
                        width: cur.amount > 0 ? `${Math.min(100, Math.max(5, (cur.amount / 10000) * 100))}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsCharts;
