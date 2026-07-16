"use client";

import { useEffect, useRef } from "react";

const DEFAULT_AFTER_MUSIC = "/audio/memoora-after.mp3";

interface AftermovieBgmProps {
  src?: string | null;
  paused?: boolean;
  active?: boolean;
}

/**
 * Background music for MEMOORA AFTER.
 * Unmuted play() is invoked synchronously from user-gesture handlers (required on iOS).
 * Also retries on canplay / visibility — desktop and some Android browsers allow autoplay.
 */
export function AftermovieBgm({
  src,
  paused = false,
  active = true,
}: AftermovieBgmProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pausedRef = useRef(paused);
  const url = (src?.trim() || DEFAULT_AFTER_MUSIC).trim();

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const playSync = () => {
    if (!active || pausedRef.current) return;

    const tryEl = (el: HTMLMediaElement | null) => {
      if (!el) return;
      el.loop = true;
      el.muted = false;
      el.volume = 0.55;
      // Must call play() synchronously inside gesture call stacks (iOS).
      void el.play().catch(() => undefined);
    };

    tryEl(audioRef.current);
    tryEl(videoRef.current);
  };

  useEffect(() => {
    if (!active) return;

    const audio = audioRef.current;
    const video = videoRef.current;
    for (const el of [audio, video]) {
      if (!el) continue;
      el.loop = true;
      el.preload = "auto";
      el.setAttribute("playsinline", "true");
      el.setAttribute("webkit-playsinline", "true");
    }

    if (paused) {
      audio?.pause();
      video?.pause();
      return;
    }

    playSync();

    const onReady = () => playSync();
    audio?.addEventListener("canplay", onReady);
    audio?.addEventListener("loadeddata", onReady);
    video?.addEventListener("canplay", onReady);
    video?.addEventListener("loadeddata", onReady);

    // Capture-phase gesture unlock — play() stays in the user-activation stack.
    const unlock = () => playSync();
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("touchstart", unlock, opts);
    document.addEventListener("touchend", unlock, opts);
    document.addEventListener("pointerdown", unlock, opts);
    document.addEventListener("click", unlock, opts);
    document.addEventListener("keydown", unlock, opts);

    const onVisible = () => {
      if (document.visibilityState === "visible") playSync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", playSync);

    const retry = window.setInterval(() => {
      if (pausedRef.current) return;
      const a = audioRef.current;
      const v = videoRef.current;
      if ((a && a.paused) || (v && v.paused)) playSync();
    }, 800);

    return () => {
      audio?.removeEventListener("canplay", onReady);
      audio?.removeEventListener("loadeddata", onReady);
      video?.removeEventListener("canplay", onReady);
      video?.removeEventListener("loadeddata", onReady);
      document.removeEventListener("touchstart", unlock, opts);
      document.removeEventListener("touchend", unlock, opts);
      document.removeEventListener("pointerdown", unlock, opts);
      document.removeEventListener("click", unlock, opts);
      document.removeEventListener("keydown", unlock, opts);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", playSync);
      window.clearInterval(retry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/url lifecycle
  }, [active, paused, url]);

  if (!active) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        autoPlay
        loop
        playsInline
      />
      {/* Hidden video fallback — some mobile browsers autoplay video more readily */}
      <video
        ref={videoRef}
        src={url}
        preload="auto"
        autoPlay
        loop
        playsInline
        aria-hidden
        tabIndex={-1}
        style={{
          position: "fixed",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          left: 0,
          top: 0,
          zIndex: -1,
        }}
      />
    </>
  );
}

export { DEFAULT_AFTER_MUSIC };
