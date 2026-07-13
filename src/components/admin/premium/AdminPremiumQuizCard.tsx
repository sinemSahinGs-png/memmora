"use client";

import Link from "next/link";
import type { QuizLeader } from "@/lib/supabase/quiz";
import { IconExternalPremium, IconQuiz } from "./AdminPremiumIcons";

interface AdminPremiumQuizCardProps {
  quizEnabled: boolean;
  quizQuestionCount: number;
  participantCount: number;
  leader: QuizLeader | null;
  quizPublicUrl: string;
  onManageQuiz: () => void;
  onEditQuestions: () => void;
}

type QuizCardStatus = "active" | "passive" | "missing";

function getQuizStatus(
  quizEnabled: boolean,
  quizQuestionCount: number
): { status: QuizCardStatus; label: string } {
  if (quizQuestionCount === 0) {
    return { status: "missing", label: "Sorular eksik" };
  }
  if (quizEnabled) {
    return { status: "active", label: "Aktif" };
  }
  return { status: "passive", label: "Pasif" };
}

export function AdminPremiumQuizCard({
  quizEnabled,
  quizQuestionCount,
  participantCount,
  leader,
  quizPublicUrl,
  onManageQuiz,
  onEditQuestions,
}: AdminPremiumQuizCardProps) {
  const { status, label: statusLabel } = getQuizStatus(
    quizEnabled,
    quizQuestionCount
  );
  const showPublicLink =
    quizEnabled && quizQuestionCount > 0 && quizPublicUrl.length > 0;

  const detailLine =
    quizQuestionCount === 0
      ? "Quiz soruları henüz doldurulmadı."
      : leader
        ? `Lider: ${leader.participantName} · ${leader.score}/${leader.totalQuestions}`
        : participantCount === 0
          ? "Henüz katılım yok."
          : null;

  return (
    <section className="admin-premium-quiz-card admin-premium-card--living admin-premium-sheen-surface admin-premium-interactive-lift admin-premium-reveal admin-premium-reveal--d4">
      <div className="admin-premium-quiz-card__head">
        <div className="admin-premium-quiz-card__title-row">
          <span className="admin-premium-quiz-card__icon-wrap" aria-hidden>
            <IconQuiz />
          </span>
          <div className="admin-premium-quiz-card__copy">
            <h2 className="admin-premium-quiz-card__title">Quiz Deneyimi</h2>
            <p className="admin-premium-quiz-card__subtitle">
              Misafirleriniz çifti ne kadar tanıdığını test etsin.
            </p>
          </div>
        </div>
        <span
          className={`admin-premium-quiz-card__status admin-premium-quiz-card__status--${status}`}
        >
          <span className="admin-premium-quiz-card__status-dot" aria-hidden />
          {statusLabel}
        </span>
      </div>

      <div className="admin-premium-quiz-card__metrics">
        <div className="admin-premium-quiz-card__metric">
          <span className="admin-premium-quiz-card__metric-value">
            {participantCount}
          </span>
          <span className="admin-premium-quiz-card__metric-label">Katılım</span>
        </div>
        {detailLine ? (
          <p className="admin-premium-quiz-card__detail">{detailLine}</p>
        ) : null}
      </div>

      <div className="admin-premium-quiz-card__actions">
        <button
          type="button"
          onClick={onManageQuiz}
          className="admin-premium-quiz-card__btn admin-premium-quiz-card__btn--primary admin-premium-interactive"
        >
          Quiz&apos;i Yönet
        </button>
        <button
          type="button"
          onClick={onEditQuestions}
          className="admin-premium-quiz-card__btn admin-premium-quiz-card__btn--secondary admin-premium-interactive"
        >
          Soruları Düzenle
        </button>
        {showPublicLink ? (
          <Link
            href={quizPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-premium-quiz-card__link admin-premium-interactive admin-premium-interactive--link"
          >
            <IconExternalPremium className="admin-premium-icon--sm" />
            Quiz&apos;i Aç
          </Link>
        ) : null}
      </div>
    </section>
  );
}
