"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  type?: "words" | "lines";
  scrub?: boolean | number;
  start?: string;
  end?: string;
  stagger?: number;
  y?: number;
  id?: string;
}

export function SplitTextReveal({
  children,
  className = "",
  as: Tag = "div",
  type = "words",
  scrub = false,
  start = "top 80%",
  end = "top 35%",
  stagger = 0.06,
  y = 36,
  id,
}: SplitTextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const split = new SplitType(el, {
        types: type === "lines" ? "lines" : "words",
        tagName: "span",
      });

      const targets = type === "lines" ? split.lines : split.words;
      if (!targets?.length) return;

      gsap.set(targets, {
        opacity: 0,
        y,
        filter: "blur(8px)",
      });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: scrub ? 1 : 1.05,
        stagger,
        ease: "power3.out",
        scrollTrigger: scrub
          ? {
              trigger: el,
              start,
              end,
              scrub: typeof scrub === "number" ? scrub : 0.85,
            }
          : {
              trigger: el,
              start,
              toggleActions: "play none none none",
            },
      });

      return () => split.revert();
    },
    [reduced, type, scrub, start, end, stagger, y],
    ref,
  );

  return (
    <Tag ref={ref as never} className={className} id={id}>
      {children}
    </Tag>
  );
}
