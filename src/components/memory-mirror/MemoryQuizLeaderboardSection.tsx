"use client";

import { useEffect, useState } from "react";
import { fetchQuizLeaderboard } from "@/lib/supabase/quiz";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { QuizLeaderEntry } from "@/lib/supabase/quiz";
import { ASSETS } from "@/lib/assets";
import { MemoryQuizLeaderboardScene } from "./MemoryQuizLeaderboardScene";
import { QuizLeaderboardLeaves } from "./QuizLeaderboardLeaves";

interface MemoryQuizLeaderboardSectionProps {
  coupleId: string;
  coupleSlug: string;
}

export function MemoryQuizLeaderboardSection({
  coupleId,
  coupleSlug,
}: MemoryQuizLeaderboardSectionProps) {
  const [leaderboard, setLeaderboard] = useState<QuizLeaderEntry[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLeaderboard([]);
      return;
    }
    fetchQuizLeaderboard(coupleId, 5)
      .then(setLeaderboard)
      .catch(() => setLeaderboard([]));
  }, [coupleId]);

  const leaderName = leaderboard[0]?.participantName ?? null;

  return (
    <section id="quiz-leaders" className="memory-quiz-leaderboard-section">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.quizLeadersBg}
        alt=""
        className="memory-quiz-leaderboard-section-bg"
        decoding="async"
        fetchPriority="low"
      />
      <div className="memory-quiz-leaderboard-section-glow" aria-hidden />
      <div className="memory-quiz-leaderboard-section-top-blend" aria-hidden />
      <QuizLeaderboardLeaves />

      <div className="memory-quiz-leaderboard-section-inner">
        <header className="memory-quiz-section-heading">
          <h2 className="memory-quiz-section-title">Quiz Liderleri</h2>
          {leaderName ? (
            <p className="memory-quiz-section-leader-name">
              {leaderName}
              <span className="memory-quiz-section-leader-sparks" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </p>
          ) : (
            <p className="memory-quiz-section-leader-name memory-quiz-section-leader-name--empty">
              İlk sırayı sen al
            </p>
          )}
        </header>

        <MemoryQuizLeaderboardScene
          coupleSlug={coupleSlug}
          entries={leaderboard}
        />
      </div>
    </section>
  );
}
