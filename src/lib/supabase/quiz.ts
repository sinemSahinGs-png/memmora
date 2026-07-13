import { createSupabaseClient } from "./client";
import type { Json } from "./database.types";

export type QuizOptionLetter = "A" | "B" | "C" | "D";

export interface DbQuizQuestion {
  id: string;
  couple_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: QuizOptionLetter;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface DbQuizAttempt {
  id: string;
  couple_id: string;
  participant_name: string;
  score: number;
  total_questions: number;
  answers: Json;
  created_at: string;
}

export interface QuizQuestionInput {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuizOptionLetter;
  sortOrder: number;
  isActive: boolean;
}

export interface QuizLeaderEntry {
  rank: number;
  participantName: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
  id: string;
}

export interface QuizLeader {
  participantName: string;
  score: number;
  totalQuestions: number;
}

function mapQuestion(row: DbQuizQuestion) {
  return {
    id: row.id,
    coupleId: row.couple_id,
    questionText: row.question_text,
    optionA: row.option_a,
    optionB: row.option_b,
    optionC: row.option_c ?? "",
    optionD: row.option_d ?? "",
    correctOption: row.correct_option,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type QuizQuestion = ReturnType<typeof mapQuestion>;

export async function fetchActiveQuizQuestions(
  coupleId: string
): Promise<QuizQuestion[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbQuizQuestion[]).map(mapQuestion);
}

export async function fetchAllQuizQuestions(
  coupleId: string
): Promise<QuizQuestion[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("couple_id", coupleId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbQuizQuestion[]).map(mapQuestion);
}

export async function createQuizQuestion(
  coupleId: string,
  input: QuizQuestionInput
): Promise<QuizQuestion> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      couple_id: coupleId,
      question_text: input.questionText.trim(),
      option_a: input.optionA.trim(),
      option_b: input.optionB.trim(),
      option_c: input.optionC.trim() || null,
      option_d: input.optionD.trim() || null,
      correct_option: input.correctOption,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Soru eklenemedi.");
  return mapQuestion(data as DbQuizQuestion);
}

export async function updateQuizQuestion(
  questionId: string,
  input: QuizQuestionInput
): Promise<QuizQuestion> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: input.questionText.trim(),
      option_a: input.optionA.trim(),
      option_b: input.optionB.trim(),
      option_c: input.optionC.trim() || null,
      option_d: input.optionD.trim() || null,
      correct_option: input.correctOption,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Soru güncellenemedi.");
  return mapQuestion(data as DbQuizQuestion);
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);
  if (error) throw new Error(error.message);
}

export async function submitQuizAttempt(input: {
  coupleId: string;
  participantName: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, QuizOptionLetter>;
}): Promise<DbQuizAttempt> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      couple_id: input.coupleId,
      participant_name: input.participantName.trim(),
      score: input.score,
      total_questions: input.totalQuestions,
      answers: input.answers as Json,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Sonuç kaydedilemedi.");
  return data as DbQuizAttempt;
}

export async function fetchQuizQuestionCount(coupleId: string): Promise<number> {
  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from("quiz_questions")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fetchQuizParticipantCount(
  coupleId: string
): Promise<number> {
  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", coupleId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function fetchQuizAttempts(
  coupleId: string
): Promise<DbQuizAttempt[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("couple_id", coupleId)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as DbQuizAttempt[];
}

export function buildLeaderboard(
  attempts: DbQuizAttempt[]
): QuizLeaderEntry[] {
  return attempts.map((a, i) => ({
    rank: i + 1,
    id: a.id,
    participantName: a.participant_name,
    score: a.score,
    totalQuestions: a.total_questions,
    createdAt: a.created_at,
  }));
}

export async function fetchQuizLeaderboard(
  coupleId: string,
  limit = 10
): Promise<QuizLeaderEntry[]> {
  const attempts = await fetchQuizAttempts(coupleId);
  return buildLeaderboard(attempts).slice(0, limit);
}

export async function fetchQuizLeader(
  coupleId: string
): Promise<QuizLeader | null> {
  const board = await fetchQuizLeaderboard(coupleId, 1);
  if (board.length === 0) return null;
  const top = board[0];
  return {
    participantName: top.participantName,
    score: top.score,
    totalQuestions: top.totalQuestions,
  };
}

export function getRankForAttempt(
  attempts: DbQuizAttempt[],
  attemptId: string
): number | null {
  const board = buildLeaderboard(attempts);
  const entry = board.find((e) => e.id === attemptId);
  return entry?.rank ?? null;
}

export async function deleteAllQuizAttempts(coupleId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("quiz_attempts")
    .delete()
    .eq("couple_id", coupleId);
  if (error) throw new Error(error.message);
}

export function scoreQuizAnswers(
  questions: QuizQuestion[],
  answers: Record<string, QuizOptionLetter>
): number {
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctOption) score += 1;
  }
  return score;
}

export function getQuestionOptions(q: QuizQuestion): {
  letter: QuizOptionLetter;
  text: string;
}[] {
  const opts: { letter: QuizOptionLetter; text: string }[] = [
    { letter: "A", text: q.optionA },
    { letter: "B", text: q.optionB },
  ];
  if (q.optionC.trim()) opts.push({ letter: "C", text: q.optionC });
  if (q.optionD.trim()) opts.push({ letter: "D", text: q.optionD });
  return opts;
}
