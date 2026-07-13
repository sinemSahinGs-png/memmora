"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Couple } from "@/lib/types";
import {
  type QuizQuestion,
  type QuizOptionLetter,
  type QuizLeaderEntry,
  submitQuizAttempt,
  scoreQuizAnswers,
  getQuestionOptions,
  fetchQuizAttempts,
  getRankForAttempt,
  buildLeaderboard,
} from "@/lib/supabase/quiz";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { QuizLeaderboard } from "./QuizLeaderboard";

type QuizStep = "intro" | "questions" | "result";

interface QuizExperienceProps {
  couple: Couple;
  questions: QuizQuestion[];
  initialLeaderboard: QuizLeaderEntry[];
}

export function QuizExperience({
  couple,
  questions,
  initialLeaderboard,
}: QuizExperienceProps) {
  const displayTitle = getCoupleDisplayTitle(couple);
  const [step, setStep] = useState<QuizStep>("intro");
  const [participantName, setParticipantName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizOptionLetter>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    rank: number | null;
    attemptId: string | null;
  } | null>(null);
  const [leaderboard, setLeaderboard] =
    useState<QuizLeaderEntry[]>(initialLeaderboard);

  const currentQuestion = questions[currentIndex];
  const hasQuestions = questions.length > 0;

  const startQuiz = () => {
    if (!participantName.trim()) return;
    if (!hasQuestions) {
      setError("Henüz quiz sorusu eklenmemiş.");
      return;
    }
    setError(null);
    setAnswers({});
    setCurrentIndex(0);
    setStep("questions");
  };

  const selectAnswer = (letter: QuizOptionLetter) => {
    if (!currentQuestion) return;
    const next = { ...answers, [currentQuestion.id]: letter };
    setAnswers(next);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 220);
    } else {
      void finishQuiz(next);
    }
  };

  const finishQuiz = async (finalAnswers: Record<string, QuizOptionLetter>) => {
    const score = scoreQuizAnswers(questions, finalAnswers);
    const total = questions.length;

    if (!isSupabaseConfigured()) {
      setResult({ score, total, rank: null, attemptId: null });
      setStep("result");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const attempt = await submitQuizAttempt({
        coupleId: couple.id,
        participantName: participantName.trim(),
        score,
        totalQuestions: total,
        answers: finalAnswers,
      });
      const attempts = await fetchQuizAttempts(couple.id);
      setLeaderboard(buildLeaderboard(attempts));
      setResult({
        score,
        total,
        rank: getRankForAttempt(attempts, attempt.id),
        attemptId: attempt.id,
      });
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sonuç kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-page-inner">
      <header className="quiz-page-header">
        <Link href={`/${couple.slug}`} className="quiz-page-back">
          ← Ağaca dön
        </Link>
        <h1 className="quiz-page-title">{displayTitle} Quiz</h1>
        <p className="quiz-page-subtitle">Çifti ne kadar tanıyorsun?</p>
      </header>

      {step === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="quiz-card"
        >
          <label className="memory-ritual-label" htmlFor="quiz-name">
            Adın
          </label>
          <input
            id="quiz-name"
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Sıralamada görünecek isim"
            className="memory-ritual-input"
            disabled={!hasQuestions}
          />
          {!hasQuestions && (
            <p className="mt-3 text-sm text-[#F4F1E8]/45">
              Bu çift için henüz soru eklenmemiş.
            </p>
          )}
          {error && <p className="memory-ritual-error mt-3">{error}</p>}
          <motion.button
            type="button"
            className="memory-ritual-submit mt-5"
            onClick={startQuiz}
            disabled={!participantName.trim() || !hasQuestions}
            whileTap={{ scale: 0.97 }}
          >
            Başla
          </motion.button>
          {leaderboard.length > 0 && (
            <div className="mt-8">
              <QuizLeaderboard entries={leaderboard.slice(0, 5)} />
            </div>
          )}
        </motion.div>
      )}

      {step === "questions" && currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24 }}
          className="quiz-card"
        >
          <p className="quiz-progress">
            Soru {currentIndex + 1} / {questions.length}
          </p>
          <h2 className="quiz-question-text">{currentQuestion.questionText}</h2>
          <ul className="quiz-options">
            {getQuestionOptions(currentQuestion).map((opt) => (
              <li key={opt.letter}>
                <button
                  type="button"
                  className="quiz-option-btn"
                  onClick={() => selectAnswer(opt.letter)}
                  disabled={submitting}
                >
                  <span className="quiz-option-letter">{opt.letter}</span>
                  <span>{opt.text}</span>
                </button>
              </li>
            ))}
          </ul>
          {error && <p className="memory-ritual-error mt-4">{error}</p>}
        </motion.div>
      )}

      {step === "result" && result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="quiz-card"
        >
          <p className="quiz-result-eyebrow">Tamamlandı</p>
          <p className="quiz-result-score">
            Skorun: {result.score}/{result.total}
          </p>
          {result.rank !== null && (
            <p className="quiz-result-rank">
              Sıralamadaki yerin: {result.rank}.
            </p>
          )}
          <div className="mt-6">
            <QuizLeaderboard
              entries={leaderboard.slice(0, 10)}
              highlightId={result.attemptId}
            />
          </div>
          <Link
            href={`/${couple.slug}`}
            className="premium-btn-secondary mt-6 w-full"
          >
            Ağaca Dön
          </Link>
        </motion.div>
      )}
    </div>
  );
}
