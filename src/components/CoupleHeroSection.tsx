"use client";

import { HeroVideoBackground } from "./HeroVideoBackground";
import { HeroLandingHeader } from "./HeroLandingHeader";
import { HeroMetaBar } from "./HeroMetaBar";
import { HeroActionBar } from "./HeroActionBar";
import { FloatingMemoryBubble, type BubbleMemory } from "./FloatingMemoryBubble";
import type { Couple } from "@/lib/types";
import { getCoupleHeroLines } from "@/lib/couple-utils";

interface CoupleHeroSectionProps {
  couple: Couple;
  leafCount?: number;
  showLeafPulse?: boolean;
  onMemoryClick?: () => void;
  quizLeaderName?: string | null;
  bubbleMemories?: BubbleMemory[];
}

export function CoupleHeroSection({
  couple,
  leafCount = 0,
  showLeafPulse = false,
  onMemoryClick,
  quizLeaderName = null,
  bubbleMemories = [],
}: CoupleHeroSectionProps) {
  const heroLines = getCoupleHeroLines(couple);

  return (
    <section className="hero-section hero-section--landing">
      <HeroVideoBackground
        showLeafPulse={showLeafPulse}
        videoSrc={couple.heroVideoUrl}
      />

      <div className="hero-warm-sunlight" aria-hidden />
      <div className="hero-garden-bridge" aria-hidden />

      {bubbleMemories.length > 0 && (
        <FloatingMemoryBubble memories={bubbleMemories} />
      )}

      <div className="hero-shell hero-shell--landing">
        <HeroLandingHeader coupleSlug={couple.slug} />

        <HeroMetaBar
          leafCount={leafCount}
          quizLeaderName={couple.quizEnabled ? quizLeaderName : null}
        />

        <div className="hero-center">
          <div className="hero-title-block">
            <h1 className="couple-hero-title">
              {heroLines.map((line, i) => {
                if (line === "&") {
                  return (
                    <span key="amp" className="couple-hero-amp">
                      &
                    </span>
                  );
                }
                const nameIndex = heroLines
                  .slice(0, i)
                  .filter((entry) => entry !== "&").length;
                return (
                  <span
                    key={`${line}-${i}`}
                    className={
                      nameIndex === 0
                        ? "couple-hero-name couple-hero-name--first"
                        : "couple-hero-name couple-hero-name--second"
                    }
                  >
                    {line}
                  </span>
                );
              })}
            </h1>
          </div>

          <div className="hero-subtitle-row">
            <span className="hero-subtitle-line" aria-hidden />
            <p className="hero-subtitle-text">{couple.heroSubtitle}</p>
          </div>
        </div>

        <HeroActionBar
          coupleSlug={couple.slug}
          quizEnabled={couple.quizEnabled}
          onMemoryClick={onMemoryClick}
        />
      </div>
    </section>
  );
}
