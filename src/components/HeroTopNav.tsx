"use client";

import Link from "next/link";

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3C9.5 6 8 8 8 10.5a4 4 0 0 0 8 0C16 8 14.5 6 12 3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 14.5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

interface HeroTopNavProps {
  href?: string;
  brandName?: string;
}

export function HeroTopNav({ href = "/", brandName = "The Living Tree" }: HeroTopNavProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-6 pt-6">
      <nav className="flex items-center justify-between">
        <Link
          href={href}
          className="flex items-center gap-2.5 text-[#F4F1E8]/90 transition-opacity hover:opacity-80"
        >
          <TreeIcon className="h-4 w-4 text-[#9AA89B]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.22em]">
            {brandName}
          </span>
        </Link>
      </nav>
    </header>
  );
}
