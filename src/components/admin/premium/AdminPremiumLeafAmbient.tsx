"use client";

type LeafDrift =
  | "drift-a"
  | "drift-b"
  | "drift-c"
  | "drift-d"
  | "drift-e"
  | "drift-f"
  | "drift-g"
  | "drift-h";

type LeafTone = "white" | "cream" | "champagne" | "gold";

type LeafLayer = "back" | "mid" | "front";

type LeafConfig = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  drift: LeafDrift;
  opacity: number;
  tone: LeafTone;
};

/** Background — küçük, yavaş, blur, düşük opacity (8) */
const BACK_LEAVES: LeafConfig[] = [
  { id: 1, left: "6%", top: "-4%", size: 16, delay: "0s", duration: "28s", drift: "drift-a", opacity: 0.22, tone: "cream" },
  { id: 2, left: "91%", top: "8%", size: 18, delay: "-5s", duration: "26s", drift: "drift-e", opacity: 0.28, tone: "white" },
  { id: 3, left: "74%", top: "32%", size: 15, delay: "-13s", duration: "30s", drift: "drift-c", opacity: 0.2, tone: "champagne" },
  { id: 4, left: "4%", top: "44%", size: 17, delay: "-9s", duration: "24s", drift: "drift-b", opacity: 0.25, tone: "cream" },
  { id: 5, left: "50%", top: "6%", size: 14, delay: "-17s", duration: "29s", drift: "drift-g", opacity: 0.18, tone: "white" },
  { id: 6, left: "26%", top: "60%", size: 20, delay: "-21s", duration: "27s", drift: "drift-h", opacity: 0.3, tone: "gold" },
  { id: 7, left: "84%", top: "76%", size: 16, delay: "-7s", duration: "22s", drift: "drift-f", opacity: 0.24, tone: "cream" },
  { id: 8, left: "14%", top: "86%", size: 19, delay: "-15s", duration: "25s", drift: "drift-d", opacity: 0.26, tone: "champagne" },
];

/** Mid — orta boy, sway, orta opacity (8) */
const MID_LEAVES: LeafConfig[] = [
  { id: 9, left: "2%", top: "16%", size: 28, delay: "-2s", duration: "20s", drift: "drift-b", opacity: 0.42, tone: "white" },
  { id: 10, left: "86%", top: "24%", size: 32, delay: "-11s", duration: "18s", drift: "drift-a", opacity: 0.48, tone: "cream" },
  { id: 11, left: "36%", top: "20%", size: 26, delay: "-6s", duration: "22s", drift: "drift-c", opacity: 0.38, tone: "champagne" },
  { id: 12, left: "64%", top: "46%", size: 30, delay: "-19s", duration: "19s", drift: "drift-g", opacity: 0.45, tone: "gold" },
  { id: 13, left: "10%", top: "52%", size: 34, delay: "-14s", duration: "21s", drift: "drift-e", opacity: 0.52, tone: "white" },
  { id: 14, left: "76%", top: "62%", size: 27, delay: "-8s", duration: "23s", drift: "drift-d", opacity: 0.4, tone: "cream" },
  { id: 15, left: "44%", top: "70%", size: 29, delay: "-23s", duration: "17s", drift: "drift-h", opacity: 0.44, tone: "champagne" },
  { id: 16, left: "20%", top: "36%", size: 36, delay: "-4s", duration: "16s", drift: "drift-f", opacity: 0.55, tone: "gold" },
];

/** Foreground — büyük, net, parlak (8) */
const FRONT_LEAVES: LeafConfig[] = [
  { id: 17, left: "-2%", top: "22%", size: 44, delay: "-3s", duration: "14s", drift: "drift-a", opacity: 0.68, tone: "white" },
  { id: 18, left: "88%", top: "12%", size: 52, delay: "-10s", duration: "15s", drift: "drift-b", opacity: 0.75, tone: "cream" },
  { id: 19, left: "32%", top: "2%", size: 48, delay: "-18s", duration: "16s", drift: "drift-c", opacity: 0.62, tone: "champagne" },
  { id: 20, left: "66%", top: "40%", size: 42, delay: "-7s", duration: "13s", drift: "drift-e", opacity: 0.7, tone: "white" },
  { id: 21, left: "6%", top: "68%", size: 56, delay: "-12s", duration: "15s", drift: "drift-g", opacity: 0.82, tone: "gold" },
  { id: 22, left: "52%", top: "54%", size: 40, delay: "-20s", duration: "14s", drift: "drift-d", opacity: 0.65, tone: "cream" },
  { id: 23, left: "80%", top: "78%", size: 46, delay: "-1s", duration: "12s", drift: "drift-h", opacity: 0.72, tone: "champagne" },
  { id: 24, left: "38%", top: "84%", size: 38, delay: "-16s", duration: "13s", drift: "drift-f", opacity: 0.58, tone: "white" },
];

function LeafLayer({
  leaves,
  layer,
}: {
  leaves: LeafConfig[];
  layer: LeafLayer;
}) {
  return (
    <div
      className={`admin-premium-leaf-ambient admin-premium-leaf-ambient--${layer}`}
      aria-hidden
    >
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className={`admin-premium-leaf admin-premium-leaf--${leaf.drift} admin-premium-leaf--tone-${leaf.tone}`}
          style={{
            left: leaf.left,
            top: leaf.top,
            width: leaf.size,
            height: leaf.size * 1.26,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            ["--leaf-opacity" as string]: String(leaf.opacity),
          }}
        />
      ))}
    </div>
  );
}

export function AdminPremiumLeafAmbient() {
  return (
    <>
      <LeafLayer leaves={BACK_LEAVES} layer="back" />
      <LeafLayer leaves={MID_LEAVES} layer="mid" />
      <LeafLayer leaves={FRONT_LEAVES} layer="front" />
    </>
  );
}
