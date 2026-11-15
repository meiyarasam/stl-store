"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useStore } from "@/context/StoreContext";
import { COUNTRIES_LIST } from "@/lib/currency/currencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, AlertCircle, CheckCircle2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";
  const { country, setCountry } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(country || "US");

  const initialDialCode =
    COUNTRIES_LIST.find((c) => c.code === (country || "US"))?.dialCode || "+1";
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialDialCode);
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCountrySelect = (cCode: string) => {
    setSelectedCountry(cCode);
    setCountry(cCode);
    const cObj = COUNTRIES_LIST.find((c) => c.code === cCode);
    if (cObj) {
      setPhoneCountryCode(cObj.dialCode);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
          country: selectedCountry,
          phoneCountryCode,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // 2. Automatically log in user with created credentials
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signInRes?.error) {
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Register submit error:", err);
      setErrorMessage(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight font-display">
          Create Your Account
        </h1>
        <p className="text-xs text-zinc-500">
          Join STLForge to purchase, download, and manage your 3D digital STL files.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Full Name *
          </label>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Email Address *
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Password (min 8 chars) *
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Confirm Password *
            </label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Country / Region *
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountrySelect(e.target.value)}
            className="flex h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
          >
            {COUNTRIES_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.defaultCurrency})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Code *
            </label>
            <Input
              type="text"
              required
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
              placeholder="+1"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Mobile Number *
            </label>
            <Input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555-0192"
            />
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-start gap-2 pt-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            By registering, you agree to our Terms of Service and Personal STL Licence Agreement.
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-xs font-bold"
        >
          Create Account & Continue
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="font-bold text-zinc-950 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
