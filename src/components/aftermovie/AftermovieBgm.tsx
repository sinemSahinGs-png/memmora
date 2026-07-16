"use client";

import { useEffect, useRef, useState } from "react";

export const DEFAULT_AFTER_MUSIC = "/audio/memoora-after.mp3";

interface AftermovieBgmProps {
  src?: string | null;
  active?: boolean;
}

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
 * Autoplay when the browser allows; otherwise first gesture / Sesi Aç unlocks.
 * Button shows Ses Açık while playing and pauses on tap.
 */
export function AftermovieBgm({ src, active = true }: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);
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
      el.addEventListener("pause", () => {
        if (!userPausedRef.current) setPlaying(false);
        else setPlaying(false);
      });
      el.addEventListener("ended", () => setPlaying(false));
      el.addEventListener("error", () => {
        setPlaying(false);
        setError("Müzik yüklenemedi");
      });
    } else if (!el.src || el.src !== absolute) {
      el.src = absolute;
    }
    return el;
  };

  const startMusic = (fromGesture = false) => {
    if (userPausedRef.current && !fromGesture) return;
    setError(null);
    const el = ensureAudio();
    el.muted = false;
    el.volume = 0.7;
    void el
      .play()
      .then(() => {
        userPausedRef.current = false;
        setPlaying(true);
        setError(null);
      })
      .catch(async () => {
        // Some browsers allow muted autoplay — start silent then unmute.
        try {
          el.muted = true;
          await el.play();
          el.muted = false;
          if (!el.paused && !el.muted) {
            userPausedRef.current = false;
            setPlaying(true);
            return;
          }
          setPlaying(false);
        } catch {
          setPlaying(false);
        }
      });
  };

  useEffect(() => {
    if (!active) return;
    ensureAudio();
    startMusic(false);

    const unlock = () => {
      if (userPausedRef.current) return;
      if (audioRef.current && !audioRef.current.paused) return;
      startMusic(true);
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerdown", unlock, opts);
    document.addEventListener("touchstart", unlock, opts);
    document.addEventListener("keydown", unlock, opts);

    const retry = window.setInterval(() => {
      if (userPausedRef.current) return;
      const el = audioRef.current;
      if (el && el.paused) startMusic(false);
    }, 2000);

    return () => {
      window.clearInterval(retry);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, url]);

  if (!active) return null;

  const toggle = () => {
    const el = audioRef.current ?? ensureAudio();
    if (el && !el.paused) {
      userPausedRef.current = true;
      el.pause();
      setPlaying(false);
      return;
    }
    userPausedRef.current = false;
    startMusic(true);
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
