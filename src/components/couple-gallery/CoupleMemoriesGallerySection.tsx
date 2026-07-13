"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MemoriesGalleryFrame } from "@/components/couple-gallery/MemoriesGalleryFrame";
import { ASSETS } from "@/lib/assets";
import {
  clampFrameCrop,
  DEFAULT_MEMORIES_FRAME_CROP,
  getMemoriesFrameCropStyle,
} from "@/lib/memories-frame-crop";
import { fetchCouplePhotos } from "@/lib/supabase/couple-photos";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { CouplePhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CoupleMemoriesGallerySectionProps {
  coupleId: string;
  enabled?: boolean;
}

const easePremium = [0.22, 1, 0.36, 1] as const;

const headerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const headerItem = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: easePremium },
  },
};

function GalleryPhoto({
  photo,
  className,
  variant = "main",
  priority = false,
}: {
  photo: CouplePhoto;
  className?: string;
  variant?: "main" | "thumb";
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={cn("couple-memories-photo-fallback", className)}>
        <span>Fotoğraf yüklenemedi</span>
      </div>
    );
  }

  const crop = clampFrameCrop({
    zoom: photo.frameZoom ?? DEFAULT_MEMORIES_FRAME_CROP.zoom,
    panX: photo.framePanX ?? DEFAULT_MEMORIES_FRAME_CROP.panX,
    panY: photo.framePanY ?? DEFAULT_MEMORIES_FRAME_CROP.panY,
  });
  const style = getMemoriesFrameCropStyle(crop);

  if (variant === "thumb") {
    return (
      <div
        className={cn(
          "couple-memories-photo-treated couple-memories-photo-treated--thumb",
          className
        )}
      >
        <div className="memories-framed-photo__viewport memories-framed-photo__viewport--thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.imageUrl}
            alt={photo.caption ?? "Anı fotoğrafı"}
            className="memories-framed-photo__img"
            style={style}
            draggable={false}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("couple-memories-photo-treated", className)}>
      <div className="memories-framed-photo__viewport">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.imageUrl}
          alt={photo.caption ?? "Anı fotoğrafı"}
          className="memories-framed-photo__img couple-memories-photo-treated__img"
          style={style}
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      </div>
      <span className="couple-memories-photo-treated__vignette" aria-hidden />
      <span className="couple-memories-photo-treated__warmth" aria-hidden />
    </div>
  );
}

