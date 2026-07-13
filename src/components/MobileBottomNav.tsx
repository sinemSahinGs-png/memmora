"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type NavSection = "tree" | "memory" | "quiz" | "playlist";

interface MobileBottomNavProps {
  active?: NavSection;
  coupleSlug?: string;
  quizEnabled?: boolean;
}

function buildHref(
  coupleSlug: string | undefined,
  section: NavSection
): string {
  if (!coupleSlug) {
    const anchors: Record<NavSection, string> = {
      tree: "#tree",
      memory: "#memory",
      quiz: "#quiz",
      playlist: "#playlist",
    };
    return anchors[section];
  }
  if (section === "quiz") return `/${coupleSlug}/quiz`;
  return `/${coupleSlug}#${section}`;
}

const ITEMS: {
  id: NavSection;
  label: string;
  Icon: (props: { active: boolean }) => ReactNode;
}[] = [
  { id: "tree", label: "Ağaç", Icon: TreeIcon },
  { id: "memory", label: "Mesaj", Icon: LeafIcon },
  { id: "quiz", label: "Quiz", Icon: QuizIcon },
  { id: "playlist", label: "Müzik", Icon: MusicIcon },
];

export function MobileBottomNav({
  active = "tree",
  coupleSlug,
  quizEnabled = true,
}: MobileBottomNavProps) {
  const visibleItems = quizEnabled
    ? ITEMS
    : ITEMS.filter((item) => item.id !== "quiz");

  return (
    <div className="nav-dock-wrapper" aria-hidden={false}>
      <nav className="nav-glass-dock" aria-label="Ana menü">
        <ul className="nav-dock-list">
          {visibleItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="flex-1">
                <motion.a
                  href={buildHref(coupleSlug, item.id)}
                  className={cn("nav-dock-item", isActive && "nav-dock-item--active")}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  {isActive && <span className="nav-dock-active-pill" aria-hidden />}
                  <item.Icon active={isActive} />
                  <span>{item.label}</span>
                </motion.a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function TreeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="nav-dock-icon" aria-hidden>
      <path
        d="M12 3c-2 3-4 5-4 8a4 4 0 108 0c0-3-2-5-4-8z"
        stroke="currentColor"
        strokeWidth="1.1"
        className={active ? "text-[#D4AF37]" : "text-[rgba(244,241,232,0.52)]"}
      />
      <path d="M12 14v7" stroke="currentColor" strokeWidth="1.1" className={active ? "text-[#D4AF37]" : "text-[rgba(244,241,232,0.52)]"} />
    </svg>
  );
}

function LeafIcon({ active }: { active: boolean }) {
  const c = active ? "text-[#D4AF37]" : "text-[rgba(244,241,232,0.52)]";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="nav-dock-icon" aria-hidden>
      <path d="M19 4c-6 2-10 7-11 14 4-1 8-4 11-9z" stroke="currentColor" strokeWidth="1.1" className={c} strokeLinejoin="round" />
    </svg>
  );
}

function QuizIcon({ active }: { active: boolean }) {
  const c = active ? "text-[#D4AF37]" : "text-[rgba(244,241,232,0.52)]";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="nav-dock-icon" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.1" className={c} />
      <path d="M9.5 9.5a2.5 2.5 0 114.2 2c-.8.6-1.2 1.2-1.2 2.2v.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={c} />
      <circle cx="12" cy="17" r="0.7" fill="currentColor" className={c} />
    </svg>
  );
}

function MusicIcon({ active }: { active: boolean }) {
  const c = active ? "text-[#D4AF37]" : "text-[rgba(244,241,232,0.52)]";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="nav-dock-icon" aria-hidden>
      <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={c} />
      <circle cx="7" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.1" className={c} />
      <circle cx="17" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.1" className={c} />
    </svg>
  );
}
