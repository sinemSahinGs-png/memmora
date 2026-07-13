"use client";

import { useMemo } from "react";
import { CoupleHeroSection } from "./CoupleHeroSection";
import type { Couple } from "@/lib/types";
import { MOCK_BUBBLE_MEMORIES } from "@/lib/mock-data";
import { shuffleArray } from "@/lib/memory-utils";

interface HeroLandingProps {
  couple: Couple;
}

export function HeroLanding({ couple }: HeroLandingProps) {
  const bubbleMemories = useMemo(() => shuffleArray([...MOCK_BUBBLE_MEMORIES]), []);

  return (
    <CoupleHeroSection couple={couple} bubbleMemories={bubbleMemories} />
  );
}
