"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ASSETS } from "@/lib/assets";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

export function MemoryOrbsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const orbs = gsap.utils.toArray<HTMLElement>(".cine-orbs__bubble");

      gsap.set(orbs, { opacity: 0, y: 30, scale: 0.92 });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 20%",
            scrub: 0.85,
          },
        });

        tl.to(orbs, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.12,
          ease: "none",
        });

        orbs.forEach((orb, i) => {
          const depth = (i % 3) + 1;
          gsap.to(orb, {
            y: `${-12 * depth}px`,
            x: `${(i % 2 === 0 ? 1 : -1) * 10 * depth}px`,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.to(orbs, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 30%",
            scrub: 0.7,
          },
        });
      });

      return () => mm.revert();
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      className="cine-orbs"
      aria-labelledby="orbs-heading"
    >
      <div className="cine-orbs__field" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`cine-orbs__bubble cine-orbs__bubble--${i}`}
          >
            <Image
              src={i % 2 === 0 ? ASSETS.galleryBg : ASSETS.landingCardMemories}
              alt=""
              fill
              sizes="180px"
              className="cine-orbs__bubble-img"
            />
          </div>
        ))}
      </div>

      <div className="cine-orbs__content">
        <p className="cine-eyebrow">Anı Küreleri</p>
        <SplitTextReveal
          as="h2"
          id="orbs-heading"
          className="cine-heading cine-heading--light"
        >
          Fotoğraf ve videolar ışığa dönüşür
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body cine-body--muted">
            Her yükleme, ağacın etrafında süzülen bir bellek küresi olur.
            Mesajlar ise düğünden bir yıl sonra açılmak üzere zamana
            emanet edilir.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
