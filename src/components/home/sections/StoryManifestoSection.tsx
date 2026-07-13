"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHT = new Set(["anılar", "dokunuşta", "büyür"]);

export function StoryManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      const text = textRef.current;
      if (!section || !text) return;

      if (reduced) {
        gsap.set(text, { opacity: 1 });
        return;
      }

      const split = new SplitType(text, { types: "words", tagName: "span" });
      const words = split.words ?? [];

      words.forEach((word) => {
        const clean = word.textContent?.replace(/[.,]/g, "").toLowerCase() ?? "";
        if (HIGHLIGHT.has(clean)) word.classList.add("is-gold");
      });

      gsap.set(words, { opacity: 0.18, color: "var(--memoora-muted-ivory)" });
      if (fogRef.current) {
        gsap.set(fogRef.current, { yPercent: 8, opacity: 0.35 });
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            pin: text.parentElement,
            anticipatePin: 1,
          },
        });

        tl.to(words, {
          opacity: 1,
          color: (i, el) =>
            (el as HTMLElement).classList.contains("is-gold")
              ? "var(--memoora-soft-gold)"
              : "var(--memoora-ivory)",
          stagger: 0.08,
          ease: "none",
        });

        if (fogRef.current) {
          tl.to(
            fogRef.current,
            { yPercent: -12, opacity: 0.55, ease: "none" },
            0,
          );
        }

        tl.to(
          text,
          { letterSpacing: "0.01em", ease: "none" },
          0,
        );
      });

      mm.add("(max-width: 767px)", () => {
        gsap.to(words, {
          opacity: 1,
          color: (i, el) =>
            (el as HTMLElement).classList.contains("is-gold")
              ? "var(--memoora-soft-gold)"
              : "var(--memoora-ivory)",
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 35%",
            scrub: 0.8,
          },
        });
      });

      return () => {
        split.revert();
        mm.revert();
      };
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="deneyim"
      className="cine-manifesto"
      aria-label="Memoora manifesto"
    >
      <div className="cine-manifesto__pin">
        <div ref={fogRef} className="cine-manifesto__fog" aria-hidden />
        <p ref={textRef} className="cine-manifesto__text">
          Bazı anılar bir gün yaşanır. Bazılarıysa her dokunuşta yeniden büyür.
        </p>
      </div>
    </section>
  );
}
