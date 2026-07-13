"use client";

import { HeroVideoBackground } from "./HeroVideoBackground";
import type { ReactNode } from "react";

interface HeroTreeSceneProps {
  showLeafPulse?: boolean;
  className?: string;
  children?: ReactNode;
}

export function HeroTreeScene({
  showLeafPulse = false,
  className = "",
  children,
}: HeroTreeSceneProps) {
  return (
    <section
      className={`relative min-h-[100svh] w-full overflow-hidden bg-[#050505] ${className}`}
    >
      <HeroVideoBackground showLeafPulse={showLeafPulse} />

      {children && (
        <div className="relative z-10 flex h-full min-h-[100svh] flex-col">
          {children}
        </div>
      )}
    </section>
  );
}
