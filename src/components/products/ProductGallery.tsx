"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductImageItem } from "@/types";

interface ProductGalleryProps {
  images: ProductImageItem[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const displayImages =
    images && images.length > 0
      ? images
      : [
          {
            id: "default_img",
            url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80",
            altText: title,
            isPrimary: true,
            sortOrder: 0,
          },
        ];

  const currentImage = displayImages[selectedIdx] || displayImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 bg-zinc-950/70 backdrop-blur-md text-white text-xs font-mono rounded">
            Digital 3D Preview
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                selectedIdx === idx
                  ? "border-zinc-950 ring-2 ring-zinc-950/20"
                  : "border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} preview ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
