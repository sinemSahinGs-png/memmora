"use client";

import { formatDisplayDate } from "@/lib/mock-data";
import {
  getMediaProxyDownloadUrl,
  getMediaProxyViewUrl,
  isPhotoMedia,
  isVideoMedia,
} from "@/lib/admin-utils";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

interface AdminPremiumMessageRowProps {
  item: ContributionWithMedia;
  coupleSlug: string;
  compact?: boolean;
  onManage?: () => void;
  managing?: boolean;
  enterDelay?: number;
}

export function AdminPremiumMessageRow({
  item,
  coupleSlug,
  compact = false,
  onManage,
  managing = false,
  enterDelay,
}: AdminPremiumMessageRowProps) {
  const media = item.contribution_media ?? [];
  const photoCount = media.filter(isPhotoMedia).length;
  const videoCount = media.filter(isVideoMedia).length;
  const hasPhoto = photoCount > 0;
  const hasVideo = videoCount > 0;
  const primaryMedia = media[0];
  const viewUrl = primaryMedia
    ? getMediaProxyViewUrl(primaryMedia, coupleSlug)
    : "";
  const downloadUrl = primaryMedia
    ? getMediaProxyDownloadUrl(primaryMedia, coupleSlug)
    : "";
  const previewUrl =
    primaryMedia && isPhotoMedia(primaryMedia) && viewUrl ? viewUrl : null;

  const createdDate = formatDisplayDate(item.created_at.split("T")[0]);
  const createdTime = new Date(item.created_at).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const initial = item.guest_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <article
      className={cn(
        "admin-premium-message-row",
        compact && "admin-premium-message-row--compact",
        compact && enterDelay !== undefined && "admin-premium-message-row--enter",
        !item.is_visible && "admin-premium-message-row--hidden"
      )}
      style={
        enterDelay !== undefined
          ? { animationDelay: `${enterDelay}s` }
          : undefined
      }
    >
      <div className="admin-premium-message-row__avatar" aria-hidden>
        {initial}
      </div>

      <div className="admin-premium-message-row__body">
        <div className="admin-premium-message-row__head">
          <p className="admin-premium-message-row__name">{item.guest_name}</p>
          <p className="admin-premium-message-row__time">
            {createdDate} · {createdTime}
          </p>
        </div>

        {(hasPhoto || hasVideo || !item.is_visible) && (
          <div className="admin-premium-message-row__badges">
            {hasPhoto ? (
              <span className="admin-premium-tag admin-premium-tag--photo">
                Fotoğraf
              </span>
            ) : null}
            {hasVideo ? (
              <span className="admin-premium-tag admin-premium-tag--video">
                Video
              </span>
            ) : null}
            {!item.is_visible ? (
              <span className="admin-premium-tag admin-premium-tag--muted">
                Gizli
              </span>
            ) : null}
          </div>
        )}

        <p className="admin-premium-message-row__text">{item.message}</p>

        {compact && primaryMedia && viewUrl ? (
          <div className="admin-premium-message-row__media-actions">
            {hasPhoto ? (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-premium-message-row__drive-link admin-premium-interactive admin-premium-interactive--link"
              >
                Fotoğrafı Gör
              </a>
            ) : null}
            {hasVideo ? (
              <a
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-premium-message-row__drive-link admin-premium-interactive admin-premium-interactive--link"
              >
                Videoyu İzle
              </a>
            ) : null}
            {downloadUrl ? (
              <a
                href={downloadUrl}
                className="admin-premium-message-row__drive-link admin-premium-interactive admin-premium-interactive--link"
              >
                İndir
              </a>
            ) : null}
          </div>
        ) : null}

        {!compact && onManage ? (
          <button
            type="button"
            onClick={onManage}
            disabled={managing}
            className="admin-premium-message-row__action"
          >
            {managing ? "…" : "Yönet"}
          </button>
        ) : null}
      </div>

      {previewUrl && !compact ? (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-premium-message-row__thumb"
          aria-label="Fotoğrafı gör"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget
                .closest(".admin-premium-message-row__thumb")
                ?.remove();
            }}
          />
        </a>
      ) : null}
    </article>
  );
}
