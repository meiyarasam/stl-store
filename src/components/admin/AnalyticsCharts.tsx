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

interface AnalyticsChartsProps {
  dailySales: { date: string; revenueUSD: number; orders: number }[];
  countrySales: { country: string; percentage: number; orders: number }[];
  currencyBreakdown: { currency: string; amount: number; symbol: string }[];
}

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

export function AnalyticsCharts({
  dailySales,
  countrySales,
  currencyBreakdown,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Daily Revenue & Orders Chart */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-950">
              Weekly Revenue Velocity
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Daily revenue volume in reference USD
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 rounded text-zinc-700">
            Last 7 Days
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "12px",
                  border: "none",
                }}
                formatter={(value: any) => [`$${value}`, "Revenue"]}
              />
              <Bar dataKey="revenueUSD" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Country-wise Sales */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-950">
            Geographic Buyer Distribution
          </h3>
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
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-100">
            {countrySales.map((c, i) => (
              <div key={c.country} className="flex justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-zinc-700">{c.country}</span>
                </span>
                <span className="font-semibold text-zinc-950 font-mono">
                  {c.percentage}% ({c.orders} orders)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Currency-wise Revenue Breakdown */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-950">
            Multi-Currency Settlement
          </h3>
          <p className="text-xs text-zinc-500">
            Independent currency volume processed via Razorpay
          </p>

          <div className="space-y-4 pt-4">
            {currencyBreakdown.map((cur) => (
              <div key={cur.currency} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700">{cur.currency} Volume</span>
                  <span className="text-zinc-950 font-mono">
                    {cur.symbol}
                    {cur.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-zinc-900 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(15, (cur.amount / 300000) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

