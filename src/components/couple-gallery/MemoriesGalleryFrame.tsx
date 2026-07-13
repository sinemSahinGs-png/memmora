"use client";

import { useState } from "react";
import { ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface MemoriesGalleryFrameProps {
  children: React.ReactNode;
  className?: string;
  frameSrc?: string;
}

export function MemoriesGalleryFrame({
  children,
  className,
  frameSrc = ASSETS.galleryFrame,
}: MemoriesGalleryFrameProps) {
  const [frameError, setFrameError] = useState(false);

  return (
    <div className={cn("memories-gallery-frame-wrap", className)}>
      {!frameError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frameSrc}
          alt=""
          className="memories-gallery-frame-img"
          width={1086}
          height={1448}
          draggable={false}
          onError={() => setFrameError(true)}
        />
      ) : (
        <div className="memories-gallery-frame-fallback" aria-hidden />
      )}
      <div className="memories-gallery-frame-photo">{children}</div>
    </div>
  );
}
