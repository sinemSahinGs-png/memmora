"use client";

import { useMemo, useState } from "react";
import type { RsvpStatus } from "@/lib/types";
import { RSVP_SUCCESS_MESSAGES } from "@/lib/supabase/rsvp";
import { cn } from "@/lib/utils";

interface InviteRsvpFormProps {
  coupleSlug: string;
  maxGuestCount: number;
  onClose?: () => void;
  variant?: "light" | "dark";
  mapsUrl?: string;
  /** Hides the "Katılımınızı Bildirin" section header — used when parent supplies its own header */
  hideHeader?: boolean;
}

const STATUS_OPTIONS: { id: RsvpStatus; label: string }[] = [
  { id: "attending", label: "Katılıyorum" },
  { id: "not_attending", label: "Katılamıyorum" },
  { id: "maybe", label: "Emin Değilim" },
];

export function InviteRsvpForm({
  coupleSlug,
  maxGuestCount,
  onClose,
  variant = "light",
  mapsUrl,
  hideHeader = false,
}: InviteRsvpFormProps) {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("attending");
  const [guestCount, setGuestCount] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<RsvpStatus | null>(null);

  const isDark = variant === "dark";
  const statusOptions = isDark
    ? STATUS_OPTIONS.filter((o) => o.id !== "maybe")
    : STATUS_OPTIONS;

  const showGuestCount = status === "attending" || (!isDark && status === "maybe");
  const guestCountRequired = status === "attending";
  const maxCount = Math.max(1, maxGuestCount);

  const countOptions = useMemo(() => {
    const values: number[] = [];
    for (let i = 1; i <= Math.min(maxCount, 4); i += 1) values.push(i);
    if (maxCount >= 5) values.push(5);
    return values;
  }, [maxCount]);

  const adjustGuestCount = (delta: number) => {
    setGuestCount((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxCount) return maxCount;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        coupleSlug,
        guest_name: guestName.trim(),
        phone: phone.trim() || undefined,
        status,
        guest_count:
          status === "not_attending"
            ? 0
            : status === "attending"
              ? guestCount
              : guestCount || 0,
        note: note.trim() || undefined,
      };

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; status?: RsvpStatus };

      if (!response.ok) {
        throw new Error(data.error || "Yanıt gönderilemedi.");
      }

      setSuccessStatus(data.status ?? status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yanıt gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel = isDark ? "Katılımı Gönder" : "Yanıtı Gönder";

  if (successStatus) {
    return (
      <section
        className={cn("invite-rsvp invite-rsvp--success", isDark && "invite-rsvp--dark")}
      >
        <div className="invite-rsvp__success-icon" aria-hidden>
          ✦
        </div>
        <h2 className="invite-rsvp__success-title">Teşekkürler</h2>
        <p className="invite-rsvp__success-text">
          {RSVP_SUCCESS_MESSAGES[successStatus]}
        </p>
        {onClose ? (
          <button
            type="button"
            className="invite-rsvp__close-btn"
            onClick={onClose}
          >
            Kapat
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className={cn("invite-rsvp", isDark && "invite-rsvp--dark")}>
      {!isDark && !hideHeader ? (
        <div className="invite-rsvp__head">
          <h2 className="invite-rsvp__title">Katılımınızı Bildirin</h2>
          <p className="invite-rsvp__subtitle">
            Lütfen aşağıdaki formu doldurarak yanıtınızı iletin.
          </p>
        </div>
      ) : null}

      <form className="invite-rsvp__form" onSubmit={handleSubmit}>
        <fieldset className="invite-rsvp__field">
          <legend className="invite-rsvp__label">Katılım durumu</legend>
          <div className="invite-rsvp__pills">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "invite-rsvp__pill",
                  status === option.id && "invite-rsvp__pill--active"
                )}
                onClick={() => {
                  setStatus(option.id);
                  if (option.id === "not_attending") setGuestCount(0);
                  if (option.id === "attending" && guestCount < 1) setGuestCount(1);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {showGuestCount ? (
          <fieldset className="invite-rsvp__field">
            <legend className="invite-rsvp__label">
              Kaç kişi geleceksiniz?
              {!guestCountRequired ? (
                <span className="invite-rsvp__optional"> (opsiyonel)</span>
              ) : null}
            </legend>

            {isDark ? (
              <div className="invite-rsvp__stepper">
                <button
                  type="button"
                  className="invite-rsvp__stepper-btn"
                  onClick={() => adjustGuestCount(-1)}
                  disabled={guestCount <= 1}
                  aria-label="Azalt"
                >
                  −
                </button>
                <span className="invite-rsvp__stepper-value">
                  {guestCount >= 5 && maxCount >= 5
                    ? "5+ kişi"
                    : `${guestCount} kişi`}
                </span>
                <button
                  type="button"
                  className="invite-rsvp__stepper-btn"
                  onClick={() => adjustGuestCount(1)}
                  disabled={guestCount >= maxCount}
                  aria-label="Artır"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="invite-rsvp__count-row">
                {countOptions.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      "invite-rsvp__count-pill",
                      guestCount === value && "invite-rsvp__count-pill--active"
                    )}
                    onClick={() => setGuestCount(value)}
                  >
                    {value >= 5 && maxCount >= 5 ? "5+" : value}
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        ) : null}

        <label className="invite-rsvp__field">
          <span className="invite-rsvp__label">Ad Soyad</span>
          <input
            type="text"
            className="invite-rsvp__input"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Adınız ve soyadınız"
            required
            autoComplete="name"
          />
        </label>

        {!isDark ? (
          <label className="invite-rsvp__field">
            <span className="invite-rsvp__label">
              Telefon <span className="invite-rsvp__optional">(opsiyonel)</span>
            </span>
            <input
              type="tel"
              className="invite-rsvp__input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xx xxx xx xx"
              autoComplete="tel"
            />
          </label>
        ) : null}

        <label className="invite-rsvp__field">
          <span className="invite-rsvp__label">
            Not <span className="invite-rsvp__optional">(opsiyonel)</span>
          </span>
          <textarea
            className="invite-rsvp__textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Varsa eklemek istediğiniz bir not…"
            rows={3}
          />
        </label>

        {error ? (
          <p className="invite-rsvp__error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="invite-rsvp__submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Gönderiliyor…" : submitLabel}
        </button>

        {isDark && mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="invite-rsvp__maps-link"
          >
            Konumu Aç
          </a>
        ) : null}
      </form>
    </section>
  );
}
