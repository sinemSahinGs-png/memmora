"use client";

import { useEffect, useState } from "react";
import { GoldButton } from "../GoldButton";
import { GlassCard } from "../GlassCard";
import type { Couple, CoupleCreateInput, CoupleStatus } from "@/lib/types";
import { slugifyDisplayTitle } from "@/lib/slugify";
import { DEFAULT_HERO_SUBTITLE, DEFAULT_HERO_VIDEO } from "@/lib/supabase/constants";

interface SuperAdminCoupleFormProps {
  mode: "create" | "edit";
  initial?: Couple | null;
  onSubmit: (input: CoupleCreateInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const emptyForm = (): CoupleCreateInput => ({
  brideName: "",
  groomName: "",
  displayTitle: "",
  slug: "",
  weddingDate: "",
  heroSubtitle: DEFAULT_HERO_SUBTITLE,
  heroVideoUrl: DEFAULT_HERO_VIDEO,
  adminPin: "0606",
  quizEnabled: true,
  playlistTitle: "",
  playlistArtist: "",
  playlistUrl: "",
  brideEmail: "",
  groomEmail: "",
  status: "active",
});

export function SuperAdminCoupleForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  loading = false,
}: SuperAdminCoupleFormProps) {
  const [form, setForm] = useState<CoupleCreateInput>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        brideName: initial.brideName,
        groomName: initial.groomName,
        displayTitle: initial.displayTitle,
        slug: initial.slug,
        weddingDate: initial.weddingDate,
        heroSubtitle: initial.heroSubtitle,
        heroVideoUrl: initial.heroVideoUrl,
        adminPin: initial.adminPin ?? "0606",
        quizEnabled: initial.quizEnabled,
        playlistTitle: initial.playlistTitle,
        playlistArtist: initial.playlistArtist,
        playlistUrl: initial.playlistUrl,
        brideEmail: initial.brideEmail,
        groomEmail: initial.groomEmail,
        status: initial.status,
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm());
      setSlugTouched(false);
    }
  }, [mode, initial]);

  const setField = <K extends keyof CoupleCreateInput>(
    key: K,
    value: CoupleCreateInput[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (
        (key === "displayTitle" || key === "groomName" || key === "brideName") &&
        !slugTouched
      ) {
        const title =
          key === "displayTitle"
            ? String(value)
            : prev.displayTitle ||
              `${key === "groomName" ? value : prev.groomName} & ${key === "brideName" ? value : prev.brideName}`;
        next.slug = slugifyDisplayTitle(title);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <GlassCard strong className="!rounded-2xl !p-5 sm:!p-6">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
        {mode === "create" ? "Yeni Çift Oluştur" : "Çift Düzenle"}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Damat adı">
            <input
              className="memory-input memory-input-compact"
              value={form.groomName}
              onChange={(e) => setField("groomName", e.target.value)}
              required
            />
          </Field>
          <Field label="Gelin adı">
            <input
              className="memory-input memory-input-compact"
              value={form.brideName}
              onChange={(e) => setField("brideName", e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Görünen başlık">
          <input
            className="memory-input memory-input-compact"
            value={form.displayTitle}
            onChange={(e) => setField("displayTitle", e.target.value)}
            placeholder="Mert & İrem"
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug">
            <input
              className="memory-input memory-input-compact"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              placeholder="mert-irem"
              required
            />
          </Field>
          <Field label="Düğün tarihi">
            <input
              type="date"
              className="memory-input memory-input-compact"
              value={form.weddingDate}
              onChange={(e) => setField("weddingDate", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gelin e-posta">
            <input
              type="email"
              className="memory-input memory-input-compact"
              value={form.brideEmail ?? ""}
              onChange={(e) => setField("brideEmail", e.target.value)}
            />
          </Field>
          <Field label="Damat e-posta">
            <input
              type="email"
              className="memory-input memory-input-compact"
              value={form.groomEmail ?? ""}
              onChange={(e) => setField("groomEmail", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Hero subtitle">
          <input
            className="memory-input memory-input-compact"
            value={form.heroSubtitle}
            onChange={(e) => setField("heroSubtitle", e.target.value)}
          />
        </Field>

        <Field label="Hero video path">
          <input
            className="memory-input memory-input-compact"
            value={form.heroVideoUrl}
            onChange={(e) => setField("heroVideoUrl", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Çift admin PIN">
            <input
              className="memory-input memory-input-compact"
              value={form.adminPin}
              onChange={(e) => setField("adminPin", e.target.value)}
              inputMode="numeric"
            />
          </Field>
          <Field label="Durum">
            <select
              className="memory-input memory-input-compact"
              value={form.status}
              onChange={(e) => setField("status", e.target.value as CoupleStatus)}
            >
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={form.quizEnabled}
            onChange={(e) => setField("quizEnabled", e.target.checked)}
            className="accent-champagne"
          />
          Quiz aktif
        </label>

        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
          Playlist
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Şarkı adı">
            <input
              className="memory-input memory-input-compact"
              value={form.playlistTitle}
              onChange={(e) => setField("playlistTitle", e.target.value)}
            />
          </Field>
          <Field label="Sanatçı">
            <input
              className="memory-input memory-input-compact"
              value={form.playlistArtist}
              onChange={(e) => setField("playlistArtist", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Spotify / playlist URL">
          <input
            className="memory-input memory-input-compact"
            value={form.playlistUrl}
            onChange={(e) => setField("playlistUrl", e.target.value)}
            placeholder="https://open.spotify.com/..."
          />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <GoldButton type="submit" variant="primary" className="!text-[10px]" disabled={loading}>
            {loading ? "Kaydediliyor…" : "Kaydet"}
          </GoldButton>
          <GoldButton type="button" variant="secondary" className="!text-[10px]" onClick={onCancel}>
            Vazgeç
          </GoldButton>
        </div>
      </form>
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}
