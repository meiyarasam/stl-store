"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Mail, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@stlforge.com");
  const [password, setPassword] = useState("Admin@STLForge2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Authentication failed. Please verify admin credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-zinc-950 text-white border border-zinc-800 p-8 rounded-2xl shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight font-display text-white">
          STLForge Admin Portal
        </h1>
        <p className="text-xs text-zinc-400">
          Restricted access for marketplace administrators and store managers.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Admin Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@stlforge.com"
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 pl-9 focus:border-amber-400 focus:ring-amber-400"
            />
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 pl-9 pr-10 focus:border-amber-400 focus:ring-amber-400"
            />
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-zinc-300" />
              ) : (
                <Eye className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
              )}
            </button>
          </div>
        </div>

        <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
          <span className="font-semibold text-zinc-300 block">Default Admin Credentials:</span>
          <div className="font-mono text-zinc-300">Email: admin@stlforge.com</div>
          <div className="font-mono text-zinc-300">Password: Admin@STLForge2026!</div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300"
        >
          Sign In to Admin Dashboard
        </Button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
        </Link>
      </div>
    </div>
  );
}
export default AdminLoginForm;
