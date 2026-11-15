import * as React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-charcoal-900 text-white",
    secondary: "bg-zinc-100 text-zinc-800 border border-zinc-200",
    outline: "text-zinc-800 border border-zinc-300",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

