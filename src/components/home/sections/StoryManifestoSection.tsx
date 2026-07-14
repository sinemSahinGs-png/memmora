"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { FloatingMemoryBubble } from "@/components/FloatingMemoryBubble";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MOCK_BUBBLE_MEMORIES } from "@/lib/mock-data";

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHT = new Set(["anılar", "dokunuşta", "büyür"]);

export function StoryManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const fogRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const bubbleMemories = useMemo(
    () => MOCK_BUBBLE_MEMORIES.map((m) => ({ ...m })),
    [],
  );

  useGsapContext(
    () => {
      const section = sectionRef.current;
      const text = textRef.current;
      if (!section || !text) return;

      if (reduced) {
        gsap.set(text, { opacity: 1, clearProps: "filter" });
        text.querySelectorAll(".word, span").forEach((node) => {
          const el = node as HTMLElement;
          const clean = el.textContent?.replace(/[.,]/g, "").toLowerCase() ?? "";
          el.style.opacity = "1";
          el.style.color = HIGHLIGHT.has(clean)
            ? "#D8BD61"
            : "rgba(245, 241, 232, 0.94)";
        });
        return;
      }

      const split = new SplitType(text, { types: "words", tagName: "span" });
      const words = split.words ?? [];

      words.forEach((word) => {
        const clean = word.textContent?.replace(/[.,]/g, "").toLowerCase() ?? "";
        if (HIGHLIGHT.has(clean)) word.classList.add("is-gold");
      });

      gsap.set(words, {
        opacity: 0.55,
        color: (i, el) =>
          (el as HTMLElement).classList.contains("is-gold")
            ? "rgba(216, 189, 97, 0.55)"
            : "rgba(245, 241, 232, 0.30)",
      });
      if (fogRef.current) {
        gsap.set(fogRef.current, { yPercent: 4, opacity: 0.35 });
      }

      const illuminate = {
        opacity: 1,
        color: (_i: number, el: Element) =>
          (el as HTMLElement).classList.contains("is-gold")
            ? "#D8BD61"
            : "rgba(245, 241, 232, 0.94)",
        stagger: 0.06,
        ease: "none" as const,
      };

      const finalize = () => {
        gsap.set(words, {
          opacity: 1,
          color: (_i: number, el: Element) =>
            (el as HTMLElement).classList.contains("is-gold")
              ? "#D8BD61"
              : "rgba(245, 241, 232, 0.94)",
          clearProps: "filter,transform",
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=90%",
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            onLeave: finalize,
          },
        });

        tl.to(words, illuminate);
        if (fogRef.current) {
          tl.to(
            fogRef.current,
            { yPercent: -8, opacity: 0.5, ease: "none" },
            0,
          );
        }
      });

      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
        gsap.to(words, {
          ...illuminate,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 40%",
            scrub: 0.55,
            onLeave: finalize,
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.to(words, {
          ...illuminate,
          stagger: 0.05,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "bottom 35%",
            scrub: 0.45,
            onLeave: finalize,
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
      id="manifesto"
      className="cine-manifesto"
      aria-label="Memoora manifesto"
    >
      <div className="cine-manifesto__pin">
        <div ref={fogRef} className="cine-manifesto__fog" aria-hidden />
        <div className="cine-manifesto__bubbles" aria-hidden>
          <FloatingMemoryBubble
            memories={bubbleMemories}
            riseMs={4000}
            popMs={650}
            idleMinMs={1800}
            idleMaxMs={3000}
            laneStartDelays={[300, 1700, 3400]}
            maxConcurrent={2}
            className="floating-memory-bubble--manifesto"
          />
        </div>
        <p className="cine-eyebrow cine-manifesto__label">Bir Anıdan Fazlası</p>
        <div ref={textRef} className="cine-manifesto__text">
          <span className="cine-manifesto__block">
            Bazı anılar
            <br />
            bir gün yaşanır.
          </span>
          <span className="cine-manifesto__block">
            Bazılarıysa
            <br />
            her dokunuşta
            <br />
            yeniden büyür.
          </span>
        </div>
      </div>
    </section>
  );
}
