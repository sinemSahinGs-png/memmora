"use client";

import { GlassCard } from "../GlassCard";
import { formatDisplayDate } from "@/lib/mock-data";
import {
  getMediaFilename,
  getMediaMimeType,
  getMediaOpenUrl,
  isPhotoMedia,
  isVideoMedia,
} from "@/lib/admin-utils";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

interface AdminContributionCardProps {
  item: ContributionWithMedia;
  deleting: boolean;
  onDelete: () => void;
}

export function AdminContributionCard({
  item,
  deleting,
  onDelete,
}: AdminContributionCardProps) {
  const media = item.contribution_media ?? [];
  const createdDate = formatDisplayDate(item.created_at.split("T")[0]);
  const createdTime = new Date(item.created_at).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const photoCount = media.filter(isPhotoMedia).length;
  const videoCount = media.filter(isVideoMedia).length;
  const primaryMedia = media[0];
  const primaryLink = primaryMedia ? getMediaOpenUrl(primaryMedia) : null;

  return (
    <GlassCard strong className="admin-contribution-card overflow-hidden !rounded-2xl !p-0">
      <div className="admin-contribution-card__head">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-xl text-white/92">{item.guest_name}</p>
            {!item.is_visible && (
              <span className="admin-media-badge admin-media-badge--muted">Gizli</span>
            )}
            {photoCount > 0 && (
              <span className="admin-media-badge admin-media-badge--photo">
                Fotoğraf{photoCount > 1 ? ` · ${photoCount}` : ""}
              </span>
            )}
            {videoCount > 0 && (
              <span className="admin-media-badge admin-media-badge--video">
                Video{videoCount > 1 ? ` · ${videoCount}` : ""}
              </span>
            )}
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/35">
            {createdDate} · {createdTime}
          </p>
        </div>
      </div>

      <div className="admin-contribution-card__body">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Mesaj
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/65">
          {item.message}
        </p>
      </div>

      {media.length > 0 && (
        <div className="admin-contribution-card__media">
          <ul className="space-y-2">
            {media.map((file) => {
              const mime = getMediaMimeType(file);
              const link = getMediaOpenUrl(file);
              const name = getMediaFilename(file);

              return (
                <li
                  key={file.id}
                  className="flex flex-col gap-2 rounded-xl border border-white/8 bg-black/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-white/55">{name}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/30">
                      {mime || "dosya"}
                      {file.provider === "google_drive" ? " · Drive" : ""}
                    </p>
                  </div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-card-action admin-card-action--gold"
                  >
                    Drive&apos;da Aç
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="admin-contribution-card__actions">
        {primaryLink ? (
          <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("admin-card-action admin-card-action--gold flex-1")}
          >
            Drive&apos;da Aç
          </a>
        ) : null}
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className={cn(
            "admin-card-action admin-card-action--danger",
            primaryLink ? "flex-1" : "w-full"
          )}
        >
          {deleting ? "Gizleniyor…" : "Gizle"}
        </button>
      </div>
    </GlassCard>
  );
}
