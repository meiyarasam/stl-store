import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  showText?: boolean;
  href?: string;
  theme?: "light" | "dark";
  className?: string;
}

export function BrandLogo({
  size = "md",
  showTagline = true,
  showText = true,
  href = "/",
  theme = "light",
  className = "",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 32, text: "text-base", sub: "text-[8px]" },
    md: { img: 40, text: "text-lg sm:text-xl", sub: "text-[9px]" },
    lg: { img: 64, text: "text-2xl", sub: "text-xs" },
    xl: { img: 96, text: "text-3xl", sub: "text-xs" },
  };

  const { img, text, sub } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0 overflow-hidden rounded-md bg-white border border-zinc-200/80 shadow-sm p-0.5">
        <Image
          src={BRAND.logoUrl}
          alt={BRAND.name}
          width={img}
          height={img}
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-black tracking-tight font-display ${text} ${
              theme === "dark" ? "text-white" : "text-zinc-950"
            }`}
          >
            THE PRINT{" "}
            <span className="text-blue-600 font-black">FACTORY</span>
          </span>
          {showTagline && (
            <span
              className={`block font-semibold tracking-widest uppercase mt-0.5 text-[8px] sm:text-[9px] ${
                theme === "dark" ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {BRAND.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandLogo;
