"use client";

import { useEffect, useRef, useState } from "react";
import { MEMORY_GARDEN_VIDEO_SRC } from "@/lib/memory-garden-config";
import { cn } from "@/lib/utils";

interface MemoryGardenBackgroundProps {
  className?: string;
  variant?: "default" | "leaderboard";
}

export function MemoryGardenBackground({
  className,
  variant = "default",
}: MemoryGardenBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    video.play().catch(() => {});
  }, [videoFailed]);

  return (
    <div className={cn("memory-garden-bg", className)} aria-hidden>
      <div className="memory-garden-bg-fallback" />

      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={
            variant === "leaderboard"
              ? "memory-garden-bg-video memory-garden-bg-video--leaderboard"
              : "memory-garden-bg-video"
          }
          onError={() => {
            console.warn(
              "[Memoora] memory-garden-bg.mp4 yüklenemedi — gradient fallback kullanılıyor."
            );
            setVideoFailed(true);
          }}
        >
          <source src={MEMORY_GARDEN_VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div className="memory-garden-overlay-haze" />
      <div className="memory-garden-overlay-vignette" />
    </div>
  );
}