export function CoupleMemoriesGallerySection({
  coupleId,
  enabled = true,
}: CoupleMemoriesGallerySectionProps) {
  const [photos, setPhotos] = useState<CouplePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    fetchCouplePhotos(coupleId)
      .then((rows) => setPhotos(rows))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [coupleId]);

  const goTo = useCallback(
    (index: number) => {
      if (photos.length === 0) return;

      const next = (index + photos.length) % photos.length;
      if (next === activeIndex) return;

      let delta = next - activeIndex;
      if (delta > photos.length / 2) delta -= photos.length;
      if (delta < -photos.length / 2) delta += photos.length;

      setSlideDirection(delta >= 0 ? 1 : -1);
      setActiveIndex(next);
    },
    [photos.length, activeIndex]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0]?.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  if (!enabled || loading || photos.length === 0) return null;

  const activePhoto = photos[activeIndex];
  const slideOffset = slideDirection * 52;

  return (
    <section id="memories" className="couple-memories-section">
      <div
        className="couple-memories-section-bg"
        style={{ backgroundImage: `url(${ASSETS.galleryBg})` }}
        aria-hidden
      />
      <div className="couple-memories-section-glow" aria-hidden />
      <div className="couple-memories-section-ambient" aria-hidden />
      <div className="couple-memories-section-top-blend" aria-hidden />

      <div className="couple-memories-inner">
        <motion.header
          className="couple-memories-heading"
          variants={headerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.span
            className="couple-memories-leaf"
            variants={headerItem}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-1 4-4 7-8 8 4 1 7 4 8 8 1-4 4-7 8-8-4-1-7-4-8-8z" />
            </svg>
          </motion.span>

          <motion.div className="couple-memories-title-row" variants={headerItem}>
            <Image
              src={ASSETS.galleryFlourish}
              alt=""
              width={120}
              height={24}
              className="couple-memories-flourish couple-memories-flourish--left"
              aria-hidden
            />
            <h2 className="couple-memories-title font-serif">
              <span className="couple-memories-title__glow">Anılarımız</span>
            </h2>
            <Image
              src={ASSETS.galleryFlourish}
              alt=""
              width={120}
              height={24}
              className="couple-memories-flourish"
              aria-hidden
            />
          </motion.div>

          <motion.p className="couple-memories-subtitle" variants={headerItem}>
            Bu özel yolculuğumuzdan en güzel anılar.
          </motion.p>

          <motion.div className="couple-memories-divider" variants={headerItem} aria-hidden>
            <span />
            <i />
            <span />
          </motion.div>
        </motion.header>

        <motion.div
          className="couple-memories-carousel"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.2, ease: easePremium }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.button
            type="button"
            className="couple-memories-nav couple-memories-nav--prev"
            onClick={goPrev}
            aria-label="Önceki fotoğraf"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.06 }}
          >
            ‹
          </motion.button>

          <motion.div
            className="couple-memories-frame-stage"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MemoriesGalleryFrame className="couple-memories-frame">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={activePhoto.id}
                  className="couple-memories-slide"
                  custom={slideDirection}
                  initial={{
                    opacity: 0,
                    x: slideOffset,
                    scale: 1.05,
                    filter: "blur(10px) brightness(1.08)",
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: "blur(0px) brightness(1)",
                  }}
                  exit={{
                    opacity: 0,
                    x: -slideOffset * 0.65,
                    scale: 0.97,
                    filter: "blur(8px) brightness(0.92)",
                  }}
                  transition={{ duration: 0.72, ease: easePremium }}
                >
                  <GalleryPhoto photo={activePhoto} variant="main" priority />
                </motion.div>
              </AnimatePresence>
            </MemoriesGalleryFrame>
          </motion.div>

          <motion.button
            type="button"
            className="couple-memories-nav couple-memories-nav--next"
            onClick={goNext}
            aria-label="Sonraki fotoğraf"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.06 }}
          >
            ›
          </motion.button>
        </motion.div>

        <motion.div
          className="couple-memories-dots"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35, ease: easePremium }}
        >
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              className={cn(
                "couple-memories-dot",
                index === activeIndex && "couple-memories-dot--active"
              )}
              onClick={() => goTo(index)}
              aria-label={`Fotoğraf ${index + 1}`}
              animate={
                index === activeIndex
                  ? { scale: 1.35, opacity: 1 }
                  : { scale: 1, opacity: 0.55 }
              }
              transition={{ duration: 0.35, ease: easePremium }}
            />
          ))}
        </motion.div>

        <motion.div
          className="couple-memories-thumbs-wrap"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, delay: 0.4, ease: easePremium }}
        >
          <button
            type="button"
            className="couple-memories-thumb-nav"
            onClick={goPrev}
            aria-label="Önceki küçük resim"
          >
            ‹
          </button>

          <div className="couple-memories-thumbs">
            {photos.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                className={cn(
                  "couple-memories-thumb",
                  index === activeIndex && "couple-memories-thumb--active"
                )}
                onClick={() => goTo(index)}
                aria-label={`Fotoğraf ${index + 1}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                layout
              >
                <GalleryPhoto photo={photo} variant="thumb" />
              </motion.button>
            ))}
          </div>

          <button
            type="button"
            className="couple-memories-thumb-nav"
            onClick={goNext}
            aria-label="Sonraki küçük resim"
          >
            ›
          </button>
        </motion.div>

        <motion.blockquote
          className="couple-memories-quote font-serif"
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.15, ease: easePremium }}
        >
          <span className="couple-memories-quote-mark" aria-hidden>
            “
          </span>
          <p>
            <span className="couple-memories-quote-line">
              Bazı anlar vardır, zamanın durduğu...
            </span>
            <br />
            <span className="couple-memories-quote-line couple-memories-quote-line--delay">
              İşte onlar, bizim en kıymetli anılarımız.
            </span>
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}
