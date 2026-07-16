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
 * MEMOORA AFTER soundtrack.
 * Auto-starts when the browser allows; button toggles mute/pause.
 * First user gesture anywhere also unlocks play (mobile).
 */
export function AftermovieBgm({ src, active = true }: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = resolveAftermovieMusicUrl(src);

  const ensureAudio = () => {
    const absolute = toAbsolute(url);
    let el = audioRef.current;
    if (!el) {
      el = new Audio(absolute);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0.7;
      audioRef.current = el;
      el.addEventListener("playing", () => setPlaying(true));
      el.addEventListener("pause", () => setPlaying(false));
      el.addEventListener("ended", () => setPlaying(false));
      el.addEventListener("error", () => {
        setPlaying(false);
        setError("Müzik yüklenemedi");
      });
    } else if (el.src !== absolute) {
      el.src = absolute;
    }
    el.muted = false;
    el.volume = 0.7;
    return el;
  };

  const startMusic = () => {
    setError(null);
    const el = ensureAudio();
    const playPromise = el.play();
    if (playPromise !== undefined) {
      void playPromise
        .then(() => {
          setPlaying(true);
          setError(null);
        })
        .catch(() => {
          setPlaying(false);
        });
    }
  };

  useEffect(() => {
    if (!active) return;

    // Prefetch + autoplay attempt on mount
    ensureAudio();
    startMusic();

    const unlock = () => {
      if (audioRef.current && !audioRef.current.paused) return;
      startMusic();
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerdown", unlock, opts);
    document.addEventListener("touchstart", unlock, opts);
    document.addEventListener("keydown", unlock, opts);

    return () => {
      document.removeEventListener("pointerdown", unlock, opts);
      document.removeEventListener("touchstart", unlock, opts);
      document.removeEventListener("keydown", unlock, opts);
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = "";
      }
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per src
  }, [active, url]);

  if (!active) return null;

  const toggle = () => {
    const el = audioRef.current ?? ensureAudio();
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
