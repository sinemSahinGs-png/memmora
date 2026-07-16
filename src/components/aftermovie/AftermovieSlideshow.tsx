"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { AftermovieDurationPreset, AftermovieMediaItem } from "@/lib/aftermovie/types";
import { cn } from "@/lib/utils";

export interface SlideshowSlide {
  id: string;
  mediaType: "photo" | "video";
  src: string;
  alt?: string;
}

interface AftermovieSlideshowProps {
  slides: SlideshowSlide[];
  title: string;
  openingText?: string | null;
  closingText?: string | null;
  weddingDateLabel?: string | null;
  durationPreset?: AftermovieDurationPreset;
  musicUrl?: string | null;
  posterUrl?: string | null;
  /** When false, hide links back to the old wedding site archive. */
  showArchiveLinks?: boolean;
  /** Start music unmuted on mount; hide mute toggle. */
  autoStartMusic?: boolean;
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_AFTER_MUSIC = "/audio/memoora-after.mp3";

function photoHoldMs(preset: AftermovieDurationPreset | undefined): number {
  switch (preset) {
    case "short":
      return 3200;
    case "long":
      return 5200;
    default:
      return 4200;
  }
}

type Phase =
  | { kind: "opening" }
  | { kind: "slide"; index: number }
  | { kind: "closing" };

export function AftermovieSlideshow({
  slides,
  title,
  openingText,
  closingText,
  weddingDateLabel,
  durationPreset = "standard",
  musicUrl,
  posterUrl,
  showArchiveLinks = true,
  autoStartMusic = false,
  onComplete,
  className,
}: AftermovieSlideshowProps) {
  const [phase, setPhase] = useState<Phase>({ kind: "opening" });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(!autoStartMusic);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedOnceRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const hold = photoHoldMs(durationPreset);

  const resolvedMusicUrl = useMemo(() => {
    const fromProp = musicUrl?.trim();
    if (fromProp) return fromProp;
    return autoStartMusic ? DEFAULT_AFTER_MUSIC : null;
  }, [autoStartMusic, musicUrl]);

  const ordered = useMemo(
    () => slides.filter((s) => Boolean(s.src)),
    [slides],
  );

  const playMusic = (opts?: { ignorePause?: boolean }) => {
    const audio = audioRef.current;
    if (!audio || !resolvedMusicUrl) return;
    if (pausedRef.current && !opts?.ignorePause) return;

    audio.loop = true;
    audio.volume = 0.55;

    const run = async () => {
      try {
        audio.muted = false;
        await audio.play();
        setMuted(false);
        return;
      } catch {
        /* try muted start then unmute — some browsers allow this path */
      }
      try {
        audio.muted = true;
        await audio.play();
        audio.muted = false;
        await audio.play();
        setMuted(false);
      } catch {
        /* wait for a real user gesture */
      }
    };

    void run();
  };

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !resolvedMusicUrl) return;
    audio.loop = true;
    audio.volume = 0.55;
    if (paused) {
      audio.pause();
      return;
    }
    if (autoStartMusic || !muted) {
      playMusic({ ignorePause: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate phase/music sync
  }, [autoStartMusic, muted, paused, phase, resolvedMusicUrl]);

  useEffect(() => {
    if (!autoStartMusic || !resolvedMusicUrl) return;

    playMusic({ ignorePause: true });

    const unlock = () => {
      if (!pausedRef.current) {
        playMusic({ ignorePause: true });
      }
    };

    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    const retry = window.setInterval(() => {
      if (pausedRef.current) return;
      const audio = audioRef.current;
      if (audio && audio.paused) {
        playMusic({ ignorePause: true });
      }
    }, 1200);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.clearInterval(retry);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount unlock
  }, [autoStartMusic, resolvedMusicUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      video.pause();
    } else {
      void video.play().catch(() => undefined);
    }
  }, [paused, phase]);

  useEffect(() => {
    if (paused || ordered.length === 0) return;

    if (phase.kind === "opening") {
      const t = window.setTimeout(() => {
        setPhase(
          ordered.length > 0 ? { kind: "slide", index: 0 } : { kind: "closing" },
        );
      }, 3200);
      return () => window.clearTimeout(t);
    }

    if (phase.kind === "closing") {
      const t = window.setTimeout(() => {
        if (!completedOnceRef.current) {
          completedOnceRef.current = true;
          onComplete?.();
        }
        setError(false);
        setPhase({ kind: "opening" });
      }, 3200);
      return () => window.clearTimeout(t);
    }

    if (phase.kind === "slide") {
      const slide = ordered[phase.index];
      if (!slide) {
        setPhase({ kind: "closing" });
        return;
      }
      if (slide.mediaType === "video") {
        const t = window.setTimeout(() => {
          const next = phase.index + 1;
          setPhase(
            next < ordered.length
              ? { kind: "slide", index: next }
              : { kind: "closing" },
          );
        }, 12000);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => {
        const next = phase.index + 1;
        setPhase(
          next < ordered.length
            ? { kind: "slide", index: next }
            : { kind: "closing" },
        );
      }, hold);
      return () => window.clearTimeout(t);
    }
  }, [hold, onComplete, ordered, paused, phase]);

