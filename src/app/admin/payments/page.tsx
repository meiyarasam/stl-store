import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import prisma, { isDatabaseReachable } from "@/lib/database/prisma";
import { formatPrice } from "@/lib/currency/currencies";
import { CurrencyCode } from "@/types";
import { ShieldCheck, Search, CreditCard, ArrowUpRight } from "lucide-react";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/payments");
  }

  let payments: any[] = [];
  const dbOnline = await isDatabaseReachable();

  if (dbOnline) {
    try {
      const where: any = {};
      if (searchParams.status) where.status = searchParams.status;
      if (searchParams.search) {
        where.OR = [
          { razorpayPaymentId: { contains: searchParams.search, mode: "insensitive" } },
          { razorpayOrderId: { contains: searchParams.search, mode: "insensitive" } },
        ];
      }

      payments = await prisma.payment.findMany({
        where,
        include: { order: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma payments fetch error:", e);
    }
  }


  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Payment & Gateway Transactions
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit Razorpay domestic UPI, dynamic QR, and international card payments.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form method="GET" className="relative w-full sm:w-80">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search || ""}
              placeholder="Search by Payment ID or Order ID..."
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Gateway:</span>
            <span className="px-3 py-1.5 rounded font-semibold bg-zinc-950 text-white flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Razorpay Standard
            </span>
          </div>
        </div>

        {/* Payments Table */}
        {payments.length > 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Razorpay Payment ID</th>
                    <th className="py-3 px-4">Razorpay Order ID</th>
                    <th className="py-3 px-4">Customer Order</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                        {p.razorpayPaymentId}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-600">
                        {p.razorpayOrderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders?search=${p.order?.orderNumber || ""}`}
                          className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          #{p.order?.orderNumber || "N/A"}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                        {formatPrice(Number(p.amount), p.currency as CurrencyCode)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-700">
                        {p.paymentMethod || "Razorpay Checkout"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 font-medium" suppressHydrationWarning>
                        {new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
            <CreditCard className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-zinc-900">No Payment Records in Database Yet</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
              Razorpay gateway transactions and webhook confirmations will appear here once customer payments are captured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
