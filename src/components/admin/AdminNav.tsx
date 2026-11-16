"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  FolderTree,
  ShoppingBag,
  CreditCard,
  Users,
  Settings,
  ArrowLeft,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Box },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors shrink-0"
              title="Return to marketplace"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Store</span>
            </Link>
            <div className="h-4 w-px bg-zinc-800 shrink-0" />
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded overflow-hidden bg-white p-0.5 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="The Print Factory"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1 sm:gap-1.5 shrink-0">
                <span className="hidden md:inline">The Print Factory</span>
                <span className="md:hidden">TPF</span>
                <span className="text-[9px] sm:text-[10px] uppercase px-1 sm:px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono">
                  Admin
                </span>
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shrink-0 ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                  title={link.label}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

