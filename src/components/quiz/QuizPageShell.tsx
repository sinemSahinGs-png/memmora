"use client";

import { MobileAppShell } from "../MobileAppShell";
import { MobileBottomNav } from "../MobileBottomNav";

interface QuizPageShellProps {
  coupleSlug: string;
  children: React.ReactNode;
}

export function QuizPageShell({ coupleSlug, children }: QuizPageShellProps) {
  return (
    <MobileAppShell
      fullWidth
      bottomNav={
        <MobileBottomNav active="quiz" coupleSlug={coupleSlug} quizEnabled />
      }
    >
      <main className="page-main-with-dock quiz-page-main">{children}</main>
    </MobileAppShell>
  );
}
