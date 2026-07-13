"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDisplayDate } from "@/lib/mock-data";
import type { QuizLeaderEntry } from "@/lib/supabase/quiz";

interface MemoryQuizLeaderboardSceneProps {
  coupleSlug: string;
  entries: QuizLeaderEntry[];
}

function rankClass(rank: number): string {
  if (rank === 1) return "memory-quiz-rank memory-quiz-rank--gold";
  if (rank === 2) return "memory-quiz-rank memory-quiz-rank--silver";
  if (rank === 3) return "memory-quiz-rank memory-quiz-rank--bronze";
  return "memory-quiz-rank";
}

export function MemoryQuizLeaderboardScene({
  coupleSlug,
  entries,
}: MemoryQuizLeaderboardSceneProps) {
  const topEntries = entries.slice(0, 5);

  return (
    <motion.div
      className="memory-quiz-panel"
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="memory-quiz-header">
        <p className="memory-quiz-subtitle">Çifti en iyi tanıyanlar</p>
      </header>

      {topEntries.length === 0 ? (
        <div className="memory-quiz-empty">
          <p className="memory-quiz-empty-title">Henüz sıralama yok.</p>
          <p className="memory-quiz-empty-sub">İlk sırayı sen al.</p>
        </div>
      ) : (
        <ol className="memory-quiz-list">
          {topEntries.map((entry) => (
            <li
              key={entry.id}
              className={`memory-quiz-row memory-quiz-row--rank-${entry.rank}`}
            >
              <span className={rankClass(entry.rank)}>{entry.rank}</span>
              <div className="memory-quiz-row-body">
                <span className="memory-quiz-name">{entry.participantName}</span>
                <span className="memory-quiz-date">
                  {formatDisplayDate(entry.createdAt)}
                </span>
              </div>
              <span className="memory-quiz-score">
                {entry.score}/{entry.totalQuestions}
              </span>
            </li>
          ))}
        </ol>
      )}

      <Link href={`/${coupleSlug}/quiz`} className="memory-quiz-cta">
        Quiz&apos;e Katıl
      </Link>
    </motion.div>
  );
}
