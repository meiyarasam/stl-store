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
  layout?: "single-line" | "two-line";
}

export function BrandLogo({
  size = "md",
  showTagline = true,
  showText = true,
  href = "/",
  theme = "light",
  className = "",
  layout = "single-line",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 28, text: "text-sm", sub: "text-[7px]" },
    md: { img: 36, text: "text-sm sm:text-lg md:text-xl", sub: "text-[7px] sm:text-[9px]" },
    lg: { img: 64, text: "text-2xl", sub: "text-xs" },
    xl: { img: 96, text: "text-3xl", sub: "text-xs" },
  };

  const { img, text, sub } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-2 sm:gap-2.5 shrink-0 ${className}`}>
      <div className="relative shrink-0 overflow-hidden rounded-md bg-white border border-zinc-200/80 shadow-xs p-0.5">
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
        <div className="flex flex-col justify-center leading-tight min-w-0 shrink-0 select-none">
          {layout === "two-line" ? (
            <div className="w-fit flex flex-col justify-center">
              {/* Line 1: THE PRINT */}
              <div
                className={`flex items-baseline whitespace-nowrap leading-none ${
                  theme === "dark" ? "text-white" : "text-[#000000]"
                }`}
              >
                <span className="font-light tracking-wide uppercase text-xs sm:text-sm md:text-[15px]">
                  THE
                </span>
                <span className="font-black tracking-normal uppercase text-xs sm:text-sm md:text-[15px] ml-1 sm:ml-1.5">
                  PRINT
                </span>
              </div>

              {/* Line 2: FACTORY */}
              <div
                aria-label="FACTORY"
                className={`w-full flex justify-between font-light uppercase text-[9px] sm:text-[10px] md:text-[11px] leading-none whitespace-nowrap mt-1 ${
                  theme === "dark" ? "text-white" : "text-[#000000]"
                }`}
              >
                <span aria-hidden="true">F</span>
                <span aria-hidden="true">A</span>
                <span aria-hidden="true">C</span>
                <span aria-hidden="true">T</span>
                <span aria-hidden="true">O</span>
                <span aria-hidden="true">R</span>
                <span aria-hidden="true">Y</span>
              </div>
              <span className="sr-only">FACTORY</span>
            </div>
          ) : (
            <span
              className={`font-black tracking-tight font-display whitespace-nowrap ${text} ${
                theme === "dark" ? "text-white" : "text-zinc-950"
              }`}
            >
              THE PRINT{" "}
              <span className="text-blue-600 font-black">FACTORY</span>
            </span>
          )}

          {showTagline && (
            <span
              className={`hidden sm:block font-semibold tracking-widest uppercase mt-1 ${sub} truncate ${
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
