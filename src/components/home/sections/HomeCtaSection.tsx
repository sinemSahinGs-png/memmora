"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "@/components/animation/MagneticButton";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

      const lines = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-cta__line"),
      );
      const support = section.querySelector(".cine-cta__support");
      const actions = section.querySelector(".cine-cta__actions");
      const bloom = section.querySelector(".cine-cta__bloom");

      gsap.set(lines, { opacity: 0.35, y: 22 });
      gsap.set([support, actions], { opacity: 0.55, y: 12 });
      if (bloom) gsap.set(bloom, { opacity: 0.18, scale: 0.94 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "top 34%",
            scrub: 0.45,
          },
        })
        .to(lines, {
          opacity: 1,
          y: 0,
          stagger: 0.14,
          ease: "none",
        })
        .to(bloom, { opacity: 0.38, scale: 1, ease: "none" }, 0.1)
        .to(support, { opacity: 1, y: 0, ease: "none" }, 0.28)
        .to(actions, { opacity: 1, y: 0, ease: "none" }, 0.4);
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
        <h2 id="cta-heading" className="cine-cta__heading">
          <span className="cine-cta__line">Bir gece için değil.</span>
          <span className="cine-cta__line">Hatırlamak için.</span>
        </h2>
        <p className="cine-cta__support">
          Düğününüzün hikâyesini Memoora ile yaşamaya devam ettirin.
        </p>
        <div className="cine-cta__actions">
          <MagneticButton href="/satinal">
            Düğünümüzü Oluşturalım
          </MagneticButton>
        </div>
        <Link href={demoHref} className="cine-cta__demo-link">
          Demo düğünü gör
        </Link>
      </div>
    </section>
  );
}
