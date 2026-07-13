"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "../GlassCard";
import { GoldButton } from "../GoldButton";
import { AdminConfirmModal } from "./AdminConfirmModal";
import { QuizQuestionForm } from "./QuizQuestionForm";
import type { Couple } from "@/lib/types";
import { coupleToSettingsInput } from "@/lib/couple-utils";
import { updateCoupleSettings } from "@/lib/supabase/couples";
import {
  type QuizQuestion,
  type QuizLeaderEntry,
  fetchAllQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  fetchQuizAttempts,
  deleteAllQuizAttempts,
  buildLeaderboard,
} from "@/lib/supabase/quiz";
import { formatDisplayDate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AdminQuizManagerProps {
  couple: Couple;
  onCoupleUpdated: (couple: Couple) => void;
  premium?: boolean;
}

export function AdminQuizManager({
  couple,
  onCoupleUpdated,
  premium = false,
}: AdminQuizManagerProps) {
  const [quizEnabled, setQuizEnabled] = useState(couple.quizEnabled);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<QuizLeaderEntry[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuizData = useCallback(async () => {
    setLoading(true);
    try {
      const [qs, attempts] = await Promise.all([
        fetchAllQuizQuestions(couple.id),
        fetchQuizAttempts(couple.id),
      ]);
      setQuestions(qs);
      setLeaderboard(buildLeaderboard(attempts));
      setAttemptCount(attempts.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Quiz verisi yüklenemedi.";
      console.error("[AdminQuizManager] loadQuizData", e);
      const hint = /quiz_questions/i.test(msg)
        ? " — Supabase'de migration-quiz.sql çalıştırın."
        : "";
      setError(`${msg}${hint}`);
    } finally {
      setLoading(false);
    }
  }, [couple.id]);

  useEffect(() => {
    loadQuizData();
  }, [loadQuizData]);

  const handleToggleQuiz = async () => {
    const next = !quizEnabled;
    setSavingToggle(true);
    setError(null);
    const result = await updateCoupleSettings(couple.id, {
      ...coupleToSettingsInput(couple),
      quizEnabled: next,
    });
    setSavingToggle(false);
    if (result.success) {
      setQuizEnabled(next);
      onCoupleUpdated(result.couple);
      setMessage(next ? "Quiz aktif edildi." : "Quiz kapatıldı.");
    } else {
      setError(result.error);
    }
  };

  const handleSaveQuestion = async (
    input: Parameters<typeof createQuizQuestion>[1]
  ) => {
    setError(null);
    try {
      if (editingId) {
        await updateQuizQuestion(editingId, input);
        setMessage("Soru güncellendi.");
      } else {
        await createQuizQuestion(couple.id, input);
        setMessage("Soru eklendi.");
      }
      setEditingId(null);
      setShowForm(false);
      await loadQuizData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingId) return;
    try {
      await deleteQuizQuestion(deletingId);
      setDeletingId(null);
      setMessage("Soru silindi.");
      await loadQuizData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silme başarısız.");
    }
  };

  const handleClearAttempts = async () => {
    setClearing(true);
    try {
      await deleteAllQuizAttempts(couple.id);
      setClearConfirm(false);
      setMessage("Tüm quiz sonuçları temizlendi.");
      await loadQuizData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Temizleme başarısız.");
    } finally {
      setClearing(false);
    }
  };

  const editingQuestion = questions.find((q) => q.id === editingId);

  return (
    <div className={cn("space-y-6", premium && "admin-quiz-manager--premium")}>
      <GlassCard strong className={cn("!rounded-2xl !p-5 sm:!p-6", premium && "admin-quiz-panel")}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
              Quiz Durumu
            </p>
            <p className="mt-1 text-sm text-white/45">
              {premium
                ? `${attemptCount} katılım · Quiz kapalıyken hero ve quiz sayfası görünmez.`
                : "Quiz kapalıyken hero ve quiz sayfası görünmez."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={quizEnabled}
            disabled={savingToggle}
            onClick={handleToggleQuiz}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              quizEnabled ? "bg-champagne/35" : "bg-white/10"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white/90 transition-transform",
                quizEnabled ? "left-[22px]" : "left-0.5"
              )}
            />
          </button>
        </div>
      </GlassCard>

      {(message || error) && (
        <p
          className={cn(
            "text-center text-sm",
            error ? "text-red-300/90" : "text-champagne/80"
          )}
        >
          {error ?? message}
        </p>
      )}

      <GlassCard
        strong
        id={premium ? "quiz-questions" : undefined}
        className={cn("!rounded-2xl !p-5 sm:!p-6", premium && "admin-quiz-panel")}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
            Sorular ({questions.length})
          </p>
          <GoldButton
            type="button"
            variant="secondary"
            className="!text-[10px]"
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Soru Ekle
          </GoldButton>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-white/40">Yükleniyor…</p>
        ) : questions.length === 0 && !showForm ? (
          <div className="mt-6 text-center">
            <p className="font-serif text-lg text-white/55">Henüz soru eklenmedi.</p>
            <GoldButton
              type="button"
              variant="primary"
              className="mt-4 !text-[10px]"
              onClick={() => setShowForm(true)}
            >
              İlk soruyu ekle
            </GoldButton>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {questions.map((q) => (
              <li
                key={q.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/90">{q.questionText}</p>
                    <p className="mt-1 text-[10px] text-white/35">
                      Sıra {q.sortOrder} · Doğru: {q.correctOption} ·{" "}
                      {q.isActive ? "Aktif" : "Pasif"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="text-[10px] uppercase tracking-wider text-white/45 hover:text-champagne"
                      onClick={() => {
                        setEditingId(q.id);
                        setShowForm(true);
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="text-[10px] uppercase tracking-wider text-red-300/70 hover:text-red-300"
                      onClick={() => setDeletingId(q.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <QuizQuestionForm
              key={editingId ?? "new"}
              initial={
                editingQuestion
                  ? {
                      questionText: editingQuestion.questionText,
                      optionA: editingQuestion.optionA,
                      optionB: editingQuestion.optionB,
                      optionC: editingQuestion.optionC,
                      optionD: editingQuestion.optionD,
                      correctOption: editingQuestion.correctOption,
                      sortOrder: editingQuestion.sortOrder,
                      isActive: editingQuestion.isActive,
                    }
                  : {
                      questionText: "",
                      optionA: "",
                      optionB: "",
                      optionC: "",
                      optionD: "",
                      correctOption: "A" as const,
                      sortOrder: questions.length,
                      isActive: true,
                    }
              }
              onSave={handleSaveQuestion}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            />
          </div>
        )}
      </GlassCard>

      <GlassCard
        strong
        className={cn("!rounded-2xl !p-5 sm:!p-6", premium && "admin-quiz-panel")}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
            Leaderboard ({attemptCount})
          </p>
          {attemptCount > 0 && (
            <button
              type="button"
              className="text-[10px] uppercase tracking-wider text-red-300/60 hover:text-red-300"
              onClick={() => setClearConfirm(true)}
            >
              Sonuçları temizle
            </button>
          )}
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-white/40">Yükleniyor…</p>
        ) : leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">
            {premium ? "Henüz quiz katılımı yok." : "Henüz deneme yok."}
          </p>
        ) : (
          <ol className="mt-4 space-y-2">
            {leaderboard.map((entry) => (
              <li
                key={entry.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-sm",
                  premium && "admin-quiz-leader-row"
                )}
              >
                <span className="text-white/80 min-w-0 truncate">
                  {entry.rank}. {entry.participantName}
                </span>
                {premium ? (
                  <span className="admin-quiz-leader-row__meta shrink-0 text-right">
                    <span className="text-champagne/75">
                      {entry.score}/{entry.totalQuestions}
                    </span>
                    <span className="admin-quiz-leader-row__date">
                      {formatDisplayDate(entry.createdAt.split("T")[0])}
                    </span>
                  </span>
                ) : (
                  <span className="text-champagne/75 shrink-0">
                    {entry.score}/{entry.totalQuestions}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </GlassCard>

      <AdminConfirmModal
        open={deletingId !== null}
        title="Soruyu sil"
        description="Bu soru kalıcı olarak silinecek. Emin misin?"
        confirmLabel="Evet, sil"
        cancelLabel="Vazgeç"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeletingId(null)}
      />

      <AdminConfirmModal
        open={clearConfirm}
        title="Tüm sonuçları temizle"
        description="Tüm quiz denemeleri kalıcı olarak silinecek. Hero lideri de sıfırlanır."
        confirmLabel="Evet, temizle"
        cancelLabel="Vazgeç"
        loading={clearing}
        onConfirm={handleClearAttempts}
        onCancel={() => {
          if (!clearing) setClearConfirm(false);
        }}
      />
    </div>
  );
}
