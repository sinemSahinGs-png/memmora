import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroQuizPanelProps {
  coupleSlug: string;
  quizEnabled: boolean;
  quizWinnerName: string | null;
  className?: string;
}

export function HeroQuizPanel({
  coupleSlug,
  quizEnabled,
  quizWinnerName,
  className,
}: HeroQuizPanelProps) {
  if (!quizEnabled) {
    return (
      <div className={cn("shrink-0", className)}>
        <div className="hero-quiz-bar justify-center py-3.5">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[#9AA89B]">
            Quiz yakında
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("shrink-0", className)}>
      <div className="hero-quiz-bar flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.24em] text-[#9AA89B]">
            Quiz Birincisi
          </p>
          <p className="mt-0.5 font-serif text-[14px] leading-tight text-[#F4F1E8]/90 sm:text-[15px]">
            {quizWinnerName?.trim() || "Henüz birinci yok"}
          </p>
        </div>

        <Link
          href={`/${coupleSlug}#quiz`}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-full border border-white/[0.22] bg-white/[0.04] px-5 py-2.5 text-[9px] font-medium uppercase tracking-[0.22em] text-[#F4F1E8]/88 transition-colors hover:border-white/35 hover:bg-white/[0.07] sm:w-auto"
        >
          Quize Geç
        </Link>
      </div>
    </div>
  );
}
