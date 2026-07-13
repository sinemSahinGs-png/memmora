"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroQuizDockProps {
  coupleSlug: string;
  coupleDisplayName: string;
  quizEnabled: boolean;
  quizWinnerName: string | null;
  className?: string;
}

const btnMotion = {
  whileHover: { scale: 1.03, y: -1 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export function HeroQuizDock({
  coupleSlug,
  coupleDisplayName,
  quizEnabled,
  quizWinnerName,
  className,
}: HeroQuizDockProps) {
  if (!quizEnabled) return null;

  const winner = quizWinnerName?.trim();
  const hasWinner = Boolean(winner);

  return (
    <motion.div
      className={cn("hero-quiz-dock hero-quiz-dock--live shrink-0", className)}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.22 }}
    >
      <div className="hero-quiz-dock-inner">
        <div className="min-w-0 flex-1">
          {hasWinner ? (
            <>
              <p className="hero-quiz-label hero-quiz-label--gold">Quiz Lideri</p>
              <p className="hero-quiz-title">1. {winner}</p>
              <p className="hero-quiz-sub">Şu an listenin zirvesinde.</p>
            </>
          ) : (
            <>
              <p className="hero-quiz-label">Bonus</p>
              <p className="hero-quiz-title">Çifti ne kadar tanıyorsun?</p>
              <p className="hero-quiz-sub">
                {coupleDisplayName} hakkında mini testi çöz.
              </p>
            </>
          )}
        </div>

        <motion.div {...btnMotion} className="hero-quiz-dock-btn">
          <Link
            href={`/${coupleSlug}#quiz`}
            className={cn(
              "premium-btn-secondary",
              hasWinner ? "" : "premium-btn-secondary--gold"
            )}
          >
            {hasWinner ? "Sıralamayı Gör" : "Quiz'e Başla"}
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
