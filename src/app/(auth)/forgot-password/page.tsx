"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mx-auto">
          <div className="w-10 h-10 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </Link>

        {submitted ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-zinc-950">Reset Instructions Sent</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              If an account exists for <strong className="text-zinc-900">{email}</strong>, you will receive an email with instructions to securely reset your password.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-950 hover:underline flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                Reset Your Password
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Enter your account email address and we will send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-xs font-bold"
              >
                Send Password Reset Link
              </Button>
            </form>

            <div className="pt-2">
              <Link
                href="/login"
                className="text-xs text-zinc-500 hover:text-zinc-950"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

