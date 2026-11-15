"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Lock, Mail, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-display">
          Sign In to STLForge
        </h2>
        <p className="text-xs text-zinc-500">
          Access your 3D digital file library and purchase history.
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9"
            />
            <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5" />
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

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
