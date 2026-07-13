"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getMediaDownloadUrl, getMediaViewUrl } from "@/lib/admin-media-urls";
import { formatDisplayDate } from "@/lib/mock-data";

export interface GuestGalleryViewerItem {
  mediaId: string;
  guestName: string;
  createdAt: string;
  mimeType: string;
}

interface AdminGuestGalleryViewerProps {
  items: GuestGalleryViewerItem[];
  initialIndex: number;
  coupleSlug: string;
  onClose: () => void;
}

export function AdminGuestGalleryViewer({
  items,
  initialIndex,
  coupleSlug,
  onClose,
}: AdminGuestGalleryViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [videoFailed, setVideoFailed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const item = items[index];
  const viewUrl = getMediaViewUrl(item.mediaId, coupleSlug);
  const downloadUrl = getMediaDownloadUrl(item.mediaId, coupleSlug);
  const isPhoto = item.mimeType.startsWith("image/");
  const isVideo = item.mimeType.startsWith("video/");
  const typeLabel = isPhoto ? "Fotoğraf" : isVideo ? "Video" : "Medya";
  const dateLabel = formatDisplayDate(item.createdAt.split("T")[0]);

  const goPrev = useCallback(() => {
    setVideoFailed(false);
    setIndex((i) => (i > 0 ? i - 1 : items.length - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setVideoFailed(false);
    setIndex((i) => (i < items.length - 1 ? i + 1 : 0));
  }, [items.length]);

  useEffect(() => {
    setVideoFailed(false);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="admin-gallery-viewer"
        role="dialog"
        aria-modal="true"
        aria-label="Medya görüntüleyici"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="admin-gallery-viewer__backdrop"
          onClick={onClose}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <header className="admin-gallery-viewer__top">
          <div className="admin-gallery-viewer__counter">
            {index + 1} / {items.length}
          </div>
          <button
            type="button"
            className="admin-gallery-viewer__close admin-premium-interactive"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </header>

        <div
          className="admin-gallery-viewer__stage"
          onTouchStart={(e) => {
            const t = e.touches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            if (!start) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x;
            const dy = t.clientY - start.y;
            touchStart.current = null;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0) goPrev();
              else goNext();
            }
          }}
        >
          {items.length > 1 ? (
            <button
              type="button"
              className="admin-gallery-viewer__nav admin-gallery-viewer__nav--prev admin-premium-interactive"
              onClick={goPrev}
              aria-label="Önceki"
            >
              ‹
            </button>
          ) : null}

          <motion.div
            key={item.mediaId}
            className="admin-gallery-viewer__media-wrap"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {isPhoto ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={viewUrl} alt="" className="admin-gallery-viewer__img" />
            ) : isVideo && !videoFailed ? (
              <video
                controls
                autoPlay
                playsInline
                src={viewUrl}
                className="admin-gallery-viewer__video"
                onError={() => setVideoFailed(true)}
              />
            ) : (
              <div className="admin-gallery-viewer__fallback">
                <p className="admin-gallery-viewer__fallback-text">
                  Video oynatılamadı.
                </p>
                <a
                  href={downloadUrl}
                  className="admin-guest-gallery__btn admin-guest-gallery__btn--primary admin-premium-interactive"
                >
                  Videoyu İndir
                </a>
              </div>
            )}
          </motion.div>

          {items.length > 1 ? (
            <button
              type="button"
              className="admin-gallery-viewer__nav admin-gallery-viewer__nav--next admin-premium-interactive"
              onClick={goNext}
              aria-label="Sonraki"
            >
              ›
            </button>
          ) : null}
        </div>

        <footer className="admin-gallery-viewer__foot">
          <div className="admin-gallery-viewer__foot-meta">
            <p className="admin-gallery-viewer__name">{item.guestName}</p>
            <p className="admin-gallery-viewer__sub">
              {dateLabel} · {typeLabel}
            </p>
          </div>
          <a
            href={downloadUrl}
            className="admin-guest-gallery__btn admin-guest-gallery__btn--primary admin-premium-interactive admin-gallery-viewer__download"
          >
            İndir
          </a>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
