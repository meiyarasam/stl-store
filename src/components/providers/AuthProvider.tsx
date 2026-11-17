"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { SessionTimeoutMonitor } from "@/components/auth/SessionTimeoutMonitor";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SessionTimeoutMonitor />
    </SessionProvider>
  );
}
