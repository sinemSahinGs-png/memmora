"use client";

import { useState, useCallback, useEffect } from "react";
import { CoupleHeroSection } from "./CoupleHeroSection";
import { MobileAppShell } from "./MobileAppShell";
import { HeroBonusSection } from "./HeroBonusSection";
import { HeroMemoryTransition } from "./HeroMemoryTransition";
import { MemoryMirrorSection } from "./memory-mirror/MemoryMirrorSection";
import { CoupleMemoriesGallerySection } from "./couple-gallery/CoupleMemoriesGallerySection";
import { MemoryQuizLeaderboardSection } from "./memory-mirror/MemoryQuizLeaderboardSection";
import { scrollToMemoryForm } from "@/lib/memory-scroll";
import { Toast } from "./Toast";
import { TreeGrowthChip } from "./TreeGrowthChip";
import type { Couple } from "@/lib/types";
import { formatDisplayDate, MOCK_BUBBLE_MEMORIES } from "@/lib/mock-data";
import { shuffleArray } from "@/lib/memory-utils";
import type { BubbleMemory } from "./FloatingMemoryBubble";
import { fetchLeafCount } from "@/lib/supabase/couples";
import { fetchQuizLeader } from "@/lib/supabase/quiz";
import { fetchRecentContributions } from "@/lib/supabase/contributions";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";

interface CoupleMemoryWorldProps {
  couple: Couple;
  initialLeafCount: number;
  acceptsMemories?: boolean;
}

export function CoupleMemoryWorld({
  couple: initialCouple,
  initialLeafCount,
  acceptsMemories = true,
}: CoupleMemoryWorldProps) {
  const [couple, setCouple] = useState(initialCouple);
  const [leafCount, setLeafCount] = useState(initialLeafCount);
  const [showLeafPulse, setShowLeafPulse] = useState(false);
  const [memoriesRefreshKey, setMemoriesRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [quizLeaderName, setQuizLeaderName] = useState<string | null>(null);
  const [bubblePool, setBubblePool] = useState<BubbleMemory[]>([]);

  const displayTitle = getCoupleDisplayTitle(couple);

  useEffect(() => {
    setCouple(initialCouple);
  }, [initialCouple]);

  const loadQuizLeader = useCallback(async () => {
    if (!couple.quizEnabled) {
      setQuizLeaderName(null);
      return;
    }
    if (!isSupabaseConfigured()) {
      setQuizLeaderName(couple.quizWinnerName);
      return;
    }
    try {
      const leader = await fetchQuizLeader(couple.id);
      if (leader) {
        setQuizLeaderName(leader.participantName);
      } else {
        setQuizLeaderName(couple.quizWinnerName);
      }
    } catch {
      setQuizLeaderName(couple.quizWinnerName);
    }
  }, [couple.id, couple.quizEnabled, couple.quizWinnerName]);

  const loadMemories = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setBubblePool(shuffleArray([...MOCK_BUBBLE_MEMORIES]));
      return;
    }
    try {
      const data = await fetchRecentContributions(couple.id, 30);
      const fromDb: BubbleMemory[] = data.map((m) => ({
        id: m.id,
        guest_name: m.guest_name,
        message: m.message,
      }));

      if (fromDb.length === 0) {
        setBubblePool(shuffleArray([...MOCK_BUBBLE_MEMORIES]));
        return;
      }

      setBubblePool(shuffleArray(fromDb));
    } catch {
      setBubblePool(shuffleArray([...MOCK_BUBBLE_MEMORIES]));
    }
  }, [couple.id, memoriesRefreshKey]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchLeafCount(couple.id)
      .then(setLeafCount)
      .catch(() => {});
  }, [couple.id]);

  useEffect(() => {
    loadQuizLeader();
  }, [loadQuizLeader]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleContributionSuccess = useCallback(async () => {
    setLeafCount((c) => c + 1);
    setShowLeafPulse(true);
    setMemoriesRefreshKey((k) => k + 1);
    setToast("Yaprağın ağaca eklendi.");
    setTimeout(() => setShowLeafPulse(false), 2500);

    if (isSupabaseConfigured()) {
      try {
        const count = await fetchLeafCount(couple.id);
        setLeafCount(count);
      } catch {
        /* keep optimistic count */
      }
    }
  }, [couple.id]);

  return (
    <MobileAppShell fullWidth>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <main className="page-main">
        {!acceptsMemories ? (
          <div className="couple-passive-banner" role="status">
            Bu Memoora sayfası şu anda anı kabul etmiyor.
          </div>
        ) : null}

        <section id="tree" className="scroll-mt-0">
          <CoupleHeroSection
            couple={couple}
            leafCount={leafCount}
            showLeafPulse={showLeafPulse}
            quizLeaderName={quizLeaderName}
            bubbleMemories={bubblePool}
            onMemoryClick={scrollToMemoryForm}
          />
        </section>

        <HeroMemoryTransition />

        <HeroBonusSection couple={couple} />

        <MemoryMirrorSection
          coupleId={couple.id}
          coupleSlug={couple.slug}
          onSuccess={handleContributionSuccess}
          acceptsMemories={acceptsMemories && couple.mediaUploadEnabled}
        />

        <CoupleMemoriesGallerySection
          coupleId={couple.id}
          enabled={couple.memoriesGalleryEnabled}
        />

        {couple.quizEnabled && (
          <MemoryQuizLeaderboardSection
            coupleId={couple.id}
            coupleSlug={couple.slug}
          />
        )}

        <footer className="site-footer">
          <p className="site-footer-names">{displayTitle}</p>
          <p className="site-footer-brand">
            {couple.brandName} · NFC ile açılan anı dünyası
          </p>
          <p className="site-footer-tagline">
            Bu ağaç sizin anılarınızla büyüyor.
          </p>
          <div className="site-footer-meta">
            <TreeGrowthChip leafCount={leafCount} />
            {couple.weddingDate && (
              <span className="site-footer-date">
                {formatDisplayDate(couple.weddingDate)}
              </span>
            )}
          </div>
        </footer>
      </main>
    </MobileAppShell>
  );
}
