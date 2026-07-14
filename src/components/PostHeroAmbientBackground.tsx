"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

type AmbientState = Record<string, string | number>;

const BASE: AmbientState = {
  "--ambient-primary-x": "44%",
  "--ambient-primary-y": "42%",
  "--ambient-primary-scale": 1,
  "--ambient-primary-alpha": 0.24,
  "--ambient-secondary-x": "10%",
  "--ambient-secondary-y": "16%",
  "--ambient-secondary-scale": 1,
  "--ambient-secondary-alpha": 0.14,
  "--ambient-gold-x": "50%",
  "--ambient-gold-y": "55%",
  "--ambient-gold-alpha": 0.025,
  "--ambient-haze-alpha": 0.55,
  "--ambient-mist-offset": "0svh",
  "--ambient-vignette-strength": 0.5,
};

const STATES: { selector: string; vars: AmbientState }[] = [
  {
    selector: "#manifesto",
    vars: {
      ...BASE,
      "--ambient-primary-x": "38%",
      "--ambient-primary-y": "48%",
      "--ambient-primary-alpha": 0.18,
      "--ambient-gold-alpha": 0.015,
      "--ambient-haze-alpha": 0.4,
      "--ambient-vignette-strength": 0.6,
    },
  },
  {
    selector: "#shared-memories",
    vars: {
      ...BASE,
      "--ambient-primary-x": "52%",
      "--ambient-primary-y": "48%",
      "--ambient-primary-scale": 1.06,
      "--ambient-primary-alpha": 0.26,
      "--ambient-secondary-x": "18%",
      "--ambient-secondary-y": "22%",
      "--ambient-secondary-alpha": 0.15,
      "--ambient-gold-x": "48%",
      "--ambient-gold-y": "42%",
      "--ambient-gold-alpha": 0.04,
      "--ambient-haze-alpha": 0.52,
      "--ambient-vignette-strength": 0.58,
    },
  },
  {
    selector: "#davetiye",
    vars: {
      ...BASE,
      "--ambient-primary-x": "70%",
      "--ambient-primary-y": "46%",
      "--ambient-primary-alpha": 0.26,
      "--ambient-secondary-x": "24%",
      "--ambient-gold-x": "72%",
      "--ambient-gold-y": "48%",
      "--ambient-gold-alpha": 0.045,
      "--ambient-haze-alpha": 0.5,
      "--ambient-vignette-strength": 0.46,
    },
  },
  {
    selector: "#davetli",
    vars: {
      ...BASE,
      "--ambient-primary-x": "60%",
      "--ambient-primary-y": "42%",
      "--ambient-primary-scale": 0.94,
      "--ambient-primary-alpha": 0.2,
      "--ambient-secondary-y": "30%",
      "--ambient-secondary-scale": 0.9,
      "--ambient-gold-alpha": 0.03,
      "--ambient-haze-alpha": 0.42,
      "--ambient-vignette-strength": 0.5,
    },
  },
  {
    selector: "#quiz",
    vars: {
      ...BASE,
      "--ambient-primary-x": "44%",
      "--ambient-primary-y": "46%",
      "--ambient-primary-scale": 1.08,
      "--ambient-primary-alpha": 0.3,
      "--ambient-secondary-alpha": 0.18,
      "--ambient-gold-x": "50%",
      "--ambient-gold-y": "40%",
      "--ambient-gold-alpha": 0.085,
      "--ambient-haze-alpha": 0.62,
      "--ambient-vignette-strength": 0.4,
    },
  },
  {
    selector: "#nfc-urunler",
    vars: {
      ...BASE,
      "--ambient-primary-x": "48%",
      "--ambient-primary-y": "40%",
      "--ambient-primary-alpha": 0.22,
      "--ambient-gold-x": "52%",
      "--ambient-gold-y": "36%",
      "--ambient-gold-alpha": 0.075,
      "--ambient-haze-alpha": 0.48,
      "--ambient-vignette-strength": 0.44,
    },
  },
  {
    selector: "#ani-agaci",
    vars: {
      ...BASE,
      "--ambient-primary-x": "46%",
      "--ambient-primary-y": "44%",
      "--ambient-primary-alpha": 0.2,
      "--ambient-gold-alpha": 0.04,
      "--ambient-haze-alpha": 0.46,
      "--ambient-vignette-strength": 0.52,
    },
  },
  {
    selector: "#deneyim-ozet",
    vars: {
      ...BASE,
      "--ambient-primary-x": "48%",
      "--ambient-primary-y": "50%",
      "--ambient-primary-alpha": 0.18,
      "--ambient-gold-alpha": 0.035,
      "--ambient-vignette-strength": 0.54,
    },
  },
  {
    selector: "#demo",
    vars: {
      ...BASE,
      "--ambient-primary-x": "50%",
      "--ambient-primary-y": "48%",
      "--ambient-primary-scale": 1.04,
      "--ambient-primary-alpha": 0.22,
      "--ambient-gold-x": "50%",
      "--ambient-gold-y": "44%",
      "--ambient-gold-alpha": 0.09,
      "--ambient-haze-alpha": 0.5,
      "--ambient-vignette-strength": 0.5,
    },
  },
  {
    selector: "#site-footer",
    vars: {
      ...BASE,
      "--ambient-primary-x": "50%",
      "--ambient-primary-y": "62%",
      "--ambient-primary-scale": 0.9,
      "--ambient-primary-alpha": 0.1,
      "--ambient-secondary-alpha": 0.06,
      "--ambient-gold-alpha": 0.015,
      "--ambient-haze-alpha": 0.22,
      "--ambient-vignette-strength": 0.74,
    },
  },
];

