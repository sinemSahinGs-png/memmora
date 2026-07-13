import type { CSSProperties } from "react";

type LeafVariant = "gold" | "sage" | "amber";

const LEAVES = [
  { left: "4%", delay: "0s", duration: "32s", drift: "-32px", scale: 1.35, tilt: "-14deg", variant: "gold" as const, flip: false },
  { left: "14%", delay: "3.8s", duration: "36s", drift: "26px", scale: 1.55, tilt: "8deg", variant: "amber" as const, flip: true },
  { left: "26%", delay: "1.4s", duration: "34s", drift: "-22px", scale: 1.42, tilt: "-6deg", variant: "sage" as const, flip: false },
  { left: "38%", delay: "5.6s", duration: "38s", drift: "30px", scale: 1.62, tilt: "12deg", variant: "gold" as const, flip: true },
  { left: "50%", delay: "2.2s", duration: "33s", drift: "-28px", scale: 1.38, tilt: "-18deg", variant: "amber" as const, flip: false },
  { left: "62%", delay: "7.8s", duration: "37s", drift: "20px", scale: 1.48, tilt: "6deg", variant: "sage" as const, flip: true },
  { left: "74%", delay: "3s", duration: "35s", drift: "-18px", scale: 1.32, tilt: "-10deg", variant: "gold" as const, flip: false },
  { left: "86%", delay: "9.2s", duration: "40s", drift: "24px", scale: 1.28, tilt: "16deg", variant: "amber" as const, flip: true },
  { left: "20%", delay: "11s", duration: "39s", drift: "14px", scale: 1.52, tilt: "-4deg", variant: "gold" as const, flip: true },
  { left: "68%", delay: "4.8s", duration: "34s", drift: "-26px", scale: 1.45, tilt: "10deg", variant: "sage" as const, flip: false },
  { left: "44%", delay: "13.5s", duration: "41s", drift: "-12px", scale: 1.22, tilt: "-20deg", variant: "amber" as const, flip: false },
  { left: "92%", delay: "6.4s", duration: "36s", drift: "16px", scale: 1.18, tilt: "14deg", variant: "sage" as const, flip: true },
] as const;

const LEAF_PALETTE: Record<
  LeafVariant,
  { light: string; mid: string; deep: string; vein: string; edge: string }
> = {
  gold: {
    light: "#fff4d0",
    mid: "#d4af37",
    deep: "#8a9a62",
    vein: "rgba(92, 68, 22, 0.42)",
    edge: "rgba(255, 236, 180, 0.42)",
  },
  amber: {
    light: "#ffe8b8",
    mid: "#c9983a",
    deep: "#7a8a58",
    vein: "rgba(88, 58, 18, 0.4)",
    edge: "rgba(255, 220, 150, 0.38)",
  },
  sage: {
    light: "#eef4dc",
    mid: "#b8c48a",
    deep: "#6a8260",
    vein: "rgba(58, 72, 48, 0.38)",
    edge: "rgba(210, 228, 180, 0.34)",
  },
};

function QuizFloatingLeafSvg({
  id,
  variant,
  flip,
}: {
  id: number;
  variant: LeafVariant;
  flip: boolean;
}) {
  const palette = LEAF_PALETTE[variant];
  const gradId = `quiz-leaf-fill-${id}`;
  const sheenId = `quiz-leaf-sheen-${id}`;

  return (
    <svg
      viewBox="0 0 36 54"
      fill="none"
      aria-hidden
      className={`memory-quiz-leaf-svg${flip ? " memory-quiz-leaf-svg--flip" : ""}`}
    >
      <defs>
        <linearGradient id={gradId} x1="20%" y1="0%" x2="82%" y2="92%">
          <stop offset="0%" stopColor={palette.light} stopOpacity="0.98" />
          <stop offset="42%" stopColor={palette.mid} stopOpacity="0.88" />
          <stop offset="100%" stopColor={palette.deep} stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M18 49.5V53.2"
        stroke={palette.vein}
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M18 49.5C17.2 48.8 16.4 47.8 16.1 46.6"
        stroke={palette.vein}
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M18 49.5C18.8 48.8 19.6 47.8 19.9 46.6"
        stroke={palette.vein}
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.65"
      />

      <path
        d="M18 2.8
          C11.2 9.2 7.4 16.8 7.8 25.2
          C8.1 32.4 10.8 38.8 14.6 42.8
          C16.2 44.6 17.4 45.8 18 46.4
          C18.6 45.8 19.8 44.6 21.4 42.8
          C25.2 38.8 27.9 32.4 28.2 25.2
          C28.6 16.8 24.8 9.2 18 2.8Z"
        fill={`url(#${gradId})`}
        stroke={palette.edge}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />

      <path
        d="M18 2.8
          C11.2 9.2 7.4 16.8 7.8 25.2
          C8.1 32.4 10.8 38.8 14.6 42.8
          C16.2 44.6 17.4 45.8 18 46.4
          C18.6 45.8 19.8 44.6 21.4 42.8
          C25.2 38.8 27.9 32.4 28.2 25.2
          C28.6 16.8 24.8 9.2 18 2.8Z"
        fill={`url(#${sheenId})`}
      />

      <path
        d="M18 6.5V45.5"
        stroke={palette.vein}
        strokeWidth="0.85"
        strokeLinecap="round"
      />

      <path
        d="M18 12.5C13.8 14.2 11 17.2 9.6 20.8"
        stroke={palette.vein}
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.82"
      />
      <path
        d="M18 12.5C22.2 14.2 25 17.2 26.4 20.8"
        stroke={palette.vein}
        strokeWidth="0.55"
        strokeLinecap="round"
        opacity="0.82"
      />
      <path
        d="M18 19.5C13.4 21.4 10.2 24.6 8.8 28.8"
        stroke={palette.vein}
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M18 19.5C22.6 21.4 25.8 24.6 27.2 28.8"
        stroke={palette.vein}
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M18 27C14.6 28.8 12.2 31.4 11 34.6"
        stroke={palette.vein}
        strokeWidth="0.48"
        strokeLinecap="round"
        opacity="0.62"
      />
      <path
        d="M18 27C21.4 28.8 23.8 31.4 25 34.6"
        stroke={palette.vein}
        strokeWidth="0.48"
        strokeLinecap="round"
        opacity="0.62"
      />
      <path
        d="M18 34.5C16 36 14.6 37.8 14 39.8"
        stroke={palette.vein}
        strokeWidth="0.42"
        strokeLinecap="round"
        opacity="0.52"
      />
      <path
        d="M18 34.5C20 36 21.4 37.8 22 39.8"
        stroke={palette.vein}
        strokeWidth="0.42"
        strokeLinecap="round"
        opacity="0.52"
      />
    </svg>
  );
}

export function QuizLeaderboardLeaves() {
  return (
    <div className="memory-quiz-leaves" aria-hidden>
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="memory-quiz-leaf"
          style={
            {
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              "--leaf-drift": leaf.drift,
              "--leaf-scale": leaf.scale,
              "--leaf-tilt": leaf.tilt,
            } as CSSProperties
          }
        >
          <QuizFloatingLeafSvg id={i} variant={leaf.variant} flip={leaf.flip} />
        </span>
      ))}
    </div>
  );
}
