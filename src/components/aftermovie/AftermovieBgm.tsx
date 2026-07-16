"use client";

import { useEffect, useRef, useState } from "react";

export const DEFAULT_AFTER_MUSIC = "/audio/memoora-after.mp3";

interface AftermovieBgmProps {
  src?: string | null;
  active?: boolean;
}

/** Prefer the known shipped file when DB still points at missing seed URLs. */
export function resolveAftermovieMusicUrl(src?: string | null): string {
  const raw = (src?.trim() || "").trim();
  if (!raw) return DEFAULT_AFTER_MUSIC;
  if (
    raw.includes("aftermovie-soft-emerald") ||
    raw.includes("aftermovie-ivory-evening")
  ) {
    return DEFAULT_AFTER_MUSIC;
  }
  return raw;
}

function toAbsolute(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined") {
    return new URL(url, window.location.origin).href;
  }
  return url;
}

/**
 * MEMOORA AFTER soundtrack with a reliable tap-to-play control.
 * Creates/plays Audio inside the click handler (required for iOS).
 */
export function AftermovieBgm({ src, active = true }: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = resolveAftermovieMusicUrl(src);

  useEffect(() => {
    if (!active) return;
    return () => {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = "";
      }
      audioRef.current = null;
    };
  }, [active, url]);

  if (!active) return null;

  const startMusic = () => {
    setError(null);
    const absolute = toAbsolute(url);

    // Reuse one element, but ensure play() is invoked in this click stack.
    let el = audioRef.current;
    if (!el) {
      el = new Audio();
      el.loop = true;
      el.preload = "auto";
      audioRef.current = el;
      el.addEventListener("playing", () => setPlaying(true));
      el.addEventListener("pause", () => setPlaying(false));
      el.addEventListener("ended", () => setPlaying(false));
      el.addEventListener("error", () => {
        setPlaying(false);
        setError("Müzik yüklenemedi");
      });
    }

    if (!el.src || el.src !== absolute) {
      el.src = absolute;
    }
    el.src = absolute;
    el.muted = false;
    el.volume = 0.7;

    const playPromise = el.play();
    if (playPromise !== undefined) {
      void playPromise
        .then(() => {
          setPlaying(true);
          setError(null);
        })
        .catch((err: unknown) => {
          setPlaying(false);
          const message =
            err instanceof Error ? err.message : "Ses başlatılamadı";
          setError(message);
          // Last resort: recreate element inside the same gesture
          try {
            const fresh = new Audio(absolute);
            fresh.loop = true;
            fresh.volume = 0.7;
            audioRef.current = fresh;
            void fresh.play().then(() => {
              setPlaying(true);
              setError(null);
            });
          } catch {
            setError("Tarayıcı sesi engelledi");
          }
        });
    }
  };

  const toggle = () => {
    const el = audioRef.current;
    if (el && !el.paused) {
      el.pause();
      setPlaying(false);
      return;
    }
    startMusic();
  };

  return (
    <div className="aftermovie-bgm">
      <button
        type="button"
        className={
          playing
            ? "aftermovie-bgm__unlock aftermovie-bgm__unlock--on"
            : "aftermovie-bgm__unlock"
        }
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Sesi kapat" : "Sesi aç"}
      >
        {playing ? "Ses Açık" : "Sesi Aç"}
      </button>
      {error ? (
        <p className="aftermovie-bgm__error" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
