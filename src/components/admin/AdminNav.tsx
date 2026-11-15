"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  FolderTree,
  ShoppingBag,
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
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="bg-zinc-950 text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              STLForge Admin Portal
            </span>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

