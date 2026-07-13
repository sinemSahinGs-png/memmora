import Link from "next/link";
import { formatDisplayDate } from "@/lib/mock-data";
import type { Couple } from "@/lib/types";
import { formatMediaSize, type MediaStats } from "@/lib/admin-utils";

interface AdminHeaderProps {
  couple: Couple;
  leafCount: number;
  mediaStats: MediaStats;
}

export function AdminHeader({
  couple,
  leafCount,
  mediaStats,
}: AdminHeaderProps) {
  const sizeLabel = formatMediaSize(mediaStats.totalBytes);

  return (
    <header className="mb-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/75">
            Memoora Admin
          </p>
          <h1 className="mt-1 font-serif text-3xl text-white/95 sm:text-4xl">
            {couple.displayTitle || couple.names}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Düğün Tarihi:{" "}
            <span className="text-white/70">
              {couple.weddingDate
                ? formatDisplayDate(couple.weddingDate)
                : "—"}
            </span>
          </p>
        </div>
        <Link
          href={`/${couple.slug}`}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-champagne/30 hover:text-champagne"
        >
          Siteye dön
        </Link>
      </div>

      <div className="admin-stat-pills">
        <div className="admin-stat-pill">
          <p className="admin-stat-pill__label">Toplam Yaprak</p>
          <p className="admin-stat-pill__value">{leafCount}</p>
        </div>

        <div className="admin-stat-pill">
          <p className="admin-stat-pill__label">Medya Sayısı</p>
          <p className="admin-stat-pill__value">{mediaStats.total}</p>
          <p className="admin-stat-pill__sub">
            {mediaStats.photos} foto · {mediaStats.videos} video
            {sizeLabel ? ` · ${sizeLabel}` : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
