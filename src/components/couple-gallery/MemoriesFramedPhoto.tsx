"use client";

import { MemoriesGalleryFrame } from "./MemoriesGalleryFrame";
import {
  DEFAULT_MEMORIES_FRAME_CROP,
  getMemoriesFrameCropStyle,
  type MemoriesFrameCrop,
} from "@/lib/memories-frame-crop";
import { cn } from "@/lib/utils";

interface MemoriesFramedPhotoProps {
  src: string;
  alt: string;
  crop?: Partial<MemoriesFrameCrop>;
  className?: string;
  frameClassName?: string;
  priority?: boolean;
  onError?: () => void;
}

export function MemoriesFramedPhoto({
  src,
  alt,
  crop,
  className,
  frameClassName,
  priority = false,
  onError,
}: MemoriesFramedPhotoProps) {
  const resolvedCrop = {
    ...DEFAULT_MEMORIES_FRAME_CROP,
    ...crop,
  };
  const style = getMemoriesFrameCropStyle(resolvedCrop);

  return (
    <div className={cn("memories-framed-photo", className)}>
      <MemoriesGalleryFrame className={cn("memories-framed-photo__frame", frameClassName)}>
        <div className="memories-framed-photo__viewport">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="memories-framed-photo__img"
            style={style}
            draggable={false}
            loading={priority ? "eager" : "lazy"}
            onError={onError}
          />
        </div>
      </MemoriesGalleryFrame>
    </div>
  );
}
