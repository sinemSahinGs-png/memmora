"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * MEMOORA AFTER background music with a visible unlock button for mobile browsers.
 */
export function AftermovieBgm({ src, active = true }: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const tryPlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return false;
    el.muted = false;
    el.volume = 0.6;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    return true;
  }, []);

  useEffect(() => {
    if (!active) return;
    const audio = audioRef.current;
    if (!audio) return;

    const url = toAbsoluteMusicUrl(src);
    if (audio.getAttribute("data-src") !== url) {
      audio.src = url;
      audio.setAttribute("data-src", url);
    }
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.6;
    audio.muted = false;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.load();
    tryPlay();

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, [active, src, tryPlay]);

  if (!active) return null;

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        playsInline
        className="aftermovie-bgm__audio"
      />

      <button
        type="button"
        className={
          playing
            ? "aftermovie-bgm__unlock aftermovie-bgm__unlock--on"
            : "aftermovie-bgm__unlock"
        }
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          if (!el.paused) {
            el.pause();
            setPlaying(false);
            return;
          }
          // Synchronous play() inside click — required on iOS
          el.muted = false;
          el.volume = 0.6;
          void el
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
        }}
        aria-pressed={playing}
        aria-label={playing ? "Sesi kapat" : "Sesi aç"}
      >
        {playing ? "Ses Açık" : "Sesi Aç"}
      </button>
    </>
  );
}
