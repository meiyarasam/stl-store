import React, { Suspense } from "react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-[85vh] bg-charcoal-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading admin login...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
