"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { QuizQuestion } from "@/lib/types";

interface QuizPreviewProps {
  question: QuizQuestion;
  coupleSlug: string;
  coupleDisplayName: string;
}

export function QuizPreview({
  question,
  coupleSlug,
  coupleDisplayName,
}: QuizPreviewProps) {
  return (
    <section id="quiz" className="scroll-mt-4 px-5 py-8">
      <motion.div
        className="bonus-card bonus-card--quiz"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.22 }}
      >
        <p className="bonus-card-label bonus-card-label--gold">Bonus</p>
        <h2 className="bonus-card-title">Çifti ne kadar tanıyorsun?</h2>
        <p className="bonus-card-sub">
          {coupleDisplayName} hakkında mini testi çöz.
        </p>
        <p className="bonus-card-preview mt-3 text-sm leading-snug text-[#F4F1E8]/55">
          {question.question}
        </p>
        <motion.div
          className="mt-5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.22 }}
        >
          <Link href={`/${coupleSlug}#quiz`} className="premium-btn-secondary premium-btn-secondary--gold w-full">
            Quiz&apos;e Başla
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
