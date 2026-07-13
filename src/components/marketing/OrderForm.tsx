"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GoldButton } from "@/components/GoldButton";
import { GlassCard } from "@/components/GlassCard";
import { PRICING_PLANS } from "@/lib/pricing";
import type { CreateCoupleResponse, PackageType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PACKAGE_IDS: PackageType[] = ["basic", "premium", "luxury"];

export function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPackage = searchParams.get("package");
  const packageType = PACKAGE_IDS.includes(initialPackage as PackageType)
    ? (initialPackage as PackageType)
    : "premium";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    package_type: packageType,
    bride_name: "",
    groom_name: "",
    wedding_date: "",
    bride_email: "",
    groom_email: "",
    playlist_title: "",
    playlist_artist: "",
    playlist_url: "",
    media_upload_enabled: true,
    quiz_enabled: packageType !== "basic",
    notes: "",
  });

  const setField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handlePackageChange = (pkg: PackageType) => {
    setField("package_type", pkg);
    if (pkg === "basic") setField("quiz_enabled", false);
    if (pkg === "premium" || pkg === "luxury") setField("quiz_enabled", true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as CreateCoupleResponse & {
        error?: string;
        success?: boolean;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Kurulum başarısız.");
      }

      sessionStorage.setItem(
        "memoora_order_success",
        JSON.stringify(data)
      );
      router.push(`/order/success?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard strong className="order-form-card !rounded-2xl !p-6 sm:!p-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/75">
        Sipariş / Onboarding
      </p>
      <h1 className="mt-2 font-serif text-2xl text-white/95 sm:text-3xl">
        Düğün sitenizi oluşturun
      </h1>
      <p className="mt-2 text-sm text-white/45">
        Ödeme şimdilik manuel — formu gönderdikten sonra siteniz anında hazır olur.
      </p>

      <div className="order-package-pills">
        {PRICING_PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={cn(
              "order-package-pill",
              form.package_type === plan.id && "order-package-pill--active"
            )}
            onClick={() => handlePackageChange(plan.id)}
          >
            {plan.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <fieldset className="order-form__section">
          <legend>Müşteri bilgileri</legend>
          <input
            className="memory-input memory-input-compact"
            placeholder="Ad Soyad *"
            required
            value={form.customer_name}
            onChange={(e) => setField("customer_name", e.target.value)}
          />
          <input
            className="memory-input memory-input-compact"
            type="email"
            placeholder="E-posta *"
            required
            value={form.customer_email}
            onChange={(e) => setField("customer_email", e.target.value)}
          />
          <input
            className="memory-input memory-input-compact"
            type="tel"
            placeholder="Telefon"
            value={form.customer_phone}
            onChange={(e) => setField("customer_phone", e.target.value)}
          />
        </fieldset>

        <fieldset className="order-form__section">
          <legend>Çift bilgileri</legend>
          <div className="order-form__row">
            <input
              className="memory-input memory-input-compact"
              placeholder="Damat adı *"
              required
              value={form.groom_name}
              onChange={(e) => setField("groom_name", e.target.value)}
            />
            <input
              className="memory-input memory-input-compact"
              placeholder="Gelin adı *"
              required
              value={form.bride_name}
              onChange={(e) => setField("bride_name", e.target.value)}
            />
          </div>
          <input
            className="memory-input memory-input-compact"
            type="date"
            value={form.wedding_date}
            onChange={(e) => setField("wedding_date", e.target.value)}
          />
          <div className="order-form__row">
            <input
              className="memory-input memory-input-compact"
              type="email"
              placeholder="Damat e-posta"
              value={form.groom_email}
              onChange={(e) => setField("groom_email", e.target.value)}
            />
            <input
              className="memory-input memory-input-compact"
              type="email"
              placeholder="Gelin e-posta"
              value={form.bride_email}
              onChange={(e) => setField("bride_email", e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className="order-form__section">
          <legend>Şarkı kartı (opsiyonel)</legend>
          <input
            className="memory-input memory-input-compact"
            placeholder="Şarkı adı"
            value={form.playlist_title}
            onChange={(e) => setField("playlist_title", e.target.value)}
          />
          <input
            className="memory-input memory-input-compact"
            placeholder="Sanatçı"
            value={form.playlist_artist}
            onChange={(e) => setField("playlist_artist", e.target.value)}
          />
          <input
            className="memory-input memory-input-compact"
            placeholder="Spotify / link"
            value={form.playlist_url}
            onChange={(e) => setField("playlist_url", e.target.value)}
          />
        </fieldset>

        <fieldset className="order-form__section">
          <legend>Özellikler</legend>
          <label className="order-form__check">
            <input
              type="checkbox"
              checked={form.media_upload_enabled}
              onChange={(e) => setField("media_upload_enabled", e.target.checked)}
            />
            Medya yükleme açık
          </label>
          <label className="order-form__check">
            <input
              type="checkbox"
              checked={form.quiz_enabled}
              onChange={(e) => setField("quiz_enabled", e.target.checked)}
            />
            Quiz açık
          </label>
        </fieldset>

        <textarea
          className="memory-input min-h-[88px] resize-y"
          placeholder="Notlar (opsiyonel)"
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
        />

        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}

        <GoldButton
          type="submit"
          variant="primary"
          className="w-full !text-[11px]"
          disabled={loading}
        >
          {loading ? "Oluşturuluyor…" : "Siparişi Gönder ve Siteyi Kur"}
        </GoldButton>
      </form>
    </GlassCard>
  );
}
