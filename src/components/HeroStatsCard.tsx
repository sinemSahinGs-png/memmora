"use client";

import { motion } from "framer-motion";
import { getTreeGrowthStage } from "@/lib/tree-growth";

interface HeroStatsCardProps {
  leafCount: number;
}

export function HeroStatsCard({ leafCount }: HeroStatsCardProps) {
  const growth = getTreeGrowthStage(leafCount);

  return (
    <div className="rounded-xl border border-white/[0.22] bg-[rgba(15,30,24,0.35)] px-3 py-2.5 backdrop-blur-md">
      <div className="grid grid-cols-3 gap-2">
        <CompactStat label="Yaprak" value={leafCount} accent />
        <CompactStat label="Evre" value={growth.stageName} />
        <CompactStat label="Gelişim" value={`%${growth.progressPercentage}`} />
      </div>

      <div className="mt-2 h-px overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#9AA89B]/40 via-[#D4AF37]/70 to-[#D4AF37]/50"
          initial={false}
          animate={{ width: `${growth.progressPercentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function CompactStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[8px] uppercase tracking-[0.16em] text-[#9AA89B]">{label}</p>
      <p
        className={
          accent
            ? "mt-0.5 font-sans text-lg font-medium leading-none tracking-tight text-[#D4AF37]/90"
            : "mt-0.5 font-sans text-sm font-medium leading-tight text-[#F4F1E8]/88"
        }
      >
        {value}
      </p>
    </div>
  );
}
