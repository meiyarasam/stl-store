import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import prisma from "@/lib/database/prisma";
import { formatPrice } from "@/lib/currency/currencies";
import { CurrencyCode } from "@/types";
import { ShieldCheck, Search, Filter } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const session = await getServerSession(authOptions);

  if ((session?.user as any)?.role !== "ADMIN" && process.env.NODE_ENV === "production") {
    redirect("/login?callbackUrl=/admin/orders");
  }

  let orders: any[] = [];
  try {
    const where: any = {};
    if (searchParams.status) where.paymentStatus = searchParams.status;
    if (searchParams.search) {
      where.OR = [
        { orderNumber: { contains: searchParams.search, mode: "insensitive" } },
        { customerEmail: { contains: searchParams.search, mode: "insensitive" } },
      ];
    }

    orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Fallback demo orders for dev mode
    orders = [
      {
        id: "ord_101",
        orderNumber: "STL-892144-129",
        customerName: "Alex Vance",
        customerEmail: "alex@blackmesa.org",
        customerCountry: "US",
        currency: "USD",
        total: 14.99,
        paymentStatus: "PAID",
        paymentMethod: "Razorpay Standard",
        createdAt: new Date().toISOString(),
        items: [{ id: "i1", productTitle: "Cyberpunk Ronin Collectible Bust", quantity: 1, total: 14.99 }],
      },
      {
        id: "ord_102",
        orderNumber: "STL-742911-884",
        customerName: "Rahul Sharma",
        customerEmail: "rahul@techlab.in",
        customerCountry: "IN",
        currency: "INR",
        total: 599.0,
        paymentStatus: "PAID",
        paymentMethod: "UPI Dynamic QR",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        items: [{ id: "i2", productTitle: "Print-in-Place Mechanical Iris Box", quantity: 1, total: 599.0 }],
      },
      {
        id: "ord_103",
        orderNumber: "STL-661209-340",
        customerName: "Klaus Schmidt",
        customerEmail: "klaus@hamburg.de",
        customerCountry: "DE",
        currency: "EUR",
        total: 10.99,
        paymentStatus: "PAID",
        paymentMethod: "Razorpay International Card",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        items: [{ id: "i3", productTitle: "Articulated Crystal Dragon (Print-in-Place)", quantity: 1, total: 10.99 }],
      },
    ];
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
            Order & Transaction Management
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit customer orders, Razorpay payment tokens, and digital file fulfillment.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form method="GET" className="relative w-full sm:w-80">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search || ""}
              placeholder="Search by order # or email..."
              className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Status:</span>
            <Link
              href="/admin/orders"
              className={`px-3 py-1.5 rounded font-semibold ${
                !searchParams.status ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              All
            </Link>
            <Link
              href="/admin/orders?status=PAID"
              className={`px-3 py-1.5 rounded font-semibold ${
                searchParams.status === "PAID" ? "bg-emerald-700 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Paid
            </Link>
            <Link
              href="/admin/orders?status=PENDING"
              className={`px-3 py-1.5 rounded font-semibold ${
                searchParams.status === "PENDING" ? "bg-amber-700 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Pending
            </Link>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-900 block truncate max-w-xs">
                        {o.customerName}
                      </span>
                      <span className="text-zinc-500 text-[11px] block truncate max-w-xs">
                        {o.customerEmail} ({o.customerCountry})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700">
                      {o.items?.map((it: any) => it.productTitle).join(", ") || "3D STL Bundle"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                      {formatPrice(Number(o.total), o.currency as CurrencyCode)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          o.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-medium">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/payment/success?orderId=${o.id}`}
                        className="text-zinc-700 hover:text-zinc-950 font-semibold hover:underline"
                      >
                        Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