export function PostHeroAmbientBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const tertiaryRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const root = rootRef.current;
      if (!root) return;

      gsap.set(root, BASE);

      if (reduced) {
        gsap.set(root, {
          "--ambient-primary-alpha": 0.2,
          "--ambient-secondary-alpha": 0.12,
          "--ambient-gold-alpha": 0.03,
          "--ambient-haze-alpha": 0.4,
          "--ambient-primary-scale": 1,
          "--ambient-secondary-scale": 1,
        });
        return;
      }

      const mm = gsap.matchMedia();
      const idle = gsap.timeline({ repeat: -1, yoyo: true });

      if (primaryRef.current) {
        idle.to(
          primaryRef.current,
          {
            x: "6vw",
            y: "4.5svh",
            scale: 1.06,
            duration: 32,
            ease: "sine.inOut",
          },
          0,
        );
      }

      if (secondaryRef.current) {
        idle.to(
          secondaryRef.current,
          {
            x: "-4.5vw",
            y: "-3.5svh",
            scale: 0.97,
            duration: 42,
            ease: "sine.inOut",
          },
          0,
        );
      }

      if (mistRef.current) {
        idle.to(
          mistRef.current,
          {
            y: "5.5svh",
            opacity: 0.62,
            duration: 26,
            ease: "sine.inOut",
          },
          0,
        );
      }

      if (hazeRef.current) {
        idle.to(
          hazeRef.current,
          {
            x: "4vw",
            opacity: 0.58,
            scale: 1.03,
            duration: 38,
            ease: "sine.inOut",
          },
          0,
        );
      }

      mm.add("(min-width: 1024px)", () => {
        if (!tertiaryRef.current) return;
        const desktopIdle = gsap.to(tertiaryRef.current, {
          x: "3vw",
          y: "-2.5svh",
          scale: 1.04,
          duration: 44,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        return () => {
          desktopIdle.kill();
        };
      });

      const onVisibility = () => {
        if (document.hidden) idle.pause();
        else idle.resume();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const triggers = STATES.map(({ selector, vars }) => {
        const trigger = document.querySelector(selector);
        if (!trigger) return null;

        return ScrollTrigger.create({
          trigger,
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () =>
            gsap.to(root, { ...vars, duration: 2, ease: "sine.inOut", overwrite: "auto" }),
          onEnterBack: () =>
            gsap.to(root, { ...vars, duration: 1.8, ease: "sine.inOut", overwrite: "auto" }),
        });
      }).filter(Boolean);

      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        idle.kill();
        triggers.forEach((t) => t?.kill());
        mm.revert();
      };
    },
    [reduced],
    rootRef,
  );

  return (
    <div
      ref={rootRef}
      className={`post-hero-ambient${reduced ? " post-hero-ambient--static" : ""}`}
      aria-hidden
    >
      <div className="ambient-base" />
      <div className="ambient-emerald-primary">
        <div ref={primaryRef} className="ambient-blob ambient-blob--primary" />
      </div>
      <div className="ambient-emerald-secondary">
        <div ref={secondaryRef} className="ambient-blob ambient-blob--secondary" />
      </div>
      <div className="ambient-emerald-tertiary">
        <div ref={tertiaryRef} className="ambient-blob ambient-blob--tertiary" />
      </div>
      <div ref={hazeRef} className="ambient-haze" />
      <div ref={mistRef} className="ambient-mist" />
      <div className="ambient-gold" />
      <div className="ambient-grain" />
      <div className="ambient-vignette" />
    </div>
  );
}
