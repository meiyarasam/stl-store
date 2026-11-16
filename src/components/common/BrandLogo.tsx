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
    sm: { img: 28, text: "text-sm", sub: "text-[7px]" },
    md: { img: 36, text: "text-sm sm:text-lg md:text-xl", sub: "text-[7px] sm:text-[9px]" },
    lg: { img: 64, text: "text-2xl", sub: "text-xs" },
    xl: { img: 96, text: "text-3xl", sub: "text-xs" },
  };

  const { img, text, sub } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-md bg-white border border-zinc-200/80 shadow-sm p-0.5">
        <Image
          src={BRAND.logoUrl}
          alt={BRAND.name}
          width={img}
          height={img}
          className="object-contain w-7 h-7 sm:w-9 sm:h-9"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-tight min-w-0">
          <span
            className={`font-black tracking-tight font-display whitespace-nowrap ${text} ${
              theme === "dark" ? "text-white" : "text-zinc-950"
            }`}
          >
            THE PRINT{" "}
            <span className="text-blue-600 font-black">FACTORY</span>
          </span>
          {showTagline && (
            <span
              className={`block font-semibold tracking-widest uppercase mt-0.5 ${sub} truncate ${
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
