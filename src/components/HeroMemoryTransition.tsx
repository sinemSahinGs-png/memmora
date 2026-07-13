import type { CSSProperties } from "react";

const LEAVES = [
  { left: "12%", delay: "0s", duration: "14s", drift: "-18px" },
  { left: "28%", delay: "2.4s", duration: "16s", drift: "14px" },
  { left: "52%", delay: "1.1s", duration: "15s", drift: "-10px" },
  { left: "71%", delay: "3.8s", duration: "17s", drift: "16px" },
  { left: "88%", delay: "0.6s", duration: "13s", drift: "-12px" },
] as const;

export function HeroMemoryTransition() {
  return (
    <div className="hero-memory-transition" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="hero-memory-leaf"
          style={
            {
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              "--leaf-drift": leaf.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
