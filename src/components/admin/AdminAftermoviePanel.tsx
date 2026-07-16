"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Couple } from "@/lib/types";
import type {
  AftermovieDurationPreset,
  CoupleAftermovie,
  OrderedAftermovieMedia,
} from "@/lib/aftermovie/types";
import {
  AFTERMOVIE_PHOTO_MAX,
  AFTERMOVIE_PHOTO_MIN,
  AFTERMOVIE_PHOTO_RECOMMENDED,
  AFTERMOVIE_VIDEO_MAX,
  AFTERMOVIE_STATUS_LABELS,
} from "@/lib/aftermovie/types";
import { adminStatusLabel } from "@/lib/aftermovie/lifecycle";
import { formatDisplayDate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { SelectableGuestMedia } from "@/lib/supabase/aftermovie";
import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import {
  getMediaMimeType,
  getMediaProxyViewUrl,
  isVideoMedia,
} from "@/lib/admin-utils";
import { AdminConfirmModal } from "./AdminConfirmModal";
interface AdminAftermoviePanelProps {
  couple: Couple;
  /** Same guest media source as Galeri tab — used as reliable fallback. */
  contributions?: ContributionWithMedia[];
  onToast?: (message: string) => void;
  onSessionExpired?: () => void;
  onOpenGallery?: () => void;
}

type MediaFilter = "all" | "photo" | "video" | "selected";

function contributionsToSelectable(
  contributions: ContributionWithMedia[],
  coupleSlug: string,
): SelectableGuestMedia[] {
  const out: SelectableGuestMedia[] = [];
  for (const c of contributions) {
    if (c.is_visible === false) continue;
    for (const m of c.contribution_media ?? []) {
      if (m.hidden || m.deleted_at) continue;
      const video = isVideoMedia(m);
      out.push({
        mediaId: m.id,
        mediaType: video ? "video" : "photo",
        guestName: c.guest_name?.trim() || "Misafir",
        mimeType: getMediaMimeType(m) || null,
        filename: m.filename ?? m.file_name ?? null,
        createdAt: m.created_at || c.created_at,
        proxyUrl: getMediaProxyViewUrl(m, coupleSlug),
      });
    }
  }
  out.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return out;
}

export function AdminAftermoviePanel({
  couple,
  contributions = [],
  onToast,
  onSessionExpired,
  onOpenGallery,
}: AdminAftermoviePanelProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aftermovie, setAftermovie] = useState<CoupleAftermovie | null>(null);
  const [selectable, setSelectable] = useState<SelectableGuestMedia[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [posterMediaId, setPosterMediaId] = useState<string | null>(null);
  const [durationPreset, setDurationPreset] =
    useState<AftermovieDurationPreset>("standard");
  const [openingText, setOpeningText] = useState("");
  const [closingText, setClosingText] = useState(
    "Anılar yaşamaya devam ediyor.",
  );
  const [publishAt, setPublishAt] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [providerMessage, setProviderMessage] = useState("");
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});

  const fallbackSelectable = useMemo(
    () => contributionsToSelectable(contributions, couple.slug),
    [contributions, couple.slug],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/couples/${couple.slug}/aftermovie`, {
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        onSessionExpired?.();
        throw new Error(json.error ?? "Oturum gerekli. Lütfen tekrar giriş yapın.");
      }
      if (!res.ok) {
        throw new Error(json.error ?? "Anılar yüklenemedi. Lütfen tekrar deneyin.");
      }

      const am = json.aftermovie as CoupleAftermovie;
      setAftermovie(am);

      const fromApi = (json.selectable ?? []) as SelectableGuestMedia[];
      const merged =
        fromApi.length > 0
          ? fromApi
          : contributionsToSelectable(contributions, couple.slug);
      setSelectable(merged);

      setSelectedIds((am.media ?? []).map((m) => m.mediaId));
      setPosterMediaId(am.posterMediaId);
      setDurationPreset(am.durationPreset || "standard");
      setOpeningText(am.openingText ?? couple.displayTitle);
      setClosingText(am.closingText ?? "Anılar yaşamaya devam ediyor.");
      setPublishAt(
        (am.publishAt ?? am.recommendedPublishAt ?? "").slice(0, 16),
      );
      setProviderMessage(json.providerMessage ?? "");
    } catch (error) {
      // Fallback grid from already-loaded gallery contributions
      if (fallbackSelectable.length > 0) {
        setSelectable(fallbackSelectable);
      }
      setLoadError(
        error instanceof Error
          ? error.message
          : "Anılar yüklenemedi. Lütfen tekrar deneyin.",
      );
      onToast?.(
        error instanceof Error ? error.message : "Düğün filmi yüklenemedi",
      );
    } finally {
      setLoading(false);
    }
  }, [
    contributions,
    couple.displayTitle,
    couple.slug,
    fallbackSelectable,
    onSessionExpired,
    onToast,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  // When gallery data arrives after film tab mount, hydrate empty grid
  useEffect(() => {
    if (!loading && selectable.length === 0 && fallbackSelectable.length > 0) {
      setSelectable(fallbackSelectable);
    }
  }, [fallbackSelectable, loading, selectable.length]);

  const mediaTypeById = useMemo(() => {
    const map = new Map<string, "photo" | "video">();
    for (const m of aftermovie?.media ?? []) {
      map.set(m.mediaId, m.mediaType);
    }
    for (const s of selectable) {
      map.set(s.mediaId, s.mediaType);
    }
    return map;
  }, [aftermovie?.media, selectable]);

  const selectedMeta = useMemo(() => {
    const map = new Map(selectable.map((s) => [s.mediaId, s]));
    return selectedIds
      .map((id) => map.get(id))
      .filter(Boolean) as SelectableGuestMedia[];
  }, [selectable, selectedIds]);

  const photoCount = selectedIds.filter(
    (id) => (mediaTypeById.get(id) ?? "photo") === "photo",
  ).length;
  const videoCount = selectedIds.filter(
    (id) => mediaTypeById.get(id) === "video",
  ).length;

  const visible = useMemo(() => {
    if (filter === "selected") {
      return selectable.filter((m) => selectedIds.includes(m.mediaId));
    }
    if (filter === "all") return selectable;
    return selectable.filter((m) => m.mediaType === filter);
  }, [filter, selectable, selectedIds]);

  const status = aftermovie?.status ?? "draft";
  /** Only lock while a render job is in flight. */
  const hardLocked = status === "queued" || status === "rendering";
  const canEditSelection = !hardLocked;

  const effectivePosterId =
    posterMediaId && selectedIds.includes(posterMediaId)
      ? posterMediaId
      : selectedIds.find((id) => mediaTypeById.get(id) !== "video") ?? null;

  const submitBlockedReason = hardLocked
    ? "Film şu an üretiliyor. Bitince tekrar düzenleyebilirsiniz."
    : photoCount < AFTERMOVIE_PHOTO_MIN
      ? `En az ${AFTERMOVIE_PHOTO_MIN} fotoğraf seçin (şimdi ${photoCount}).`
      : selectedIds.length === 0
        ? "Önce anı seçin."
        : null;

  const toggle = (mediaId: string, mediaType: "photo" | "video") => {
    if (!canEditSelection) return;
    setSelectedIds((prev) => {
      if (prev.includes(mediaId)) {
        const next = prev.filter((id) => id !== mediaId);
        if (posterMediaId === mediaId) setPosterMediaId(null);
        return next;
      }
      const nextTypeCount =
        mediaType === "photo" ? photoCount + 1 : videoCount + 1;
      if (mediaType === "photo" && nextTypeCount > AFTERMOVIE_PHOTO_MAX) {
        onToast?.(`En fazla ${AFTERMOVIE_PHOTO_MAX} fotoğraf`);
        return prev;
      }
      if (mediaType === "video" && nextTypeCount > AFTERMOVIE_VIDEO_MAX) {
        onToast?.(`En fazla ${AFTERMOVIE_VIDEO_MAX} video`);
        return prev;
      }
      return [...prev, mediaId];
    });
  };

  const moveOrdered = (mediaId: string, dir: -1 | 1) => {
    if (!canEditSelection) return;
    setSelectedIds((prev) => {
      const idx = prev.indexOf(mediaId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const removeSelected = (mediaId: string) => {
    if (!canEditSelection) return;
    setSelectedIds((prev) => prev.filter((id) => id !== mediaId));
    if (posterMediaId === mediaId) setPosterMediaId(null);
  };

  const buildItems = (posterId: string | null = effectivePosterId): OrderedAftermovieMedia[] =>
    selectedIds.map((id, index) => {
      const mediaType = mediaTypeById.get(id) ?? "photo";
      return {
        mediaId: id,
        mediaType,
        sortOrder: index,
        isPoster: Boolean(posterId) && id === posterId && mediaType === "photo",
      };
    });

  const postAction = async (action: string, extra?: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/couples/${couple.slug}/aftermovie`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        onSessionExpired?.();
        throw new Error(json.error ?? "Oturum gerekli.");
      }
      if (!res.ok) throw new Error(json.error ?? "İşlem başarısız");
      if (json.aftermovie) setAftermovie(json.aftermovie);
      return json;
    } catch (error) {
      onToast?.(error instanceof Error ? error.message : "Hata");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const openSubmitConfirm = () => {
    if (submitBlockedReason) {
      onToast?.(submitBlockedReason);
      return;
    }
    const poster = effectivePosterId;
    if (!poster) {
      onToast?.("En az bir fotoğraf seçin.");
      return;
    }
    if (poster !== posterMediaId) setPosterMediaId(poster);
    setSubmitConfirmOpen(true);
  };

  const handleSubmitConfirm = async () => {
    setSubmitConfirmOpen(false);
    if (submitBlockedReason) {
      onToast?.(submitBlockedReason);
      return;
    }
    const poster = effectivePosterId;
    if (!poster) {
      onToast?.("En az bir fotoğraf seçin.");
      return;
    }
    if (poster !== posterMediaId) setPosterMediaId(poster);

    const result = await postAction("submit", {
      items: buildItems(poster),
      posterMediaId: poster,
      durationPreset,
      openingText,
      closingText,
      title: couple.displayTitle,
      publishAt: publishAt ? new Date(publishAt).toISOString() : null,
    });
    if (result) {
      onToast?.(
        result.message ??
          "After filminiz hazır.",
      );
      await load();
    }
  };

  if (loading) {
    return (
      <div className="admin-premium-card admin-aftermovie">
        <p className="admin-premium-empty">Anılar yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="admin-aftermovie">
      {/* 1. Film Durumu */}
      <section className="admin-premium-card admin-aftermovie__status">
        <p className="admin-premium-eyebrow">MEMOORA AFTER</p>
        <h2 className="admin-premium-heading">After</h2>
        <p className="admin-aftermovie__badge">
          {aftermovie
            ? adminStatusLabel(aftermovie.status)
            : AFTERMOVIE_STATUS_LABELS.draft}
        </p>
        <p className="admin-aftermovie__hint">
          {providerMessage ||
            "Seçtiğiniz anılar, Memoora’nın film müziğiyle bir düğün filmine dönüştürülür."}
        </p>
        {(status === "waiting_for_production" || status === "submitted") && (
          <div className="admin-aftermovie__status-note" role="status">
            <p>Seçimleriniz kaydedildi.</p>
            <button
              type="button"
              className="admin-premium-interactive"
              disabled={saving || hardLocked}
              onClick={openSubmitConfirm}
            >
              Slayt filmini oluştur
            </button>
          </div>
        )}
        {status === "rendering" || status === "queued" ? (
          <p className="admin-aftermovie__status-note" role="status">
            Düğün filminiz hazırlanıyor.
          </p>
        ) : null}
        {status === "revision_requested" && aftermovie?.revisionNote ? (
          <p className="admin-aftermovie__status-note">
            Düzenleme talebiniz: {aftermovie.revisionNote}
          </p>
        ) : null}
        <dl className="admin-aftermovie__meta">
          <div>
            <dt>Düğün tarihi</dt>
            <dd>{formatDisplayDate(couple.weddingDate)}</dd>
          </div>
          <div>
            <dt>Yayın</dt>
            <dd>
              {aftermovie?.publishAt
                ? formatDisplayDate(aftermovie.publishAt.slice(0, 10))
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Seçilen anılar</dt>
            <dd>
              {selectedIds.length} anı · {photoCount} foto · {videoCount} video
            </dd>
          </div>
        </dl>
      </section>

      {/* 2. Filmde Kullanılacak Anılar */}
      <section className="admin-premium-card admin-aftermovie__picker">
        <div className="admin-aftermovie__toolbar">
          <div>
            <h3 className="admin-aftermovie__section-title">
              Filmde Kullanılacak Anılar
            </h3>
            <p className="admin-aftermovie__lead">
              Düğün filminizde yer almasını istediğiniz fotoğraf ve videoları
              seçin.
            </p>
          </div>
          <p className="admin-aftermovie__count" aria-live="polite">
            {selectedIds.length} anı seçildi
          </p>
        </div>

        <div className="admin-premium-toolbar__filters admin-aftermovie__filters">
          {(
            [
              ["all", "Tümü"],
              ["photo", "Fotoğraflar"],
              ["video", "Videolar"],
              ["selected", "Seçilenler"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn(
                "admin-premium-filter-btn",
                filter === id && "admin-premium-filter-btn--active",
              )}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="admin-aftermovie__hint">
          En iyi sonuç için 20–{AFTERMOVIE_PHOTO_RECOMMENDED > 20 ? "35" : AFTERMOVIE_PHOTO_RECOMMENDED}{" "}
          fotoğraf ve birkaç kısa video seçmenizi öneririz. (Min{" "}
          {AFTERMOVIE_PHOTO_MIN} foto · max {AFTERMOVIE_PHOTO_MAX} foto /{" "}
          {AFTERMOVIE_VIDEO_MAX} video)
        </p>
        {selectable.length > 6 ? (
          <p className="admin-aftermovie__hint">
            {selectable.length} anı listeleniyor — ızgarayı aşağı kaydırarak
            devamını görün.
          </p>
        ) : null}

        {loadError && selectable.length === 0 ? (
          <div className="admin-aftermovie__empty" role="alert">
            <p>Anılar yüklenemedi. Lütfen tekrar deneyin.</p>
            <p className="admin-aftermovie__hint">{loadError}</p>
            <button
              type="button"
              className="admin-premium-interactive"
              onClick={() => void load()}
            >
              Tekrar Dene
            </button>
          </div>
        ) : selectable.length === 0 ? (
          <div className="admin-aftermovie__empty">
            <p>Henüz seçilebilecek fotoğraf veya video yok.</p>
            <p className="admin-aftermovie__hint">
              Misafirlerin yüklediği anılar burada görünecek.
            </p>
            <button
              type="button"
              className="admin-premium-interactive"
              onClick={() => onOpenGallery?.()}
            >
              Yüklenen Anıları Gör
            </button>
          </div>
        ) : (
          <div className="admin-aftermovie__grid" role="listbox" aria-label="Film anıları">
            {visible.map((item) => {
              const active = selectedIds.includes(item.mediaId);
              return (
                <button
                  key={item.mediaId}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-label={`${active ? "Seçili" : "Seçilmedi"}: ${item.guestName}, ${item.mediaType === "video" ? "video" : "fotoğraf"}`}
                  className={cn(
                    "admin-aftermovie__tile",
                    active && "is-selected",
                  )}
                  disabled={!canEditSelection}
                  onClick={() => toggle(item.mediaId, item.mediaType)}
                >
                  {brokenThumbs[item.mediaId] ? (
                    <div className="admin-aftermovie__thumb-fallback">
                      Dosya kullanılamıyor
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.proxyUrl}
                      alt=""
                      loading="lazy"
                      onError={() =>
                        setBrokenThumbs((prev) => ({
                          ...prev,
                          [item.mediaId]: true,
                        }))
                      }
                    />
                  )}
                  {active ? (
                    <span className="admin-aftermovie__check" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                  <span className="admin-aftermovie__tile-meta">
                    <strong>
                      {item.mediaType === "video" ? "Video" : "Foto"}
                    </strong>
                    <span>{item.guestName}</span>
                    {item.createdAt ? (
                      <span className="admin-aftermovie__tile-date">
                        {formatDisplayDate(item.createdAt.slice(0, 10))}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Seçilen Anılar */}
      <section className="admin-premium-card">
        <h3 className="admin-aftermovie__section-title">Seçilen Anılar</h3>
        {selectedMeta.length === 0 ? (
          <p className="admin-aftermovie__hint">
            Henüz anı seçilmedi. Yukarıdaki ızgaradan fotoğraf ve video seçin.
          </p>
        ) : (
          <ul className="admin-aftermovie__order">
            {selectedMeta.map((item, index) => (
              <li key={item.mediaId}>
                <span className="admin-aftermovie__order-index">{index + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.proxyUrl}
                  alt=""
                  className="admin-aftermovie__order-thumb"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
                <span className="admin-aftermovie__order-label">
                  {item.guestName} ·{" "}
                  {item.mediaType === "video" ? "Video" : "Foto"}
                </span>
                <div className="admin-aftermovie__order-actions">
                  <button
                    type="button"
                    disabled={!canEditSelection}
                    onClick={() => moveOrdered(item.mediaId, -1)}
                    aria-label="Yukarı taşı"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={!canEditSelection}
                    onClick={() => moveOrdered(item.mediaId, 1)}
                    aria-label="Aşağı taşı"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={!canEditSelection}
                    onClick={() => removeSelected(item.mediaId)}
                    aria-label="Seçimden çıkar"
                  >
                    Kaldır
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Actions */}
      <div className="admin-aftermovie__actions admin-aftermovie__actions--sticky">
        <button
          type="button"
          className="admin-premium-interactive admin-aftermovie__cta-primary"
          disabled={saving || hardLocked}
          onClick={openSubmitConfirm}
        >
          After’ı Hazırla
        </button>
        {submitBlockedReason ? (
          <p className="admin-aftermovie__hint" role="status">
            {submitBlockedReason}
          </p>
        ) : (
          <p className="admin-aftermovie__hint" role="status">
            {photoCount} fotoğraf seçili. Gönderince slayt film oluşur ve
            yayınlanır.
          </p>
        )}
        {aftermovie?.status === "failed" ? (
          <button
            type="button"
            className="admin-premium-interactive"
            disabled={saving}
            onClick={() => void postAction("retry").then(() => load())}
          >
            Seçime Dön
          </button>
        ) : null}
      </div>

      <AdminConfirmModal
        open={submitConfirmOpen}
        title="After’ı hazırla"
        description="Seçtiğiniz anılar kaydedilir, slayt filme dönüşür ve yayın tarihine göre NFC sayfasında yayınlanır. Emin misiniz?"
        confirmLabel="Evet, After’ı hazırla"
        cancelLabel="Vazgeç"
        loading={saving}
        loadingLabel="Hazırlanıyor…"
        onConfirm={() => void handleSubmitConfirm()}
        onCancel={() => setSubmitConfirmOpen(false)}
      />
    </div>
  );
}
