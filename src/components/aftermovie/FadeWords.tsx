"use client";

import { useEffect, useMemo, useState } from "react";

interface FadeWordsProps {
  text: string;
  className?: string;
  /** Delay before the first word appears (ms) */
  startDelayMs?: number;
  /** Stagger between words (ms) */
  stepMs?: number;
  as?: "p" | "h1" | "h2" | "span" | "div";
}

/** Reveal copy one word at a time with a soft fade/rise. */
export function FadeWords({
  text,
  className,
  startDelayMs = 120,
  stepMs = 160,
  as: Tag = "p",
}: FadeWordsProps) {
  const words = useMemo(
    () => text.split(/(\s+)/).filter((part) => part.length > 0),
    [text],
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReady(true);
      return;
    }
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, []);

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
        const delay = startDelayMs + index * stepMs;
        return (
          <span
            key={`w-${i}`}
            className="fade-word"
            style={
              ready
                ? { animationDelay: `${delay}ms` }
                : { opacity: 0 }
            }
          >
            {part}
          </span>
        );
      })}
    </Tag>
  );
}
