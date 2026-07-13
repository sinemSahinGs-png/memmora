"use client";

import { cn } from "@/lib/utils";
import type { AdminContributionFilter } from "@/lib/admin-utils";

const FILTERS: { id: AdminContributionFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "with-media", label: "Fotoğraflı / Videolu" },
  { id: "message-only", label: "Sadece Mesaj" },
];

interface AdminToolbarProps {
  searchQuery: string;
  filter: AdminContributionFilter;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: AdminContributionFilter) => void;
  onExport: () => void;
}

export function AdminToolbar({
  searchQuery,
  filter,
  resultCount,
  totalCount,
  onSearchChange,
  onFilterChange,
  onExport,
}: AdminToolbarProps) {
  return (
    <div className="glass-panel mb-6 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <label htmlFor="admin-search" className="sr-only">
            Mesajlarda ara
          </label>
          <input
            id="admin-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Misafir adı veya mesaj ara…"
            className="memory-input memory-input-compact"
          />
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-champagne/35 bg-champagne/5 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-champagne transition-colors hover:border-champagne/60 hover:bg-champagne/10"
        >
          Notları ve Quiz Sonuçlarını İndir
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFilterChange(item.id)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] transition-colors",
              filter === item.id
                ? "border-champagne/50 bg-champagne/10 text-champagne"
                : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:text-white/70"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-white/30">
        {resultCount === totalCount
          ? `${totalCount} yaprak`
          : `${resultCount} / ${totalCount} yaprak gösteriliyor`}
      </p>
    </div>
  );
}
