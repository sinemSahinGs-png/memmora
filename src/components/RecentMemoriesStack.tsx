"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import { truncateMessage, formatMemoryTime } from "@/lib/memory-utils";
import { cn } from "@/lib/utils";

function MemoryOrb({ item }: { item: ContributionWithMedia }) {
  const media = item.contribution_media?.[0];

  if (media?.file_type?.startsWith("image/")) {
    return (
      <div className="memory-orb">
        <Image
          src={media.file_url}
          alt=""
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      </div>
    );
  }

  if (media?.file_type?.startsWith("video/")) {
    return (
      <div className="memory-orb memory-orb--video">
        <span className="text-[7px] font-medium uppercase tracking-wider text-[#9AA89B]">
          ▶
        </span>
      </div>
    );
  }

  return (
    <div className="memory-orb memory-orb--leaf">
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#9AA89B]" aria-hidden>
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

interface RecentMemoriesStackProps {
  memories: ContributionWithMedia[];
  highlightId?: string | null;
  className?: string;
}

export function RecentMemoriesStack({
  memories,
  highlightId,
  className,
}: RecentMemoriesStackProps) {
  if (memories.length === 0) return null;

  return (
    <div className={cn("recent-memories-stack", className)}>
      <p className="recent-memories-label">Son Anılar</p>
      <ul className="recent-memories-list">
        {memories.slice(0, 3).map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: index * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ marginLeft: index > 0 ? `${index * 4}px` : 0 }}
            className={cn(
              "memory-capsule",
              index === 0 && "memory-capsule--lead",
              highlightId === item.id && "memory-capsule--pulse"
            )}
          >
            <MemoryOrb item={item} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate font-serif text-[13px] text-[#F4F1E8]/95">
                  {item.guest_name}
                </p>
                <time
                  dateTime={item.created_at}
                  className="shrink-0 text-[8px] uppercase tracking-wide text-[#9AA89B]/75"
                >
                  {formatMemoryTime(item.created_at)}
                </time>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#F4F1E8]/52">
                {truncateMessage(item.message)}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
