"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/supabase/constants";

interface HeroLandingHeaderProps {
  coupleSlug: string;
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.5C9 5.5 7.5 7.5 7.5 10a4.5 4.5 0 0 0 9 0c0-2.5-1.5-4.5-4.5-7.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M12 14v2.5M8.5 19.5c1-1.5 2.2-2.2 3.5-2.2s2.5.7 3.5 2.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 8h14M5 12h14M5 16h14"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeroLandingHeader({ coupleSlug }: HeroLandingHeaderProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: `/${coupleSlug}`, label: "Hatıra Ağacı" },
    { href: `/${coupleSlug}#memory`, label: "Anı Bırak" },
    { href: `/${coupleSlug}/quiz`, label: "Quiz" },
    { href: `/${coupleSlug}#playlist`, label: "Müzik" },
    { href: `/${coupleSlug}/admin`, label: "Admin" },
  ];

  return (
    <>
      <header className="hero-header relative z-50 shrink-0">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="hero-brand-link">
            <TreeIcon className="hero-brand-icon" />
            <span className="hero-brand-text">{BRAND_NAME}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center text-[#F4F1E8]/85 transition-opacity hover:opacity-100"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#0F2D24]/55 backdrop-blur-sm transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <nav
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-[min(280px,78vw)] flex-col border-l border-white/10 bg-[rgba(15,30,24,0.92)] px-6 pb-8 pt-20 backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <p className="mb-6 text-[10px] uppercase tracking-[0.3em] text-[#9AA89B]">
          Menü
        </p>
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-[#F4F1E8]/85 transition-colors hover:bg-white/5 hover:text-[#F4F1E8]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
