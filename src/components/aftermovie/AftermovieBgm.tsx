"use client";

import { useEffect, useRef } from "react";

export const DEFAULT_AFTER_MUSIC = "/audio/memoora-after.mp3";

interface AftermovieBgmProps {
  src?: string | null;
  active?: boolean;
}

function toAbsoluteMusicUrl(src?: string | null): string {
  const raw = (src?.trim() || DEFAULT_AFTER_MUSIC).trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (typeof window !== "undefined") {
    return new URL(raw, window.location.origin).href;
  }
  return raw;
}

/**
 * MEMOORA AFTER background music — independent of slideshow pause.
 */
export function AftermovieBgm({ src, active = true }: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!active) return;
    const audio = audioRef.current;
    if (!audio) return;

    const url = toAbsoluteMusicUrl(src);
    if (audio.src !== url) {
      audio.src = url;
    }
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.6;
    audio.muted = false;

    const tryPlay = () => {
      const el = audioRef.current;
      if (!el) return;
      el.muted = false;
      el.volume = 0.6;
      void el.play().catch(() => undefined);
    };

    audio.load();
    tryPlay();
    audio.addEventListener("canplay", tryPlay);
    audio.addEventListener("loadeddata", tryPlay);

    const unlock = () => tryPlay();
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("touchstart", unlock, opts);
    document.addEventListener("touchend", unlock, opts);
    document.addEventListener("pointerdown", unlock, opts);
    document.addEventListener("click", unlock, opts);

    const retry = window.setInterval(() => {
      const el = audioRef.current;
      if (el && el.paused) tryPlay();
    }, 500);

    return () => {
      window.clearInterval(retry);
      audio.removeEventListener("canplay", tryPlay);
      audio.removeEventListener("loadeddata", tryPlay);
      document.removeEventListener("touchstart", unlock, opts);
      document.removeEventListener("touchend", unlock, opts);
      document.removeEventListener("pointerdown", unlock, opts);
      document.removeEventListener("click", unlock, opts);
      audio.pause();
    };
  }, [active, src]);

  if (!active) return null;

  return (
    <audio
      ref={audioRef}
      preload="auto"
      autoPlay
      loop
      playsInline
      controls={false}
      style={{
        position: "fixed",
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
