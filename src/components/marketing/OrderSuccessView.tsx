"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoldButton } from "@/components/GoldButton";
import { GlassCard } from "@/components/GlassCard";
import { resolveCoupleUrls } from "@/lib/site-url";
import type { CreateCoupleResponse } from "@/lib/types";

interface SuccessData {
  orderId: string;
  slug: string;
  publicUrl: string;
  adminUrl: string;
  adminPin: string;
  driveFolderUrl: string | null;
  packageType: string;
}

function toSuccessData(input: {
  orderId: string;
  slug: string;
  adminPin: string;
  driveFolderUrl: string | null;
  packageType: string;
}): SuccessData {
  const { publicUrl, adminUrl } = resolveCoupleUrls(input.slug);
  return { ...input, publicUrl, adminUrl };
}

export function OrderSuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [data, setData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("memoora_order_success");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CreateCoupleResponse;
        setData(
          toSuccessData({
            orderId: parsed.orderId,
            slug: parsed.slug,
            adminPin: parsed.adminPin,
            driveFolderUrl: parsed.driveFolderUrl,
            packageType: parsed.packageType,
          })
        );
        setLoading(false);
        return;
      } catch {
        /* fall through */
      }
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/order/${orderId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) return;
        setData(
          toSuccessData({
            orderId: json.orderId,
            slug: json.slug,
            adminPin: json.adminPin,
            driveFolderUrl: json.driveFolderUrl,
            packageType: json.packageType,
          })
        );
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-white/45">Yükleniyor…</p>
    );
  }

  if (!data) {
    return (
      <GlassCard strong className="mx-auto max-w-lg text-center !p-8">
        <p className="text-white/60">Sipariş bilgisi bulunamadı.</p>
        <Link href="/order" className="mt-4 inline-block text-champagne">
          Yeni sipariş →
        </Link>
      </GlassCard>
    );
  }

  const rows = [
    { label: "Site linki", value: data.publicUrl, href: data.publicUrl },
    { label: "Admin panel", value: data.adminUrl, href: data.adminUrl },
    { label: "Admin PIN", value: data.adminPin },
    { label: "Slug", value: data.slug },
    { label: "Paket", value: data.packageType },
    ...(data.driveFolderUrl
      ? [{ label: "Drive klasörü", value: data.driveFolderUrl, href: data.driveFolderUrl }]
      : []),
  ];

  return (
    <GlassCard strong className="order-success-card !rounded-2xl !p-6 sm:!p-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/75">
        Kurulum tamamlandı
      </p>
      <h1 className="mt-2 font-serif text-2xl text-white/95 sm:text-3xl">
        Tebrikler, Memoora düğün siteniz hazır.
      </h1>
      <p className="mt-2 text-sm text-white/45">
        Bu bilgileri güvenli bir yere kaydedin. Anılarınız kalıcı olarak saklanır.
      </p>

      <dl className="order-success-list">
        {rows.map((row) => (
          <div key={row.label} className="order-success-row">
            <dt>{row.label}</dt>
            <dd>
              {row.href ? (
                <a href={row.href} target="_blank" rel="noopener noreferrer">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="order-success-actions">
        <GoldButton href={data.publicUrl} variant="primary">
          Siteyi Aç
        </GoldButton>
        <GoldButton href={data.adminUrl} variant="secondary">
          Admin Paneline Git
        </GoldButton>
        {data.driveFolderUrl ? (
          <a
            href={data.driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn-secondary text-center"
          >
            Drive Klasörünü Aç
          </a>
        ) : null}
        <Link href="/" className="text-center text-sm text-white/45 hover:text-champagne">
          Ana Sayfaya Dön
        </Link>
      </div>
    </GlassCard>
  );
}
