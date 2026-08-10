"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  SHARED_MEMORY_SOURCES,
  type SharedMemorySource,
} from "@/components/home/shared-memories-data";
import { getMemoriesFrameCropStyle } from "@/lib/memories-frame-crop";

gsap.registerPlugin(ScrollTrigger);

const FRAME_CLASSES = [
  "cine-after__photo--a",
  "cine-after__photo--b",
  "cine-after__photo--c",
  "cine-after__photo--d",
  "cine-after__photo--e",
] as const;

const FALLBACK_SRCS = [
  SHARED_MEMORY_SOURCES[0],
  SHARED_MEMORY_SOURCES[2],
  SHARED_MEMORY_SOURCES[4],
  SHARED_MEMORY_SOURCES[1],
  SHARED_MEMORY_SOURCES[5],
] as const;

interface MemooraAfterSectionProps {
  sources?: SharedMemorySource[];
}

export function MemooraAfterSection({ sources }: MemooraAfterSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const frames = useMemo(() => {
    const pool: SharedMemorySource[] =
      sources && sources.length > 0
        ? sources
        : FALLBACK_SRCS.map((src) => ({ src }));

    return FRAME_CLASSES.map((className, i) => {
      const source = pool[i % pool.length];
      const hasCrop =
        source.frameZoom != null ||
        source.framePanX != null ||
        source.framePanY != null;
      return {
        src: source.src,
        className,
        cropStyle: hasCrop
          ? getMemoriesFrameCropStyle({
              zoom: source.frameZoom ?? 1,
              panX: source.framePanX ?? 0,
              panY: source.framePanY ?? 0,
            })
          : undefined,
      };
    });
  }, [sources]);

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const veil = section.querySelector(".cine-after__veil");
      const eyebrow = section.querySelector(".cine-eyebrow");
      const lines = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-after__title-line"),
      );
      const body = section.querySelector(".cine-after__body");
      const photos = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-after__photo"),
      );
      const closing = section.querySelector(".cine-after__closing");
      const grain = section.querySelector(".cine-after__grain");

      if (reduced) {
        gsap.set([veil, eyebrow, ...lines, body, ...photos, closing, grain], {
          opacity: 1,
          y: 0,
          x: 0,
          clearProps: "filter,transform",
        });
        return;
      }

      gsap.set(veil, { opacity: 0 });
      gsap.set(eyebrow, { opacity: 0 });
      gsap.set(lines, { opacity: 0, y: 22 });
      gsap.set(body, { opacity: 0, y: 12 });
      gsap.set(closing, { opacity: 0, y: 10 });
      if (grain) gsap.set(grain, { opacity: 0 });

      photos.forEach((photo, i) => {
        const fromX = [-48, 56, -28, 40, -18][i] ?? 0;
        const fromY = [36, -30, 48, 22, -40][i] ?? 20;
        gsap.set(photo, {
          opacity: 0,
          x: fromX,
          y: fromY,
          scale: 0.94,
          filter: i === 2 ? "blur(0px)" : "blur(2.5px)",
        });
      });

      const enter = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      enter
        .to(veil, { opacity: 1, duration: 1.1, ease: "power1.out" })
        .to(eyebrow, { opacity: 1, duration: 0.55, ease: "power1.out" }, 0.25)
        .to(
          lines,
          {
            opacity: 1,
            y: 0,
            stagger: 0.18,
            duration: 0.8,
            ease: "power2.out",
          },
          0.4,
        )
        .to(
          body,
          { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" },
          0.85,
        )
        .to(
          photos,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 1.05,
            ease: "power2.out",
          },
          0.55,
        )
        .to(grain, { opacity: 0.14, duration: 0.8 }, 0.7)
        .to(
          closing,
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          1.35,
        );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            end: "bottom 30%",
            scrub: 0.85,
          },
        })
        .to(
          photos,
          {
            x: (i) => [8, -10, 0, -6, 5][i] ?? 0,
            y: (i) => [-6, 8, -2, 10, -8][i] ?? 0,
            scale: (i) => (i === 2 ? 1.04 : 0.98),
            filter: (i) => (i === 2 ? "blur(0px)" : "blur(1.6px)"),
            ease: "none",
          },
          0,
        );
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="memoora-after"
      className="cine-after cine-after--minimal"
      aria-label="Memoora After"
    >
      <div className="cine-after__veil" aria-hidden />
      <div className="cine-after__grain" aria-hidden />

      <div className="cine-after__constellation" aria-hidden>
        {frames.map((frame) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${frame.className}-${frame.src}`}
            src={frame.src}
            alt=""
            className={`cine-after__photo ${frame.className}`}
            style={frame.cropStyle}
          />
        ))}
      </div>

      <div className="cine-container cine-after__core">
        <p className="cine-eyebrow">MEMOORA AFTER</p>
        <h2 className="cine-heading cine-after__title">
          <span className="cine-after__title-line">Gece Biter.</span>
          <span className="cine-after__title-line">Memoora Bitmez.</span>
        </h2>
        <p className="cine-after__body">
          Düğünden sonra seçtiğiniz anlar,
          <br />
          hikâyenizin yeni açılışına dönüşür.
        </p>
        <p className="cine-after__closing">Düğününüz bir tarihte kalmaz.</p>
      </div>
    </section>
  );
}
