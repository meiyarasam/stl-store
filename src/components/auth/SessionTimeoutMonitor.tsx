"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Clock, RotateCcw, LogOut } from "lucide-react";

const STORAGE_LAST_ACTIVE = "stlforge_last_active_time";
const STORAGE_LOGGED_OUT = "stlforge_session_logged_out";

export function SessionTimeoutMonitor() {
  const { status, update } = useSession();
  const pathname = usePathname();

  const timeoutMinutes = Number(
    process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || 30
  );
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningSeconds = Number(
    process.env.NEXT_PUBLIC_SESSION_WARNING_SECONDS || 120
  );
  const warningMs = warningSeconds * 1000;

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningSeconds);
  const isLoggingOutRef = useRef(false);
  const lastActivityReportedRef = useRef(Date.now());

  const getRedirectUrl = useCallback(() => {
    if (pathname && pathname.startsWith("/admin")) {
      return "/admin/login?reason=expired";
    }
    return "/login?reason=expired";
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      localStorage.removeItem(STORAGE_LAST_ACTIVE);
      localStorage.setItem(STORAGE_LOGGED_OUT, Date.now().toString());
    } catch {
      // Ignore private browsing storage issues
    }

    await signOut({
      callbackUrl: getRedirectUrl(),
      redirect: true,
    });
  }, [getRedirectUrl]);

  const handleStayLoggedIn = useCallback(async () => {
    setShowWarning(false);
    const now = Date.now();
    lastActivityReportedRef.current = now;
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE, now.toString());
    } catch {}

    // Trigger NextAuth session refresh on server to extend JWT lastActive
    try {
      await update();
    } catch (err) {
      console.warn("Session update ping notice:", err);
    }
  }, [update]);

  // Record user activity
  const recordActivity = useCallback(() => {
    if (showWarning) {
      // User must explicitly click "Stay Logged In" when warning is open
      return;
    }

    const now = Date.now();
    // Throttle writing to localStorage to once every 3 seconds
    if (now - lastActivityReportedRef.current >= 3000) {
      lastActivityReportedRef.current = now;
      try {
        localStorage.setItem(STORAGE_LAST_ACTIVE, now.toString());
      } catch {}
    }
  }, [showWarning]);

  // Attach activity listeners when authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      setShowWarning(false);
      return;
    }

    const now = Date.now();
    lastActivityReportedRef.current = now;
    try {
      const existing = localStorage.getItem(STORAGE_LAST_ACTIVE);
      if (!existing) {
        localStorage.setItem(STORAGE_LAST_ACTIVE, now.toString());
      }
    } catch {}

    const events = ["mousedown", "keydown", "touchstart", "scroll", "click"];
    const onUserAction = () => recordActivity();

    // Throttled mousemove
    let lastMouseMove = 0;
    const onMouseMove = () => {
      const cur = Date.now();
      if (cur - lastMouseMove > 5000) {
        lastMouseMove = cur;
        recordActivity();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, onUserAction, { passive: true }));
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Multi-tab storage synchronization
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_LOGGED_OUT && e.newValue) {
        // Another tab logged out
        handleLogout();
      } else if (e.key === STORAGE_LAST_ACTIVE && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (remoteTime > lastActivityReportedRef.current) {
          lastActivityReportedRef.current = remoteTime;
          // If warning was showing, activity in another tab dismisses it
          setShowWarning(false);
        }
      }
    };
    window.addEventListener("storage", onStorageChange);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onUserAction));
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [status, recordActivity, handleLogout]);

  // Route change also marks active navigation
  useEffect(() => {
    if (status === "authenticated") {
      recordActivity();
    }
  }, [pathname, status, recordActivity]);

  // Inactivity countdown timer tick
  useEffect(() => {
    if (status !== "authenticated") return;

    const interval = setInterval(() => {
      const now = Date.now();
      let lastActive = lastActivityReportedRef.current;

      try {
        const stored = localStorage.getItem(STORAGE_LAST_ACTIVE);
        if (stored) {
          const parsed = Number(stored);
          if (!isNaN(parsed) && parsed > 0) {
            lastActive = Math.max(lastActive, parsed);
          }
        }
      } catch {}

      const elapsed = now - lastActive;
      const remainingMs = timeoutMs - elapsed;

      if (remainingMs <= 0) {
        // Inactivity limit reached
        clearInterval(interval);
        handleLogout();
      } else if (remainingMs <= warningMs) {
        // Show warning countdown
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        // Within active window
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, timeoutMs, warningMs, showWarning, handleLogout]);

  if (!showWarning || status !== "authenticated") {
    return null;
  }

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black tracking-tight text-zinc-950 font-display">
            Session Expiring Soon
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
            You have been inactive for a while. For your security, your session will automatically end in:
          </p>
        </div>

        {/* Big countdown badge */}
        <div className="py-3 px-5 bg-amber-50 rounded-xl border border-amber-200/80 inline-block">
          <span className="font-mono text-3xl font-black text-amber-700 tracking-wider">
            {timeFormatted}
          </span>
          <span className="block text-[10px] uppercase font-bold text-amber-600 tracking-wider mt-0.5">
            remaining
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Stay Logged In
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
