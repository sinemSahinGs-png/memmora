"use client";

import { useEffect, useRef, type RefObject } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sectionProgress(section: HTMLElement, vh: number) {
  const sectionTop = section.getBoundingClientRect().top;
  const scrollable = Math.max(1, section.offsetHeight - vh);
  return clamp((vh - sectionTop) / scrollable, 0, 1);
}

function mirrorSceneState(progress: number) {
  if (progress < 0.12) {
    return { opacity: 0, translateYSvh: 32, scale: 0.92, interactive: false };
  }
  if (progress < 0.42) {
    const t = smoothstep((progress - 0.12) / 0.3);
    return {
      opacity: t,
      translateYSvh: lerp(32, 0, t),
      scale: lerp(0.92, 1.04, t),
      interactive: t > 0.82,
    };
  }
  return { opacity: 1, translateYSvh: 0, scale: 1.04, interactive: true };
}

function hintOpacity(progress: number) {
  if (progress >= 0.15) return 0;
  return smoothstep(1 - progress / 0.15) * 0.9;
}

function mistOverlayOpacity(progress: number) {
  if (progress <= 0.4) {
    return lerp(0.42, 0.18, smoothstep(progress / 0.4));
  }
  return 0.14;
}

function goldGlowOpacity(progress: number) {
  if (progress < 0.06 || progress > 0.28) return 0;
  if (progress < 0.14) return smoothstep((progress - 0.06) / 0.08);
  return 1 - smoothstep((progress - 0.14) / 0.14);
}

function entryBlendOpacity(progress: number) {
  if (progress >= 0.18) return 0;
  return lerp(1, 0, smoothstep(progress / 0.18));
}

export interface MemoryScrollSceneRefs {
  mirrorRef: RefObject<HTMLDivElement | null>;
  hintRef: RefObject<HTMLDivElement | null>;
  mistRef: RefObject<HTMLDivElement | null>;
  goldGlowRef: RefObject<HTMLDivElement | null>;
  entryBlendRef: RefObject<HTMLDivElement | null>;
}

export function useMemoryScrollScene(
  sectionRef: RefObject<HTMLElement | null>
): MemoryScrollSceneRefs {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const goldGlowRef = useRef<HTMLDivElement>(null);
  const entryBlendRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const applyScene = () => {
      const section = sectionRef.current;
      const mirror = mirrorRef.current;
      if (!section || !mirror) return;

      const vh = window.innerHeight;
      const progress = sectionProgress(section, vh);
      const mirrorState = mirrorSceneState(progress);

      mirror.style.opacity = String(mirrorState.opacity);
      mirror.style.visibility = mirrorState.opacity > 0.02 ? "visible" : "hidden";
      mirror.style.pointerEvents = mirrorState.interactive ? "auto" : "none";
      mirror.style.transform = `translate3d(-50%, calc(-50% + ${mirrorState.translateYSvh}svh), 0) scale(${mirrorState.scale})`;

      const hint = hintRef.current;
      if (hint) {
        const hintOp = hintOpacity(progress);
        hint.style.opacity = String(hintOp);
        hint.style.pointerEvents = hintOp > 0.1 ? "auto" : "none";
      }

      const mist = mistRef.current;
      if (mist) {
        mist.style.opacity = String(mistOverlayOpacity(progress));
      }

      const glow = goldGlowRef.current;
      if (glow) {
        glow.style.opacity = String(goldGlowOpacity(progress));
      }

      const entry = entryBlendRef.current;
      if (entry) {
        entry.style.opacity = String(entryBlendOpacity(progress));
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        applyScene();
      });
    };

    applyScene();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sectionRef]);

  return { mirrorRef, hintRef, mistRef, goldGlowRef, entryBlendRef };
}
