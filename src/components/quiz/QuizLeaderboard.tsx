import type { QuizLeaderEntry } from "@/lib/supabase/quiz";

interface QuizLeaderboardProps {
  entries: QuizLeaderEntry[];
  highlightId?: string | null;
  title?: string;
}

export function QuizLeaderboard({
  entries,
  highlightId,
  title = "Sıralama",
}: QuizLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="quiz-leaderboard-empty">
        <p className="text-sm text-[#F4F1E8]/45">Henüz sonuç yok.</p>
      </div>
    );
  }

  return (
    <div className="quiz-leaderboard">
      <p className="quiz-leaderboard-title">{title}</p>
      <ol className="quiz-leaderboard-list">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={
              highlightId === entry.id
                ? "quiz-leaderboard-row quiz-leaderboard-row--highlight"
                : "quiz-leaderboard-row"
            }
          >
            <span className="quiz-leaderboard-rank">{entry.rank}.</span>
            <span className="quiz-leaderboard-name">{entry.participantName}</span>
            <span className="quiz-leaderboard-score">
              {entry.score}/{entry.totalQuestions}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
