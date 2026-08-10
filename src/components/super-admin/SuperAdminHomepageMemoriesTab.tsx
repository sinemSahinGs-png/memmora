"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HomepageImageCropEditor } from "@/components/super-admin/HomepageImageCropEditor";
import {
  getMemoriesFrameCropStyle,
  type MemoriesFrameCrop,
} from "@/lib/memories-frame-crop";
import type { HomepageSharedMemory } from "@/lib/supabase/homepage-memories";

type PendingUpload = {
  file: File;
  previewUrl: string;
};

const MIGRATION_HINT =
  "Supabase SQL Editor’de supabase/migration-homepage-shared-memories.sql dosyasını çalıştırın.";

export function SuperAdminHomepageMemoriesTab() {
  const [items, setItems] = useState<HomepageSharedMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/homepage-memories", {
        credentials: "same-origin",
      });
      const json = (await res.json()) as {
        items?: HomepageSharedMemory[];
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        const missing =
          /homepage_shared_memories|schema cache|PGRST205/i.test(
            json.error ?? "",
          );
        setNeedsMigration(missing);
        setError(
          missing
            ? `Görsel tablosu henüz oluşturulmamış. ${MIGRATION_HINT}`
            : (json.error ?? "Liste yüklenemedi."),
        );
        setItems([]);
        return;
      }
      setNeedsMigration(false);
      setItems(json.items ?? []);
    } catch {
      setError("Liste yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    };
  }, [pending]);

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Sadece JPEG, PNG veya WebP yükleyin.");
      return;
    }
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending({ file, previewUrl: URL.createObjectURL(file) });
    setEditingId(null);
    setError(null);
    setMessage(null);
  };

  const uploadWithCrop = async (crop: MemoriesFrameCrop) => {
    if (!pending) return;
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", pending.file);
      form.set("frameZoom", String(crop.zoom));
      form.set("framePanX", String(crop.panX));
      form.set("framePanY", String(crop.panY));
      form.set("guestName", "Misafir");
      form.set("category", "Anı");
      form.set("title", pending.file.name.replace(/\.[^.]+$/, ""));
      form.set("sortOrder", String(items.length));
      form.set("isActive", "true");

      const res = await fetch("/api/admin/homepage-memories", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const json = (await res.json()) as {
        item?: HomepageSharedMemory;
        error?: string;
      };
      if (!res.ok || !json.item) {
        const missing = /homepage_shared_memories|schema cache|PGRST205|bucket/i.test(
          json.error ?? "",
        );
        setNeedsMigration(missing);
        setError(
          missing
            ? `Yükleme için veritabanı hazır değil. ${MIGRATION_HINT}`
            : (json.error ?? "Yükleme başarısız."),
        );
        return;
      }
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessage("Görsel yüklendi ve ölçek kaydedildi.");
      await load();
    } catch {
      setError("Yükleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const saveCropEdit = async (crop: MemoriesFrameCrop) => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/homepage-memories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          frameZoom: crop.zoom,
          framePanX: crop.panX,
          framePanY: crop.panY,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Ölçek kaydedilemedi.");
        return;
      }
      setEditingId(null);
      setMessage("Ölçek güncellendi.");
      await load();
    } catch {
      setError("Ölçek kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const patchItem = async (
    id: string,
    body: Record<string, unknown>,
    okMessage: string,
  ) => {
    setError(null);
    const res = await fetch(`/api/admin/homepage-memories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Güncelleme başarısız.");
      return;
    }
    setMessage(okMessage);
    await load();
  };

  const removeItem = async (id: string) => {
    if (!window.confirm("Bu görseli silmek istiyor musunuz?")) return;
    setError(null);
    const res = await fetch(`/api/admin/homepage-memories/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Silme başarısız.");
      return;
    }
    setMessage("Görsel silindi.");
    await load();
  };

  const editingItem = items.find((item) => item.id === editingId) ?? null;

  return (
    <div className="sa-media">
      <div className="sa-media__intro">
        <div>
          <h2 className="sa-media__heading">Anasayfa görselleri</h2>
          <p className="sa-media__lead">
            Shared Memories halkası ve Memoora After için görsel yükleyin.
            Ölçek ve konumu önizlemede ayarlayın.
          </p>
        </div>
        <button
          type="button"
          className="sa-btn sa-btn--ghost"
          onClick={() => void load()}
        >
          Yenile
        </button>
      </div>

      {needsMigration ? (
        <div className="sa-media__alert" role="alert">
          <p className="sa-media__alert-title">Veritabanı kurulumu gerekli</p>
          <p className="sa-media__alert-body">
            {MIGRATION_HINT} Ardından bu sayfayı yenileyin.
          </p>
        </div>
      ) : null}

      {error && !needsMigration ? (
        <p className="sa-media__error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="sa-media__ok">{message}</p> : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          onPickFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <div
        className={`sa-media__drop${dragOver ? " sa-media__drop--active" : ""}${needsMigration ? " sa-media__drop--disabled" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!needsMigration) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (needsMigration) return;
          onPickFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => {
          if (!needsMigration) fileRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!needsMigration) fileRef.current?.click();
          }
        }}
      >
        <p className="sa-media__drop-title">Görsel yükle</p>
        <p className="sa-media__drop-sub">
          Sürükleyip bırakın veya tıklayın · JPEG / PNG / WebP
        </p>
        <span className="sa-btn sa-btn--primary sa-media__drop-cta">
          Dosya seç
        </span>
      </div>

      {loading ? (
        <p className="sa-media__muted">Görseller yükleniyor…</p>
      ) : items.length === 0 ? (
        <div className="sa-media__empty">
          <p className="sa-media__empty-title">Henüz görsel yok</p>
          <p className="sa-media__empty-body">
            İlk görseli yüklediğinizde anasayfa halkası bu seti kullanır.
            Şimdilik statik fallback gösterilir.
          </p>
        </div>
      ) : (
        <ul className="sa-media__grid">
          {items.map((item) => {
            const cropStyle = getMemoriesFrameCropStyle({
              zoom: item.frameZoom,
              panX: item.framePanX,
              panY: item.framePanY,
            });
            return (
              <li key={item.id} className="sa-media-card">
                <div className="sa-media-card__preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.publicUrl}
                    alt={item.title || "Anı"}
                    style={cropStyle}
                  />
                  {!item.isActive ? (
                    <span className="sa-media-card__badge">Pasif</span>
                  ) : null}
                </div>
                <div className="sa-media-card__body">
                  <label className="sa-field">
                    <span>Başlık</span>
                    <input
                      value={item.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id ? { ...row, title } : row,
                          ),
                        );
                      }}
                      onBlur={() =>
                        void patchItem(
                          item.id,
                          { title: item.title },
                          "Başlık kaydedildi.",
                        )
                      }
                    />
                  </label>
                  <div className="sa-media-card__row">
                    <label className="sa-field">
                      <span>Misafir</span>
                      <input
                        value={item.guestName}
                        onChange={(e) => {
                          const guestName = e.target.value;
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, guestName } : row,
                            ),
                          );
                        }}
                        onBlur={() =>
                          void patchItem(
                            item.id,
                            { guestName: item.guestName },
                            "İsim kaydedildi.",
                          )
                        }
                      />
                    </label>
                    <label className="sa-field sa-field--narrow">
                      <span>Sıra</span>
                      <input
                        type="number"
                        value={item.sortOrder}
                        onChange={(e) => {
                          const sortOrder = Number(e.target.value) || 0;
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, sortOrder } : row,
                            ),
                          );
                        }}
                        onBlur={() =>
                          void patchItem(
                            item.id,
                            { sortOrder: item.sortOrder },
                            "Sıra kaydedildi.",
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="sa-media-card__actions">
                    <button
                      type="button"
                      className="sa-btn sa-btn--primary"
                      onClick={() => {
                        setPending(null);
                        setEditingId(item.id);
                      }}
                    >
                      Ölçekle
                    </button>
                    <button
                      type="button"
                      className="sa-btn sa-btn--ghost"
                      onClick={() =>
                        void patchItem(
                          item.id,
                          { isActive: !item.isActive },
                          item.isActive
                            ? "Pasifleştirildi."
                            : "Aktifleştirildi.",
                        )
                      }
                    >
                      {item.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                    <button
                      type="button"
                      className="sa-btn sa-btn--danger"
                      onClick={() => void removeItem(item.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pending ? (
        <HomepageImageCropEditor
          previewUrl={pending.previewUrl}
          filename={pending.file.name}
          saving={saving}
          savingLabel="Yükleniyor…"
          confirmLabel="Kaydet ve yükle"
          onConfirm={uploadWithCrop}
          onCancel={() => {
            URL.revokeObjectURL(pending.previewUrl);
            setPending(null);
          }}
          error={error}
        />
      ) : null}

      {editingItem ? (
        <HomepageImageCropEditor
          previewUrl={editingItem.publicUrl}
          filename={editingItem.title || editingItem.id}
          initialCrop={{
            zoom: editingItem.frameZoom,
            panX: editingItem.framePanX,
            panY: editingItem.framePanY,
          }}
          saving={saving}
          savingLabel="Kaydediliyor…"
          confirmLabel="Ölçeği kaydet"
          onConfirm={saveCropEdit}
          onCancel={() => setEditingId(null)}
          error={error}
        />
      ) : null}
    </div>
  );
}
