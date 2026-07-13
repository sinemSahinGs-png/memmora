"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroQuizStatusChipProps {
  coupleSlug: string;
  leaderName?: string | null;
  className?: string;
}

export function HeroQuizStatusChip({
  coupleSlug,
  leaderName,
  className,
}: HeroQuizStatusChipProps) {
  const hasLeader = Boolean(leaderName?.trim());
  const quizHref = `/${coupleSlug}/quiz`;

  return (
    <div className={cn("hero-quiz-status", className)}>
      {hasLeader && (
        <span className="hero-quiz-leader-chip">
          Quiz 1.si: {leaderName}
        </span>
      )}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={quizHref} className="hero-quiz-join-chip">
          Quiz&apos;e Katıl
        </Link>
      </motion.div>
    </div>
  );
}
