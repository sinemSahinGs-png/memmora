"use client";

import { useState } from "react";
import type { Couple, CoupleSettingsInput } from "@/lib/types";
import { buildCoupleDisplayTitle } from "@/lib/onboarding-utils";
import {
  updateCoupleSettings,
  DEFAULT_INVITATION_MESSAGE,
} from "@/lib/supabase/couples";
import { DEFAULT_HERO_SUBTITLE } from "@/lib/supabase/constants";
import { buildCoupleInviteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

interface AdminCoupleSettingsProps {
  couple: Couple;
  onSaved: (couple: Couple) => void;
  onExportNotes?: () => void;
  onExportQuiz?: () => void;
  onExportMemories?: () => void;
  onManageQuiz?: () => void;
}

export function AdminCoupleSettings({
  couple,
  onSaved,
  onExportNotes,
  onExportQuiz,
  onExportMemories,
  onManageQuiz,
}: AdminCoupleSettingsProps) {
  const fallbackPin = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "0606";

  const [form, setForm] = useState<CoupleSettingsInput>({
    groomName: couple.groomName,
    brideName: couple.brideName,
    displayTitle: couple.displayTitle,
    slug: couple.slug,
    weddingDate: couple.weddingDate,
    heroSubtitle: couple.heroSubtitle,
    heroVideoUrl: couple.heroVideoUrl,
    quizEnabled: couple.quizEnabled,
    quizWinnerName: couple.quizWinnerName ?? "",
    playlistTitle: couple.playlistTitle,
    playlistArtist: couple.playlistArtist,
    playlistUrl: couple.playlistUrl,
    brideEmail: couple.brideEmail,
    groomEmail: couple.groomEmail,
    driveFolderUrl: couple.driveFolderUrl,
    mediaUploadEnabled: couple.mediaUploadEnabled,
    adminPin: couple.adminPin ?? fallbackPin,
    status: couple.status,
    couplePhotoUrl: couple.couplePhotoUrl ?? "",
    invitationEnabled: couple.invitationEnabled,
    invitationTitle: couple.invitationTitle,
    invitationMessage: couple.invitationMessage,
    venueName: couple.venueName,
    venueAddress: couple.venueAddress,
    venueMapsUrl: couple.venueMapsUrl,
    weddingTime: couple.weddingTime,
    rsvpEnabled: couple.rsvpEnabled,
    rsvpDeadline: couple.rsvpDeadline,
    maxGuestCount: couple.maxGuestCount,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inviteUrl = buildCoupleInviteUrl(form.slug);
  const inviteShareText = `${form.displayTitle || couple.names} düğün davetiyesi için katılımınızı buradan bildirebilirsiniz: ${inviteUrl}`;

  const handleChange = (
    field: keyof CoupleSettingsInput,
    value: string | boolean | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload: CoupleSettingsInput = {
      ...form,
      displayTitle: buildCoupleDisplayTitle(form.groomName, form.brideName),
    };

    const result = await updateCoupleSettings(couple.id, payload);

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setMessage("Ayarlar kaydedildi.");
    onSaved(result.couple);
    setSaving(false);
  };

  return (
    <div className="admin-premium-settings">
      <form onSubmit={handleSubmit} className="admin-premium-settings__form">
        <SettingsCard
          eyebrow="Sayfa Bilgileri"
          title="Çift & mesaj"
          description="Misafir sayfasında görünen isimler ve kısa tanıtım metni."
          revealClass="admin-premium-settings__card--d1"
        >
          <div className="admin-premium-settings__grid admin-premium-settings__grid--2">
            <Field label="Gelin adı">
              <input
                className="admin-premium-settings__input"
                value={form.brideName}
                onChange={(e) => handleChange("brideName", e.target.value)}
                placeholder="Gelin adı"
              />
            </Field>
            <Field label="Damat adı">
              <input
                className="admin-premium-settings__input"
                value={form.groomName}
                onChange={(e) => handleChange("groomName", e.target.value)}
                placeholder="Damat adı"
              />
            </Field>
          </div>

          <Field label="Düğün tarihi">
            <input
              type="date"
              className="admin-premium-settings__input admin-premium-settings__input--date"
              value={form.weddingDate}
              onChange={(e) => handleChange("weddingDate", e.target.value)}
            />
          </Field>

          <Field label="Ana slogan / kısa açıklama" hint="Hero alanında görünür.">
            <input
              className="admin-premium-settings__input"
              value={form.heroSubtitle}
              onChange={(e) => handleChange("heroSubtitle", e.target.value)}
              placeholder={DEFAULT_HERO_SUBTITLE}
            />
          </Field>
        </SettingsCard>

        <SettingsCard
          eyebrow="E-Davetiye"
          title="Davetiye & katılım"
          description="WhatsApp veya link ile paylaşabileceğiniz premium e-davetiye sayfası."
          revealClass="admin-premium-settings__card--d2"
        >
          <div className="admin-premium-settings__switches">
            <PremiumSwitch
              label="E-Davetiye aktif"
              hint="Kapalıyken davetiye sayfası görünmez."
              checked={form.invitationEnabled}
              onChange={(checked) => handleChange("invitationEnabled", checked)}
            />
            <PremiumSwitch
              label="Katılım formu aktif"
              hint="Misafirler katılım durumunu iletebilir."
              checked={form.rsvpEnabled}
              onChange={(checked) => handleChange("rsvpEnabled", checked)}
            />
          </div>

          <Field label="Davetiye başlığı" hint="Boş bırakılırsa çift isimleri kullanılır.">
            <input
              className="admin-premium-settings__input"
              value={form.invitationTitle}
              onChange={(e) => handleChange("invitationTitle", e.target.value)}
              placeholder={form.displayTitle}
            />
          </Field>

          <Field label="Davetiye metni">
            <textarea
              className="admin-premium-settings__textarea"
              value={form.invitationMessage}
              onChange={(e) => handleChange("invitationMessage", e.target.value)}
              placeholder={DEFAULT_INVITATION_MESSAGE}
              rows={3}
            />
          </Field>

          <div className="admin-premium-settings__grid admin-premium-settings__grid--2">
            <Field
              label="Mekan adı"
              hint="Doldurulursa davetiye sayfasının üstünde görünür."
            >
              <input
                className="admin-premium-settings__input"
                value={form.venueName}
                onChange={(e) => handleChange("venueName", e.target.value)}
                placeholder="Örn. Garden Venue"
              />
            </Field>
            <Field label="Düğün saati">
              <input
                className="admin-premium-settings__input"
                value={form.weddingTime}
                onChange={(e) => handleChange("weddingTime", e.target.value)}
                placeholder="19:00"
              />
            </Field>
          </div>

          <Field
            label="Mekan adresi"
            hint="Mekan adı veya adres girilmezse davetiyede konum gösterilmez."
          >
            <input
              className="admin-premium-settings__input"
              value={form.venueAddress}
              onChange={(e) => handleChange("venueAddress", e.target.value)}
              placeholder="Adres"
            />
          </Field>

          <Field label="Konum linki" hint="Harita veya yol tarifi bağlantısı.">
            <input
              type="url"
              className="admin-premium-settings__input"
              value={form.venueMapsUrl}
              onChange={(e) => handleChange("venueMapsUrl", e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
          </Field>

          <div className="admin-premium-settings__grid admin-premium-settings__grid--2">
            <Field label="Katılım son tarihi">
              <input
                type="date"
                className="admin-premium-settings__input admin-premium-settings__input--date"
                value={form.rsvpDeadline}
                onChange={(e) => handleChange("rsvpDeadline", e.target.value)}
              />
            </Field>
            <Field label="Maksimum kişi sayısı">
              <input
                type="number"
                min={1}
                max={20}
                className="admin-premium-settings__input"
                value={form.maxGuestCount}
                onChange={(e) =>
                  handleChange("maxGuestCount", Number(e.target.value) || 5)
                }
              />
            </Field>
          </div>

          <div className="admin-premium-settings__invite-actions">
            <button
              type="button"
              className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(inviteUrl);
                  setMessage("Davetiye linki kopyalandı.");
                } catch {
                  setError("Link kopyalanamadı.");
                }
              }}
            >
              Linki Kopyala
            </button>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive"
            >
              E-Davetiyeye Git
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(inviteShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive admin-premium-outline-btn--whatsapp"
            >
              WhatsApp&apos;ta Paylaş
            </a>
          </div>
        </SettingsCard>

        <SettingsCard
          eyebrow="Galeri & Anılar"
          title="Memoora arşivi"
          description="Misafir galerisi ve anılarınız panelde görüntülenir. Fotoğraf ve videoları önizleyebilir, indirebilirsiniz."
          revealClass="admin-premium-settings__card--d2b"
        >
          <p className="admin-premium-settings__archive-note">
            Galeri sekmesinden misafir paylaşımlarını, Anılar sekmesinden çift
            fotoğraflarınızı yönetebilirsiniz.
          </p>
        </SettingsCard>

        <SettingsCard
          eyebrow="Erişim"
          title="Erişim & veriler"
          description="Admin girişi, sayfa durumu ve misafir özellikleri."
          revealClass="admin-premium-settings__card--d3"
        >
          <Field label="Admin PIN" hint="Panel girişi için 4 haneli kod.">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              className="admin-premium-settings__input admin-premium-settings__input--pin"
              value={form.adminPin}
              onChange={(e) => handleChange("adminPin", e.target.value)}
              placeholder="0606"
            />
          </Field>

          <div className="admin-premium-settings__switches">
            <PremiumSwitch
              label="Sayfa yayında"
              hint="Kapalıyken misafirler siteyi göremez."
              checked={form.status === "active"}
              onChange={(checked) =>
                handleChange("status", checked ? "active" : "passive")
              }
            />
            <PremiumSwitch
              label="Medya yükleme açık"
              hint="Misafirler fotoğraf / video yükleyebilir."
              checked={form.mediaUploadEnabled}
              onChange={(checked) => handleChange("mediaUploadEnabled", checked)}
            />
            <PremiumSwitch
              label="Quiz açık"
              hint="Misafir quiz bölümü sitede görünür."
              checked={form.quizEnabled}
              onChange={(checked) => handleChange("quizEnabled", checked)}
            />
          </div>

          {(onExportNotes || onExportQuiz || onExportMemories) && (
            <div className="admin-premium-settings__export-block">
              <p className="admin-premium-settings__export-label">Verileri dışa aktar</p>
              <div className="admin-premium-settings__actions admin-premium-settings__actions--compact">
                {onExportNotes ? (
                  <button
                    type="button"
                    onClick={onExportNotes}
                    className="admin-premium-settings__btn admin-premium-settings__btn--ghost admin-premium-interactive"
                  >
                    Notları İndir
                  </button>
                ) : null}
                {onExportQuiz ? (
                  <button
                    type="button"
                    onClick={onExportQuiz}
                    className="admin-premium-settings__btn admin-premium-settings__btn--ghost admin-premium-interactive"
                  >
                    Quiz Sonuçlarını İndir
                  </button>
                ) : null}
                {onExportMemories ? (
                  <button
                    type="button"
                    onClick={onExportMemories}
                    className="admin-premium-settings__btn admin-premium-settings__btn--ghost admin-premium-interactive"
                  >
                    Anı Listesini İndir
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          eyebrow="Quiz"
          title="Quiz yönetimi"
          description="Soruları düzenleyin, quiz sonuçlarını takip edin."
          revealClass="admin-premium-settings__card--d4"
        >
          <p className="admin-premium-settings__archive-note">
            Quiz soruları ve kazanan bilgisi buradan yönetilir. Mobil menüde ayrı
            sekme yok; hızlı erişim için bu kartı kullanın.
          </p>
          {onManageQuiz ? (
            <button
              type="button"
              onClick={onManageQuiz}
              className="admin-premium-settings__btn admin-premium-settings__btn--outline admin-premium-sheen-surface admin-premium-interactive"
            >
              Quiz sorularını yönet
            </button>
          ) : null}
        </SettingsCard>

        <SettingsCard
          eyebrow="Playlist"
          title="Şarkı kartı"
          description="Misafir sayfasındaki müzik kartında gösterilir."
          revealClass="admin-premium-settings__card--d5"
        >
          <div className="admin-premium-settings__grid admin-premium-settings__grid--2">
            <Field label="Şarkı adı">
              <input
                className="admin-premium-settings__input"
                value={form.playlistTitle}
                onChange={(e) => handleChange("playlistTitle", e.target.value)}
                placeholder="Şarkı adı"
              />
            </Field>
            <Field label="Sanatçı">
              <input
                className="admin-premium-settings__input"
                value={form.playlistArtist}
                onChange={(e) => handleChange("playlistArtist", e.target.value)}
                placeholder="Sanatçı adı"
              />
            </Field>
          </div>

          <Field label="Spotify / link" hint="Tam şarkı bağlantısı.">
            <input
              type="url"
              className="admin-premium-settings__input admin-premium-settings__input--url"
              value={form.playlistUrl}
              onChange={(e) => handleChange("playlistUrl", e.target.value)}
              placeholder="https://open.spotify.com/..."
            />
          </Field>
        </SettingsCard>

        {(error || message) && (
          <div
            className={cn(
              "admin-premium-settings__feedback",
              error
                ? "admin-premium-settings__feedback--err"
                : "admin-premium-settings__feedback--ok"
            )}
            role="status"
          >
            {error ?? message}
          </div>
        )}

        <div className="admin-premium-settings__footer-spacer" aria-hidden />

        <div className="admin-premium-settings__footer">
          <button
            type="submit"
            disabled={saving}
            className="admin-premium-settings__save admin-premium-sheen-surface admin-premium-interactive"
          >
            {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
  revealClass,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  revealClass?: string;
}) {
  return (
    <section
      className={cn(
        "admin-premium-settings__card admin-premium-card--living admin-premium-reveal",
        revealClass
      )}
    >
      <header className="admin-premium-settings__card-head">
        <div className="admin-premium-settings__card-head-copy">
          <p className="admin-premium-settings__eyebrow">{eyebrow}</p>
          <h2 className="admin-premium-settings__card-title">{title}</h2>
          <p className="admin-premium-settings__card-desc">{description}</p>
        </div>
      </header>
      <div className="admin-premium-settings__card-body">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="admin-premium-settings__field">
      <span className="admin-premium-settings__label">{label}</span>
      {children}
      {hint ? <span className="admin-premium-settings__hint">{hint}</span> : null}
    </label>
  );
}

function PremiumSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={cn("admin-premium-settings__switch", checked && "admin-premium-settings__switch--on")}>
      <span className="admin-premium-settings__switch-copy">
        <span className="admin-premium-settings__switch-label">
          {checked ? (
            <span className="admin-premium-settings__switch-active-dot" aria-hidden />
          ) : null}
          {label}
        </span>
        {hint ? (
          <span className="admin-premium-settings__switch-hint">{hint}</span>
        ) : null}
      </span>
      <span className={cn("admin-premium-settings__switch-track", checked && "is-on")}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="admin-premium-settings__switch-input"
        />
        <span className="admin-premium-settings__switch-thumb" aria-hidden />
      </span>
    </label>
  );
}

