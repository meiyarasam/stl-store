"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BrandLogo size="md" showTagline={false} />
        </div>
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-display">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-zinc-500">
          Access your 3D digital file library and purchase history at The Print Factory.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
            />
            <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-zinc-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9 pr-10"
            />
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-700 focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-zinc-600" />
              ) : (
                <Eye className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-xs font-bold"
        >
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/register?redirect=${encodeURIComponent(callbackUrl)}`}
          className="font-bold text-zinc-950 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
export default LoginForm;
