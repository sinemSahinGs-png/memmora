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
  musicUrl: _musicUrl,
  posterUrl,
  showArchiveLinks = true,
  autoStartMusic: _autoStartMusic = false,
  onComplete,
  className,
}: AftermovieSlideshowProps) {
  void _musicUrl;
  void _autoStartMusic;
  const [phase, setPhase] = useState<Phase>({ kind: "opening" });
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedOnceRef = useRef(false);
  const holdTimerRef = useRef<number | null>(null);
  const hold = photoHoldMs(durationPreset);

  const ordered = useMemo(
    () => slides.filter((s) => Boolean(s.src)),
    [slides],
  );

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
    // Sustained hold only — short taps must not interrupt music unlock.
    clearHoldTimer();
    holdTimerRef.current = window.setTimeout(() => {
      setPaused(true);
    }, 280);
  };

  const releasePause = (event: PointerEvent<HTMLDivElement>) => {
    clearHoldTimer();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setPaused(false);
  };

  if (ordered.length === 0) {
    return (
      <div className={cn("aftermovie-slideshow aftermovie-slideshow--empty", className)}>
        <p>Gösterilecek anı bulunamadı.</p>
      </div>
    );
  }

  const showChrome = !_autoStartMusic;

  return (
    <div className={cn("aftermovie-slideshow", className)}>
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
          setPaused(false);
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
