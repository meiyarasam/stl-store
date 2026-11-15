"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useStore } from "@/context/StoreContext";
import { CurrencySelector } from "./CurrencySelector";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Layers,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount, setIsCartOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold tracking-tighter group-hover:bg-zinc-800 transition-colors shadow-sm">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-zinc-950 font-display">
                  STL<span className="text-zinc-500">FORGE</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-wider text-zinc-500 uppercase font-semibold">
                  Design. Download. Create.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 pl-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-zinc-950 bg-zinc-100 font-semibold"
                        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-4">
            <form
              action="/products"
              method="GET"
              className="relative w-full"
              onSubmit={(e) => {
                if (!searchQuery.trim()) e.preventDefault();
              }}
            >
              <input
                type="text"
                name="search"
                placeholder="Search STL files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-xs rounded-full pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors placeholder:text-zinc-400"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* International Currency Selector */}
            <CurrencySelector />

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-zinc-950 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-md border border-zinc-200 transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-600" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {session.user.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg bg-white shadow-xl border border-zinc-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-zinc-100">
                      <p className="text-xs font-semibold text-zinc-950 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-semibold transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Account Overview
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/downloads"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors font-medium text-emerald-700"
                    >
                      My Downloads
                    </Link>

                    <div className="border-t border-zinc-100 my-1" />
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-md transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-zinc-950 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form action="/products" method="GET" className="relative w-full">
            <input
              type="text"
              name="search"
              placeholder="Search STL files..."
              className="w-full bg-zinc-50 border border-zinc-200 text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!session?.user && (
            <div className="pt-2 border-t border-zinc-100 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-medium border border-zinc-300 rounded-md text-zinc-800"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-zinc-950 text-white rounded-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
