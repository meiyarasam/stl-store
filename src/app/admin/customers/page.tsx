import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { Users, Shield, UserX, CheckCircle, Search } from "lucide-react";

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/customers");
  }

  let customers: any[] = [];
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      customers = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
          _count: {
            select: {
              orders: true,
              downloads: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma customers fetch error:", e);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Customer Directory ({customers.length})
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Registered customer accounts, purchase frequency, and account standing.
          </p>
        </div>

        {customers.length > 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Total Purchases</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 font-bold text-zinc-950">
                        {c.name || "Anonymous Maker"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-mono">
                        {c.email}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-800">
                        {c.country || "Global"}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        {c._count?.orders ?? 0} orders
                      </td>
                      <td className="py-3.5 px-4">
                        {c.isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                            <UserX className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500" suppressHydrationWarning>
                        {new Date(c.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
            <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-900">No Customers in Database Yet</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Registered customers from Supabase PostgreSQL will appear here. No mock user profiles are loaded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

