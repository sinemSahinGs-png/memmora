"use client";

import { useState, useRef, useEffect } from "react";
import { DEFAULT_HERO_VIDEO_SRC } from "@/lib/hero-config";
import { cn } from "@/lib/utils";

interface HeroVideoBackgroundProps {
  className?: string;
  showLeafPulse?: boolean;
  videoSrc?: string;
}

export function HeroVideoBackground({
  className,
  showLeafPulse = false,
  videoSrc = DEFAULT_HERO_VIDEO_SRC,
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoReady(false);
    setVideoFailed(false);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [videoSrc]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a5f55] via-[#3a4f45] to-[#2a3d35]" />

      {!videoFailed && (
        <video
          key={videoSrc}
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={cn(
            "hero-video absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            videoReady ? "opacity-100" : "opacity-0"
          )}
          onCanPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div className="hero-overlay-mist-left" />
      <div className="hero-overlay-top-haze" />
      <div className="hero-overlay-bottom" />

      {showLeafPulse && (
        <div className="pointer-events-none absolute left-1/2 top-[38%] z-[2] h-2 w-2 -translate-x-1/2 rounded-full bg-[#F4F1E8]/35" />
      )}
    </div>
  );
}
