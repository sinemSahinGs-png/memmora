"use client";

import type { LandingTimelineItem, TimelineThumbnail } from "@/lib/hero-config";
import { cn } from "@/lib/utils";

function TimelineThumbnailBox({ type }: { type: TimelineThumbnail }) {
  if (type === "leaf") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/12 bg-white/[0.04] sm:h-10 sm:w-10">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[#9AA89B] sm:h-4 sm:w-4" aria-hidden>
          <path
            d="M12 4C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-10Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  const gradients = {
    couple: "bg-gradient-to-br from-[#5a6b5c]/65 via-[#3d4a3e]/55 to-[#2a3530]/65",
    promise: "bg-gradient-to-br from-[#4a5650]/65 via-[#35403a]/55 to-[#242e28]/65",
  };

  return (
    <div
      className={cn(
        "h-9 w-9 shrink-0 rounded-md border border-white/12 sm:h-10 sm:w-10",
        gradients[type]
      )}
      aria-hidden
    />
  );
}

interface MemoryTimelineProps {
  items: LandingTimelineItem[];
  className?: string;
  compactOnMobile?: boolean;
}

export function MemoryTimeline({
  items,
  className,
  compactOnMobile = false,
}: MemoryTimelineProps) {
  const visibleItems = compactOnMobile ? items : items;
  const mobileHiddenFrom = compactOnMobile ? 2 : items.length;

  return (
    <div className={cn("hero-timeline-root", className)}>
      <div
        className="absolute bottom-2 left-[17px] top-2 border-l border-dotted border-white/16"
        aria-hidden
      />

      <ul className="space-y-2">
        {visibleItems.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "relative pl-9 sm:pl-10",
              compactOnMobile && index >= mobileHiddenFrom && "hidden sm:list-item"
            )}
          >
            <div
              className="absolute left-[13px] top-[1.25rem] z-10 h-[5px] w-[5px] rounded-full bg-[#F4F1E8]/35 sm:left-[15px] sm:top-[1.35rem] sm:h-[6px] sm:w-[6px]"
              aria-hidden
            />

            <div className="rounded-xl border border-white/[0.2] bg-[rgba(15,30,24,0.32)] p-2 backdrop-blur-md sm:p-2.5">
              <div className="flex gap-2 sm:gap-2.5">
                <TimelineThumbnailBox type={item.thumbnail} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-serif text-[11px] leading-tight text-[#F4F1E8]/94 sm:text-[12px]">
                    {item.title}
                  </p>
                  {item.date && (
                    <p className="mt-0.5 text-[8px] tracking-wide text-[#9AA89B]/88 sm:text-[9px]">
                      {item.date}
                    </p>
                  )}
                  {item.quote && (
                    <p className="mt-1 hidden font-serif text-[9px] italic leading-snug text-[#F4F1E8]/52 sm:block sm:text-[10px]">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-0.5 text-[8px] leading-relaxed text-[#F4F1E8]/46 sm:mt-1 sm:text-[9px]">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
