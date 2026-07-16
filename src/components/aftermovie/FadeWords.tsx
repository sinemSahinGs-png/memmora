"use client";

import { useEffect, useMemo, useState } from "react";

interface FadeWordsProps {
  text: string;
  className?: string;
  /** Delay before the first word appears (ms) */
  startDelayMs?: number;
  /** Stagger between words (ms) */
  stepMs?: number;
  /** When true, slows word stagger on mobile viewports */
  slowOnMobile?: boolean;
  as?: "p" | "h1" | "h2" | "span" | "div";
  onComplete?: () => void;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Total ms until the last word animation has finished settling. */
export function fadeWordsDurationMs(
  text: string,
  startDelayMs: number,
  stepMs: number,
  holdAfterMs = 1600,
): number {
  const n = Math.max(1, countWords(text));
  return startDelayMs + (n - 1) * stepMs + 900 + holdAfterMs;
}

/** Reveal copy one word at a time with a soft fade/rise. */
export function FadeWords({
  text,
  className,
  startDelayMs = 120,
  stepMs = 160,
  slowOnMobile = false,
  as: Tag = "p",
  onComplete,
}: FadeWordsProps) {
  const words = useMemo(
    () => text.split(/(\s+)/).filter((part) => part.length > 0),
    [text],
  );
  const [ready, setReady] = useState(false);
  const [start, setStart] = useState(startDelayMs);
  const [step, setStep] = useState(stepMs);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;

    if (slowOnMobile && mobile) {
      setStart(Math.round(startDelayMs * 1.35));
      setStep(Math.round(stepMs * 1.75));
    } else {
      setStart(startDelayMs);
      setStep(stepMs);
    }

    if (reduce) {
      setReady(true);
      onComplete?.();
      return;
    }
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, [onComplete, slowOnMobile, startDelayMs, stepMs]);

  useEffect(() => {
    if (!ready || !onComplete) return;
    const mobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    const s = slowOnMobile && mobile ? Math.round(startDelayMs * 1.35) : start;
    const st = slowOnMobile && mobile ? Math.round(stepMs * 1.75) : step;
    const total = fadeWordsDurationMs(text, s, st, 0);
    const t = window.setTimeout(() => onComplete(), total);
    return () => window.clearTimeout(t);
  }, [ready, onComplete, text, start, step, slowOnMobile, startDelayMs, stepMs]);

  let wordIndex = 0;

  return (
    <Tag className={className}>
      {words.map((part, i) => {
        const isSpace = /^\s+$/.test(part);
        if (isSpace) {
          return <span key={`s-${i}`}>{part}</span>;
        }
        const index = wordIndex;
        wordIndex += 1;
        const delay = start + index * step;
        return (
          <span
            key={`w-${i}`}
            className="fade-word"
            style={ready ? { animationDelay: `${delay}ms` } : { opacity: 0 }}
          >
            {part}
          </span>
        );
      })}
    </Tag>
  );
}
