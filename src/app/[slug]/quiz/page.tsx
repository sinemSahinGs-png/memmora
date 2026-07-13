import { notFound } from "next/navigation";
import { QuizExperience } from "@/components/quiz/QuizExperience";
import { QuizPageShell } from "@/components/quiz/QuizPageShell";
import { resolveCoupleForPage } from "@/lib/supabase/couples";
import {
  fetchActiveQuizQuestions,
  fetchQuizLeaderboard,
  buildLeaderboard,
} from "@/lib/supabase/quiz";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);
  if (!couple) return { title: "Bulunamadı" };
  return {
    title: `${couple.names} Quiz — Memoora`,
    description: "Çifti ne kadar tanıyorsun?",
  };
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);

  if (!couple) {
    notFound();
  }

  if (couple.status === "passive" || !couple.quizEnabled) {
    notFound();
  }

  let questions: Awaited<ReturnType<typeof fetchActiveQuizQuestions>> = [];
  let leaderboard = buildLeaderboard([]);

  if (isSupabaseConfigured()) {
    try {
      [questions, leaderboard] = await Promise.all([
        fetchActiveQuizQuestions(couple.id),
        fetchQuizLeaderboard(couple.id, 10),
      ]);
    } catch {
      questions = [];
      leaderboard = buildLeaderboard([]);
    }
  }

  return (
    <QuizPageShell coupleSlug={couple.slug}>
      <QuizExperience
        couple={couple}
        questions={questions}
        initialLeaderboard={leaderboard}
      />
    </QuizPageShell>
  );
}
