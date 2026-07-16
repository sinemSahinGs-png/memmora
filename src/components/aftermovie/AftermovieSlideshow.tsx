"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AftermovieDurationPreset, AftermovieMediaItem } from "@/lib/aftermovie/types";
import { cn } from "@/lib/utils";
import { FadeWords, fadeWordsDurationMs } from "./FadeWords";

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
  showArchiveLinks?: boolean;
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
  title: _title,
  openingText: _openingText,
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
  void _title;
  void _openingText;
  void _musicUrl;
  void _autoStartMusic;

  const [phase, setPhase] = useState<Phase>({ kind: "opening" });
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedOnceRef = useRef(false);
  const hold = photoHoldMs(durationPreset);

  const ordered = useMemo(
    () => slides.filter((s) => Boolean(s.src)),
    [slides],
  );

  const dateText = weddingDateLabel?.trim() || "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => undefined);
  }, [phase]);

  useEffect(() => {
    if (ordered.length === 0) return;

    if (phase.kind === "opening") {
      const mobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 768px)").matches;
      const startDelay = mobile ? 480 : 320;
      const step = mobile ? 340 : 200;
      const holdAfter = mobile ? 2400 : 1800;
      const duration = dateText
        ? fadeWordsDurationMs(dateText, startDelay, step, holdAfter)
        : 2200;
      const t = window.setTimeout(() => {
        setPhase(
          ordered.length > 0 ? { kind: "slide", index: 0 } : { kind: "closing" },
        );
      }, duration);
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
  }, [dateText, hold, onComplete, ordered, phase]);

  const currentSlide =
    phase.kind === "slide" ? ordered[phase.index] ?? null : null;

  if (ordered.length === 0) {
    return (
      <div className={cn("aftermovie-slideshow aftermovie-slideshow--empty", className)}>
        <p>Gösterilecek anı bulunamadı.</p>
      </div>
    );
  }

  const showChrome = showArchiveLinks;

  return (
    <div className={cn("aftermovie-slideshow", className)}>
      {posterUrl && phase.kind === "opening" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={posterUrl} alt="" className="aftermovie-slideshow__bg" />
      ) : null}

      <div
        className="aftermovie-slideshow__stage"
        onContextMenu={(e) => e.preventDefault()}
        role="presentation"
      >
        {phase.kind === "opening" ? (
          <div className="aftermovie-slideshow__card aftermovie-slideshow__card--date">
            {dateText ? (
              <FadeWords
                as="p"
                className="aftermovie-slideshow__date"
                text={dateText}
                startDelayMs={320}
                stepMs={200}
                slowOnMobile
              />
            ) : (
              <p className="aftermovie-slideshow__date">Memoora After</p>
            )}
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
            autoPlay
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
