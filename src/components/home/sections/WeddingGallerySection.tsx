"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ASSETS } from "@/lib/assets";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface WeddingGallerySectionProps {
  demoHref: string;
}

export function WeddingGallerySection({ demoHref }: WeddingGallerySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const frames = gsap.utils.toArray<HTMLElement>(".cine-gallery__frame");
      gsap.set(frames, { opacity: 1, y: 0 });

      gsap.to(frames, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          end: "top 40%",
          scrub: 0.45,
        },
      });
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="galeri"
      className="cine-gallery"
      aria-label="Düğün galerisi"
    >
      <div className="cine-container cine-gallery__intro">
        <p className="cine-eyebrow">DÜĞÜN GALERİSİ</p>
        <SplitTextReveal as="h2" className="cine-heading">
          O gecenin
          <br />
          gerçek anları.
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body">
            Misafirlerin paylaştığı fotoğraf ve videolar çiftin özel düğün
            galerisinde bir araya gelir.
          </p>
        </ScrollReveal>
      </div>

      <div className="cine-gallery__grid cine-container">
        <figure className="cine-gallery__frame cine-gallery__frame--hero">
          <Image
            src={ASSETS.galleryBg}
            alt="Düğün fotoğrafı"
            fill
            sizes="92vw"
            className="cine-gallery__img"
          />
        </figure>
        <figure className="cine-gallery__frame">
          <Image
            src="/assets/memories/shared-02.jpg"
            alt="Düğün anısı"
            fill
            sizes="45vw"
            className="cine-gallery__img"
          />
        </figure>
        <figure className="cine-gallery__frame">
          <Image
            src="/assets/memories/shared-03.jpg"
            alt="Düğün anısı"
            fill
            sizes="45vw"
            className="cine-gallery__img"
          />
        </figure>
        <figure className="cine-gallery__frame cine-gallery__frame--video">
          <Image
            src="/assets/memories/shared-04.jpg"
            alt="Düğün videosu"
            fill
            sizes="92vw"
            className="cine-gallery__img"
          />
          <span className="cine-gallery__play">Video</span>
        </figure>
      </div>

      <div className="cine-container cine-gallery__footer">
        <p className="cine-gallery__count">128 fotoğraf · 24 video</p>
        <Link href={demoHref} className="cine-btn cine-btn--ghost">
          Tüm Anıları Gör
        </Link>
      </div>
    </section>
  );
}
