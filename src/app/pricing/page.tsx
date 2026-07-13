import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { GoldButton } from "@/components/GoldButton";
import { PRICING_PLANS } from "@/lib/pricing";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="marketing-section marketing-section--hero-pad">
        <div className="marketing-section__inner">
          <p className="marketing-eyebrow">Paketler</p>
          <h1 className="marketing-section__title font-serif">
            Düğününüze uygun Memoora deneyimi
          </h1>
          <p className="marketing-section__lead">
            Her paket kalıcı dijital arşiv içerir. Anılarınız otomatik silinmez.
          </p>

          <div className="marketing-pricing-grid marketing-pricing-grid--page">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`marketing-plan glass-panel-strong ${plan.featured ? "marketing-plan--featured" : ""}`}
              >
                {plan.featured ? (
                  <span className="marketing-plan__badge">Öne Çıkan</span>
                ) : null}
                <h2 className="font-serif text-2xl text-white/95">{plan.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-champagne/70">
                  {plan.priceLabel}
                </p>
                <p className="mt-3 text-sm text-white/55">{plan.tagline}</p>
                <ul className="marketing-plan__features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <GoldButton
                  href={`/order?package=${plan.id}`}
                  variant={plan.featured ? "primary" : "secondary"}
                  className="mt-6 w-full !text-[10px]"
                >
                  Sipariş Oluştur
                </GoldButton>
              </article>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-white/40">
            Ödeme entegrasyonu yakında. Şimdilik{" "}
            <Link href="/order" className="text-champagne/80 hover:text-champagne">
              sipariş formu
            </Link>{" "}
            ile anında kurulum.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
