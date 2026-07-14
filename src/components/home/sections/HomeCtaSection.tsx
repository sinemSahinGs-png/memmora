"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

interface HomeCtaSectionProps {
  demoHref: string;
}

export function HomeCtaSection({ demoHref }: HomeCtaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const heading = section.querySelector(".cine-cta__heading");
      const support = section.querySelector(".cine-cta__support");
      const actions = section.querySelector(".cine-cta__actions");
      const note = section.querySelector(".cine-cta__note");
      const bloom = section.querySelector(".cine-cta__bloom");

      if (!(heading instanceof HTMLElement)) return;

      const split = new SplitType(heading, { types: "words", tagName: "span" });
      const words = split.words ?? [];

      gsap.set(words, { opacity: 0.55, y: 12, filter: "blur(2px)" });
      gsap.set([support, actions, note], { opacity: 0.7, y: 8 });
      if (bloom) gsap.set(bloom, { opacity: 0.2, scale: 0.95 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top 30%",
            scrub: 0.5,
          },
        })
        .to(words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.06,
          ease: "none",
        })
        .to(bloom, { opacity: 0.45, scale: 1, ease: "none" }, 0.15)
        .to(support, { opacity: 1, y: 0, ease: "none" }, 0.3)
        .to(actions, { opacity: 1, y: 0, ease: "none" }, 0.45)
        .to(note, { opacity: 1, y: 0, ease: "none" }, 0.55);

      return () => split.revert();
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="cine-cta"
      aria-labelledby="cta-heading"
    >
      <div className="cine-cta__bloom" aria-hidden />
      <div className="cine-cta__inner cine-container">
        <p className="cine-eyebrow">MEMOORA</p>
        <h2 id="cta-heading" className="cine-cta__heading">
          Düğününü davet et.
          <br />
          Birlikte yaşa.
          <br />
          Hatıra olarak sakla.
        </h2>
        <p className="cine-cta__support">
          Ücretsiz dijital davetiye, interaktif quiz ve size özel NFC düğün
          hatıralarıyla Memoora deneyimini keşfedin.
        </p>
        <div className="cine-cta__actions">
          <MagneticButton href={demoHref}>Demo Düğünü Gör</MagneticButton>
          <Link href="#nfc-urunler" className="cine-btn cine-btn--ghost">
            NFC Ürünlerini İncele
          </Link>
        </div>
        <p className="cine-cta__note">Dijital davetiye ücretsizdir.</p>
      </div>
    </section>
  );
}
