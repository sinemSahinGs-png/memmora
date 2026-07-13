"use client";

import { getLivingTreeChip } from "@/lib/tree-growth";
import { cn } from "@/lib/utils";

interface HeroMetaBarProps {
  leafCount: number;
  quizLeaderName?: string | null;
  className?: string;
}

export function HeroMetaBar({
  leafCount,
  quizLeaderName,
  className,
}: HeroMetaBarProps) {
  const chip = getLivingTreeChip(leafCount);
  const leader = quizLeaderName?.trim();

  return (
    <div className={cn("hero-meta-bar", className)}>
      <span className="hero-meta-chip">
        {chip.stageName} · {chip.leafCount} yaprak
      </span>
      {leader && (
        <span className="hero-meta-chip hero-meta-chip--leader">
          <span className="hero-meta-leader-label">Quiz Lideri</span>
          <span className="hero-meta-leader-name">
            <span className="hero-meta-leader-confetti" aria-hidden>
              <b />
              <b />
              <b />
              <b />
              <b />
              <b />
            </span>
            {leader}
            <span className="hero-meta-leader-sparks" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="hero-meta-leader-shine" aria-hidden />
          </span>
        </span>
      )}
    </div>
  );
}
