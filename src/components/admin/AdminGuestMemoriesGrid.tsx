"use client";

import { useCallback, useMemo, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { formatDisplayDate } from "@/lib/mock-data";
import { getMediaDownloadAllUrl } from "@/lib/admin-media-urls";
import {
  getMediaMimeType,
  getMediaProxyDownloadUrl,
  getMediaProxyViewUrl,
  isPhotoMedia,
  isVideoMedia,
} from "@/lib/admin-utils";
import type {
  ContributionWithMedia,
  DbContributionMedia,
} from "@/lib/supabase/database.types";
import {
  AdminGuestGalleryViewer,
  type GuestGalleryViewerItem,
} from "./AdminGuestGalleryViewer";
import { usePrefersReducedMotion } from "./premium/usePrefersReducedMotion";

interface GuestMemoryItem {
  media: DbContributionMedia;
  guestName: string;
  createdAt: string;
}

interface AdminGuestMemoriesGridProps {
  contributions: ContributionWithMedia[];
  coupleSlug: string;
  heroRef?: RefObject<HTMLElement | null>;
  loading?: boolean;
}

export function AdminGuestMemoriesGrid({
  contributions,
  coupleSlug,
  heroRef,
  loading = false,
}: AdminGuestMemoriesGridProps) {
  const reducedMotion = usePrefersReducedMotion();
  const items = useMemo(() => flattenGuestMemories(contributions), [contributions]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const photoCount = useMemo(
    () => items.filter((item) => isPhotoMedia(item.media)).length,
    [items]
  );
  const videoCount = useMemo(
    () => items.filter((item) => isVideoMedia(item.media)).length,
    [items]
  );

  const isSoloLayout = items.length === 1;
  const useFeaturedTile = items.length >= 5;

  const mosaicLayoutClass = useMemo(() => {
    if (items.length === 1) return "admin-guest-gallery__mosaic--solo";
    if (items.length <= 4) return "admin-guest-gallery__mosaic--balanced";
    return "admin-guest-gallery__mosaic--dense admin-guest-gallery__mosaic--featured";
  }, [items.length]);

  const viewerItems: GuestGalleryViewerItem[] = useMemo(
    () =>
      items.map((item) => ({
        mediaId: item.media.id,
        guestName: displayGuestName(item.guestName),
        createdAt: item.createdAt,
        mimeType: getMediaMimeType(item.media),
      })),
    [items]
  );

  const handleDownloadAll = useCallback(async () => {
    if (bulkDownloading || items.length === 0) return;

    setBulkDownloading(true);
    setBulkError(null);

    try {
      const response = await fetch(getMediaDownloadAllUrl(coupleSlug));
      if (!response.ok) {
        let message = "Arşiv hazırlanamadı. Lütfen tekrar deneyin.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) message = payload.error;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `memoora-${coupleSlug}-galeri.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setBulkError(
        err instanceof Error
          ? err.message
          : "Arşiv hazırlanamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setBulkDownloading(false);
    }
  }, [bulkDownloading, coupleSlug, items.length]);

  const hasMedia = items.length > 0;
  const canDownload = hasMedia && !loading;

  const reveal = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      };

  const gridReveal = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.44,
          delay: 0.08,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <div className="admin-guest-gallery">
      <motion.section
        ref={heroRef}
        className="admin-guest-gallery__hero admin-premium-card admin-premium-card--living admin-premium-sheen-surface"
        {...reveal}
      >
        <p className="admin-guest-gallery__eyebrow">Memoora Arşivi</p>
        <h2 className="admin-guest-gallery__title">Misafir Galerisi</h2>
        <p className="admin-guest-gallery__desc">
          Düğününüzün misafir fotoğraf ve videoları — tek arşivde.
        </p>

        {canDownload ? (
          <div className="admin-guest-gallery__hero-actions">
            <button
              type="button"
              className="admin-guest-gallery__download-all admin-premium-outline-btn admin-premium-outline-btn--gallery-hero admin-premium-interactive"
              onClick={handleDownloadAll}
              disabled={bulkDownloading}
              aria-busy={bulkDownloading}
            >
              <span className="admin-guest-gallery__download-all-icon" aria-hidden>
                {bulkDownloading ? (
                  <span className="admin-guest-gallery__download-all-spinner" />
                ) : (
                  <DownloadIcon />
                )}
              </span>
              <span className="admin-guest-gallery__download-all-label">
                {bulkDownloading ? "Hazırlanıyor..." : "Tümünü İndir"}
              </span>
            </button>
            {bulkError ? (
              <p className="admin-guest-gallery__download-all-error" role="alert">
                {bulkError}
              </p>
            ) : null}
          </div>
        ) : null}

        <p
          className={`admin-guest-gallery__stats-line${loading ? " admin-guest-gallery__stats-line--loading" : ""}`}
          aria-label="Galeri özeti"
        >
          {loading
            ? "Medya yükleniyor…"
            : `${photoCount} fotoğraf · ${videoCount} video · ${items.length} medya`}
        </p>
        <p className="admin-guest-gallery__note">
          Misafirlerinizin bıraktığı tüm fotoğraf ve videolar Memoora arşivinizde
          güvenle saklanır.
        </p>
      </motion.section>

      {loading ? (
        <motion.div
          className="admin-guest-gallery__skeleton"
          aria-hidden
          {...gridReveal}
        >
          <div className="admin-guest-gallery__skeleton-grid">
            {Array.from({ length: 9 }, (_, index) => (
              <span
                key={index}
                className={`admin-guest-gallery__skeleton-cell${index === 0 ? " admin-guest-gallery__skeleton-cell--featured" : ""}`}
              />
            ))}
          </div>
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div
          className="admin-premium-card admin-premium-card--living admin-guest-gallery__empty"
          {...gridReveal}
        >
          <p className="admin-guest-gallery__empty-title">Henüz fotoğraf yok</p>
          <p className="admin-guest-gallery__empty-hint">
            Misafirler fotoğraf veya video yüklediğinde burada görünür.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className={`admin-guest-gallery__mosaic ${mosaicLayoutClass}`.trim()}
          {...gridReveal}
        >
          {items.map((item, index) => {
            const viewUrl = getMediaProxyViewUrl(item.media, coupleSlug);
            const isPhoto = isPhotoMedia(item.media);
            const isVideo = isVideoMedia(item.media);
            const dateLabel = formatDisplayDate(item.createdAt.split("T")[0]);
            const guestLabel = displayGuestName(item.guestName);
            const isFeatured = useFeaturedTile && index === 0;

            return (
              <article
                key={item.media.id}
                className={[
                  "admin-guest-gallery__cell",
                  isSoloLayout && "admin-guest-gallery__cell--solo",
                  isFeatured && "admin-guest-gallery__cell--featured",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className="admin-guest-gallery__tile"
                  onClick={() => setViewerIndex(index)}
                  aria-label={`${guestLabel} — önizle`}
                >
                  <span className="admin-guest-gallery__tile-media">
                    {isPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={viewUrl}
                        alt=""
                        className="admin-guest-gallery__tile-img"
                        loading="lazy"
                      />
                    ) : isVideo ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <video
                          preload="metadata"
                          src={viewUrl}
                          className="admin-guest-gallery__tile-img"
                          muted
                          playsInline
                        />
                        <span className="admin-guest-gallery__tile-play" aria-hidden>
                          ▶
                        </span>
                      </>
                    ) : (
                      <span className="admin-guest-gallery__tile-fallback">Medya</span>
                    )}

                    <span
                      className={`admin-guest-gallery__tile-badge${isVideo ? " admin-guest-gallery__tile-badge--video" : ""}`}
                    >
                      {isVideo ? "VİDEO" : "FOTO"}
                    </span>

                    <span className="admin-guest-gallery__tile-caption">
                      <span className="admin-guest-gallery__tile-name">
                        {guestLabel}
                      </span>
                      <span className="admin-guest-gallery__tile-date">
                        {dateLabel}
                      </span>
                    </span>

                    <span className="admin-guest-gallery__tile-hover" aria-hidden>
                      Önizle
                    </span>
                  </span>
                </button>

                {isSoloLayout ? (
                  <div className="admin-guest-gallery__solo-actions">
                    <button
                      type="button"
                      className="admin-guest-gallery__cell-action"
                      onClick={() => setViewerIndex(index)}
                    >
                      Önizle
                    </button>
                    <a
                      href={getMediaProxyDownloadUrl(item.media, coupleSlug)}
                      className="admin-guest-gallery__cell-action admin-guest-gallery__cell-action--download"
                    >
                      İndir
                    </a>
                  </div>
                ) : null}
              </article>
            );
          })}
        </motion.div>
      )}

      <div className="admin-guest-gallery__scroll-spacer" aria-hidden />

      {viewerIndex !== null ? (
        <AdminGuestGalleryViewer
          items={viewerItems}
          initialIndex={viewerIndex}
          coupleSlug={coupleSlug}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </div>
  );
}

function displayGuestName(name: string): string {
  const trimmed = name?.trim();
  return trimmed || "Misafir";
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5v11m0 0l4-4M12 14.5l-4-4M4.5 19.5h15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function flattenGuestMemories(
  contributions: ContributionWithMedia[]
): GuestMemoryItem[] {
  const rows: GuestMemoryItem[] = [];

  for (const contribution of contributions) {
    if (!contribution.is_visible) continue;

    for (const media of contribution.contribution_media ?? []) {
      if (media.hidden || media.deleted_at) continue;
      rows.push({
        media,
        guestName: contribution.guest_name,
        createdAt: contribution.created_at,
      });
    }
  }

  return rows.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