  const currentSlide =
    phase.kind === "slide" ? ordered[phase.index] ?? null : null;

  const clearHoldTimer = () => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const holdPause = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    // First touch unlocks audio; only a sustained hold pauses.
    playMusic({ ignorePause: true });
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      pausedRef.current = true;
      setPaused(true);
    }, 200);
  };

  const releasePause = (event: PointerEvent<HTMLDivElement>) => {
    clearHoldTimer();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pausedRef.current = false;
    setPaused(false);
    playMusic({ ignorePause: true });
  };

  if (ordered.length === 0) {
    return (
      <div className={cn("aftermovie-slideshow aftermovie-slideshow--empty", className)}>
        <p>Gösterilecek anı bulunamadı.</p>
      </div>
    );
  }

  const showChrome = !autoStartMusic;

  return (
    <div className={cn("aftermovie-slideshow", className)}>
      {resolvedMusicUrl ? (
        <audio
          ref={audioRef}
          src={resolvedMusicUrl}
          preload="auto"
          autoPlay={autoStartMusic}
          playsInline
        />
      ) : null}

      {posterUrl && phase.kind === "opening" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" className="aftermovie-slideshow__bg" />
      ) : null}

      <div
        className="aftermovie-slideshow__stage"
        onPointerDown={holdPause}
        onPointerUp={releasePause}
        onPointerCancel={releasePause}
        onLostPointerCapture={() => {
          clearHoldTimer();
          pausedRef.current = false;
          setPaused(false);
          playMusic({ ignorePause: true });
        }}
        onContextMenu={(e) => e.preventDefault()}
        role="presentation"
      >
        {phase.kind === "opening" ? (
          <div className="aftermovie-slideshow__card aftermovie-slideshow__card--title">
            <p className="aftermovie-slideshow__eyebrow">MEMOORA AFTER</p>
            <h2>{openingText || title}</h2>
            {weddingDateLabel ? <p>{weddingDateLabel}</p> : null}
          </div>
        ) : null}

        {currentSlide?.mediaType === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={currentSlide.id}
            src={currentSlide.src}
            alt={currentSlide.alt ?? ""}
            className="aftermovie-slideshow__media aftermovie-slideshow__media--photo"
            draggable={false}
            onError={() => setError(true)}
          />
        ) : null}

        {currentSlide?.mediaType === "video" ? (
          <video
            key={currentSlide.id}
            ref={videoRef}
            className="aftermovie-slideshow__media aftermovie-slideshow__media--video"
            src={currentSlide.src}
            playsInline
            muted
            autoPlay={!paused}
            draggable={false}
            onEnded={() => {
              if (phase.kind !== "slide") return;
              const next = phase.index + 1;
              setPhase(
                next < ordered.length
                  ? { kind: "slide", index: next }
                  : { kind: "closing" },
              );
            }}
            onError={() => setError(true)}
          />
        ) : null}

        {phase.kind === "closing" ? (
          <div className="aftermovie-slideshow__card aftermovie-slideshow__card--title">
            <p>{closingText || "Anılar yaşamaya devam ediyor."}</p>
            <p className="aftermovie-slideshow__brand">Memoora</p>
          </div>
        ) : null}

        {error ? (
          <div className="aftermovie-slideshow__error" role="alert">
            <p>Bazı anılar yüklenemedi. Devam edebilirsiniz.</p>
            {showArchiveLinks ? <a href="#gallery">Anılara Devam Et</a> : null}
          </div>
        ) : null}
      </div>

      {showChrome ? (
        <div className="aftermovie-slideshow__controls">
          <button
            type="button"
            onClick={() => {
              setMuted((m) => !m);
              playMusic({ ignorePause: true });
            }}
            aria-label={muted ? "Sesi aç" : "Sesi kapat"}
          >
            {muted ? "Sesi Aç" : "Ses Açık"}
          </button>
          {showArchiveLinks ? (
            <a href="#gallery" className="aftermovie-slideshow__link">
              Anılara Devam Et
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function mediaItemsToSlides(
  media: AftermovieMediaItem[] | undefined,
  coupleSlug: string,
): SlideshowSlide[] {
  if (!media?.length) return [];
  return [...media]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.mediaId,
      mediaType: m.mediaType,
      src:
        m.proxyUrl ||
        `/api/media/view/${encodeURIComponent(m.mediaId)}?coupleSlug=${encodeURIComponent(coupleSlug)}`,
      alt: m.guestName ?? undefined,
    }));
}
