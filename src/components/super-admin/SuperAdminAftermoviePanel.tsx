"use client";

import { useCallback, useEffect, useState } from "react";
import type { CoupleAftermovie } from "@/lib/aftermovie/types";
import { adminStatusLabel } from "@/lib/aftermovie/lifecycle";
import { formatDisplayDate } from "@/lib/mock-data";
import { getMediaViewUrl } from "@/lib/admin-media-urls";

type ProductionItem = CoupleAftermovie & {
  coupleSlug?: string;
  coupleTitle?: string;
  weddingDate?: string | null;
};

export function SuperAdminAftermoviePanel() {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    aftermovie: CoupleAftermovie;
    couple: {
      id: string;
      slug: string;
      display_title: string | null;
      names: string | null;
      wedding_date: string | null;
    } | null;
    playbackUrl: string | null;
    posterUrl: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [globalMusicTitle, setGlobalMusicTitle] = useState<string>("Memoora After Theme");

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/aftermovie");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yüklenemedi");
      setItems(json.items ?? []);
      if (json.globalMusic?.title) {
        setGlobalMusicTitle(json.globalMusic.title);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Liste yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (coupleId: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/aftermovie?coupleId=${coupleId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Detay yüklenemedi");
      setDetail(json);
      setNotes(json.aftermovie?.productionNotes ?? "");
      setSelectedId(coupleId);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Detay yüklenemedi");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const postJson = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/aftermovie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "İşlem başarısız");
      if (detail?.couple?.id) await loadDetail(detail.couple.id);
      await loadList();
      setMessage("Kaydedildi");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (action: "upload-final-video" | "upload-poster", file: File) => {
    if (!detail?.aftermovie || !detail.couple?.slug) return;
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("action", action);
      form.set("aftermovieId", detail.aftermovie.id);
      form.set("coupleSlug", detail.couple.slug);
      form.set("file", file);
      if (notes) form.set("productionNotes", notes);
      const res = await fetch("/api/admin/aftermovie", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
      await loadDetail(detail.couple.id);
      await loadList();
      setMessage(action === "upload-final-video" ? "Final video yüklendi" : "Poster yüklendi");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Yükleme hatası");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-champagne/80">Manuel prodüksiyon</p>
      <p className="text-sm text-white/60">
        Film Müziği: <span className="text-champagne/90">{globalMusicTitle}</span>
        <span className="text-white/40"> (tüm çiftler · salt okunur)</span>
      </p>
      {message ? <p className="text-sm text-white/70">{message}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-white/40">Yükleniyor…</p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  selectedId === item.coupleId
                    ? "border-champagne/50 bg-white/10"
                    : "border-white/10 bg-white/5"
                }`}
                onClick={() => void loadDetail(item.coupleId)}
              >
                <span className="block text-white/90">
                  {item.coupleTitle ?? item.coupleSlug ?? item.coupleId}
                </span>
                <span className="block text-xs text-white/50">
                  {adminStatusLabel(item.status)}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          {!detail ? (
            <p className="text-sm text-white/50">
              Prodüksiyon için bir çift seçin.
            </p>
          ) : (
            <>
              <header>
                <h2 className="font-serif text-xl text-white/95">
                  {detail.couple?.display_title || detail.couple?.names}
                </h2>
                <p className="text-sm text-white/60">
                  {detail.couple?.wedding_date
                    ? formatDisplayDate(detail.couple.wedding_date)
                    : "—"}{" "}
                  · {adminStatusLabel(detail.aftermovie.status)}
                </p>
              </header>

              <dl className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                <div>
                  <dt className="text-white/40">Açılış</dt>
                  <dd>{detail.aftermovie.openingText ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Kapanış</dt>
                  <dd>{detail.aftermovie.closingText ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Film Müziği</dt>
                  <dd>{globalMusicTitle} (global)</dd>
                </div>
                <div>
                  <dt className="text-white/40">Yayın</dt>
                  <dd>
                    {detail.aftermovie.publishAt
                      ? formatDisplayDate(detail.aftermovie.publishAt.slice(0, 10))
                      : "—"}
                  </dd>
                </div>
              </dl>

              {detail.aftermovie.revisionNote ? (
                <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                  Revizyon: {detail.aftermovie.revisionNote}
                </p>
              ) : null}

              <section>
                <h3 className="mb-2 text-sm uppercase tracking-wider text-white/50">
                  Seçilen medya ({detail.aftermovie.media?.length ?? 0})
                </h3>
                <ul className="grid max-h-64 grid-cols-3 gap-2 overflow-auto sm:grid-cols-4">
                  {(detail.aftermovie.media ?? []).map((m) => (
                    <li key={m.id} className="overflow-hidden rounded-md bg-black/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaViewUrl(m.mediaId, detail.couple!.slug)}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                      <a
                        className="block truncate px-1 py-0.5 text-[10px] text-champagne/80"
                        href={getMediaViewUrl(m.mediaId, detail.couple!.slug)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {m.mediaType} · aç
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <label className="block text-sm text-white/70">
                Prodüksiyon notları
                <textarea
                  className="memory-input mt-1 min-h-20 w-full"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "save-notes",
                      aftermovieId: detail.aftermovie.id,
                      productionNotes: notes,
                    })
                  }
                >
                  Notları Kaydet
                </button>
                <label className="admin-premium-interactive cursor-pointer">
                  Final MP4 Yükle
                  <input
                    type="file"
                    accept="video/mp4"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload("upload-final-video", file);
                    }}
                  />
                </label>
                <label className="admin-premium-interactive cursor-pointer">
                  Poster Yükle
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void upload("upload-poster", file);
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <label className="block flex-1 text-sm text-white/70">
                  Harici HTTPS video URL
                  <input
                    className="memory-input mt-1 w-full"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </label>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "register-external-url",
                      aftermovieId: detail.aftermovie.id,
                      coupleSlug: detail.couple?.slug,
                      externalVideoUrl: externalUrl,
                      productionNotes: notes,
                    })
                  }
                >
                  Harici URL Kaydet
                </button>
              </div>

              {detail.playbackUrl ? (
                <video
                  className="max-h-72 w-full rounded-lg bg-black"
                  src={detail.playbackUrl}
                  controls
                  playsInline
                  poster={detail.posterUrl ?? undefined}
                />
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "mark-ready",
                      aftermovieId: detail.aftermovie.id,
                    })
                  }
                >
                  Ön İzlemeye Hazır
                </button>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "return-to-selection",
                      aftermovieId: detail.aftermovie.id,
                    })
                  }
                >
                  Seçime Döndür
                </button>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "resolve-revision",
                      aftermovieId: detail.aftermovie.id,
                    })
                  }
                >
                  Revizyonu Üstlen
                </button>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "report-error",
                      aftermovieId: detail.aftermovie.id,
                      renderError: "Prodüksiyon tamamlanamadı",
                    })
                  }
                >
                  Hata Bildir
                </button>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "unpublish",
                      aftermovieId: detail.aftermovie.id,
                    })
                  }
                >
                  Yayından Kaldır
                </button>
                <button
                  type="button"
                  className="admin-premium-interactive"
                  disabled={busy}
                  onClick={() =>
                    void postJson({
                      action: "force-publish",
                      aftermovieId: detail.aftermovie.id,
                    })
                  }
                >
                  Zorla Yayınla
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
