import React, { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
