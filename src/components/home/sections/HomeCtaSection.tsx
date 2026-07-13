"use client";

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
      const btn = section.querySelector(".cine-cta__action");
      const bloom = section.querySelector(".cine-cta__bloom");
      const leaf = section.querySelector(".cine-cta__leaf");

      if (!(heading instanceof HTMLElement)) return;

      const split = new SplitType(heading, { types: "words", tagName: "span" });
      const words = split.words ?? [];

      gsap.set(words, { opacity: 0, y: 28, filter: "blur(8px)" });
      gsap.set([support, btn], { opacity: 0, y: 18 });
      if (bloom) gsap.set(bloom, { opacity: 0, scale: 0.8 });
      if (leaf) gsap.set(leaf, { opacity: 0, y: -20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 65%",
          end: "top 20%",
          scrub: 0.75,
        },
      });

      tl.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.08,
        ease: "none",
      });
      if (bloom) tl.to(bloom, { opacity: 0.55, scale: 1, ease: "none" }, 0.2);
      tl.to(support, { opacity: 1, y: 0, ease: "none" }, 0.45);
      tl.to(btn, { opacity: 1, y: 0, ease: "none" }, 0.65);
      if (leaf) {
        tl.to(leaf, { opacity: 0.45, y: 40, ease: "none" }, 0.3);
      }

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
      <span className="cine-cta__leaf" aria-hidden />

      <div className="cine-cta__inner">
        <h2 id="cta-heading" className="cine-cta__heading">
          Bir gece biter. Yaşayan anılar kalır.
        </h2>
        <p className="cine-cta__support">
          Düğününüz için size özel Memoora dünyasını oluşturun.
        </p>
        <div className="cine-cta__action">
          <MagneticButton href={demoHref}>Memoora&apos;yı Keşfet</MagneticButton>
        </div>
      </div>
    </section>
  );
}
