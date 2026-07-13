"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { GoldButton } from "@/components/GoldButton";
import {
  LandingCinematicHero,
  LANDING_INTRO_SESSION_KEY,
} from "@/components/marketing/LandingCinematicHero";
import { ASSETS } from "@/lib/assets";
import { PRICING_PLANS } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const EASE = [0.19, 1, 0.22, 1] as const;

const FEATURES = [
  {
    title: "NFC ile Bağlantı",
    text: "Misafirleriniz yaprağa dokunur, anı yolculuğu başlar.",
    icon: "nfc" as const,
  },
  {
    title: "Anılar Büyür",
    text: "Her mesaj bir yaprak olur, ağacınız daha da canlanır.",
    icon: "sprout" as const,
  },
  {
    title: "Yaşayan Miras",
    text: "Anılarınız ölümsüzleşir, nesiller boyu yaşatılır.",
    icon: "tree" as const,
  },
];

const STEPS = [
  {
    title: "Sipariş verin",
    text: "Paketinizi seçin, çift bilgilerinizi girin — siteniz otomatik kurulsun.",
  },
  {
    title: "Misafirlerinizi davet edin",
    text: "NFC yaprak veya link ile misafirler anı, fotoğraf ve video bırakır.",
  },
  {
    title: "Anılarınız büyüsün",
    text: "Her mesaj ağacınıza yeni bir yaprak, her fotoğraf kalıcı bir hatıra olur.",
  },
];

const FAQ = [
  {
    q: "Misafirler hesap açmak zorunda mı?",
    a: "Hayır. Link veya NFC ile doğrudan anı bırakabilirler.",
  },
  {
    q: "Anılarım silinir mi?",
    a: "Hayır. Memoora kalıcı bir hatıra ürünüdür; verileriniz otomatik silinmez.",
  },
  {
    q: "Ödeme ne zaman?",
    a: "Şimdilik manuel onay ile kurulum yapılır. Online ödeme yakında eklenecek.",
  },
];

const COLLECTIONS = [
  {
    title: "DOĞA KOLEKSİYONU",
    image: ASSETS.treeHero,
    href: "/order",
  },
  {
    title: "HATIRA KOLEKSİYONU",
    image: ASSETS.landingCardMemories,
    href: "/order?package=premium",
  },
] as const;

const STORY_CARDS = [
  {
    side: "left" as const,
    image: ASSETS.landingCardMemories,
    label: "Anılar Birikir",
    tilt: "-2deg",
  },
  {
    side: "right" as const,
    image: ASSETS.landingCardNote,
    label: "Sözler Kalır",
    tilt: "2.5deg",
  },
];

interface DemoCouple {
  slug: string;
  title: string;
}

interface MemooraLandingPageProps {
  demos: DemoCouple[];
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 36" fill="none" aria-hidden className={className}>
      <path
        d="M12 2C12 2 4 14 4 22C4 29 8 34 12 34C16 34 20 29 20 22C20 14 12 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M12 6V32" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function FeatureIcon({ type }: { type: (typeof FEATURES)[number]["icon"] }) {
  if (type === "nfc") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="14" y="8" width="20" height="32" rx="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M24 16V24M20 20H28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M10 24C10 24 6 20 6 16C6 12 10 10 14 12M38 24C38 24 42 20 42 16C42 12 38 10 34 12"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "sprout") {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M24 40V22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M24 28C24 28 14 26 12 18C10 10 20 8 24 16C28 8 38 10 36 18C34 26 24 28 24 28Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 8C24 8 10 18 10 30C10 38 16 42 24 42C32 42 38 38 38 30C38 18 24 8 24 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M24 14V38" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function WaveDivider({ variant }: { variant: "to-cream" | "to-green" | "to-cream-quote" }) {
  const fill =
    variant === "to-green"
      ? "var(--ml-forest)"
      : "var(--ml-cream)";

  return (
    <div className={cn("ml-wave", `ml-wave--${variant}`)} aria-hidden>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        {variant === "to-cream" && (
          <>
            <path
              d="M0,88 C220,24 420,132 680,64 C940,0 1180,108 1440,52 L1440,120 L0,120 Z"
              fill={fill}
            />
            <path
              d="M0,88 C220,24 420,132 680,64 C940,0 1180,108 1440,52"
              fill="none"
              stroke="url(#mlWaveGold)"
              strokeWidth="2"
              opacity="0.65"
            />
          </>
        )}
        {variant === "to-green" && (
          <path
            d="M0,40 C240,96 480,8 720,56 C960,104 1200,16 1440,64 L1440,120 L0,120 Z"
            fill={fill}
          />
        )}
        {variant === "to-cream-quote" && (
          <path
            d="M0,32 C220,82 460,12 720,48 C980,84 1220,22 1440,58 L1440,120 L0,120 Z"
            fill={fill}
          />
        )}
        <defs>
          <linearGradient id="mlWaveGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8c878" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ffd978" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c5a059" stopOpacity="0.45" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.78, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function MemooraLandingPage({ demos }: MemooraLandingPageProps) {
  const reduced = useReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);

  useLayoutEffect(() => {
    const force =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("intro") === "1";

    if (force) {
      sessionStorage.removeItem(LANDING_INTRO_SESSION_KEY);
      return;
    }

    const seen =
      typeof window !== "undefined" &&
      sessionStorage.getItem(LANDING_INTRO_SESSION_KEY) === "1";

    if (reduced || seen) {
      setIntroComplete(true);
    }
  }, [reduced]);

  return (
    <div className="memoora-landing-page">
      <LandingCinematicHero onIntroComplete={handleIntroComplete} />

      {introComplete ? (
        <RevealSection className="ml-collections">
          <header className="ml-collections__head">
            <h2 className="ml-collections__title">KOLEKSİYONLAR</h2>
            <span className="ml-collections__rule" aria-hidden />
          </header>
          <div className="ml-collections__grid">
            {COLLECTIONS.map((item) => (
              <Link key={item.title} href={item.href} className="ml-collection-card">
                <div className="ml-collection-card__media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" />
                </div>
                <span className="ml-collection-card__footer">
                  <span>{item.title}</span>
                  <span className="ml-collection-card__chev" aria-hidden>
                    ›
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </RevealSection>
      ) : null}

      <div
        className={cn(
          "memoora-landing-body",
          !introComplete && "memoora-landing-body--locked"
        )}
      >
      <section className="ml-story">
        <RevealSection>
          <header className="ml-story__head">
            <span className="ml-story__leaves" aria-hidden>
              <LeafIcon />
              <LeafIcon />
            </span>
            <h2 className="ml-story__title font-serif">Sözler, Yapraklarda Yaşar</h2>
            <p className="ml-story__lead">
              Düğününüzde, her dokunuş bir hatıraya dönüşür. Misafirlerinizin
              sözleriyle beslenen canlı bir anı ağacı sizinle büyür.
            </p>
          </header>
          <div className="ml-story__cards">
            {STORY_CARDS.map((card) => (
              <article
                key={card.side}
                className={cn(
                  "ml-story-card",
                  card.side === "left" ? "ml-story-card--left" : "ml-story-card--right"
                )}
                style={{ ["--ml-card-tilt" as string]: card.tilt }}
              >
                <div className="ml-story-card__frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" />
                </div>
                <span className="ml-story-card__label">{card.label}</span>
              </article>
            ))}
          </div>
        </RevealSection>
      </section>

      <WaveDivider variant="to-green" />

      <section className="ml-features" aria-label="Özellikler">
        <RevealSection className="ml-features__grid">
          {FEATURES.map((item, i) => (
            <article key={item.title} className="ml-features__item">
              <div className="ml-features__icon" aria-hidden>
                <FeatureIcon type={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {i < FEATURES.length - 1 ? (
                <span className="ml-features__divider" aria-hidden />
              ) : null}
            </article>
          ))}
        </RevealSection>
      </section>

      <WaveDivider variant="to-cream-quote" />

      <section className="ml-quote">
        <RevealSection>
          <blockquote className="ml-quote__block font-serif">
            <span className="ml-quote__mark ml-quote__mark--open" aria-hidden>
              &ldquo;
            </span>
            <p>Bazı anlar vardır ki, zamanla değil, kalpten saklanır.</p>
            <span className="ml-quote__mark ml-quote__mark--close" aria-hidden>
              &rdquo;
            </span>
            <span className="ml-quote__leaf" aria-hidden>
              <LeafIcon />
            </span>
          </blockquote>
        </RevealSection>
      </section>

      <section id="how-it-works" className="ml-steps-section">
        <RevealSection className="ml-steps-section__inner">
          <p className="ml-eyebrow">Nasıl Çalışır</p>
          <h2 className="ml-section-title font-serif">Üç adımda hatıra ağacı</h2>
          <div className="ml-steps">
            {STEPS.map((step, i) => (
              <article key={step.title} className="ml-step">
                <span className="ml-step__num">{i + 1}</span>
                <h3 className="font-serif">{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div className="ml-steps-cta">
            <Link href="/pricing" className="ml-cta ml-cta--secondary">
              Paketleri İncele
            </Link>
            <Link href="/order" className="ml-cta ml-cta--primary ml-cta--compact">
              <span className="ml-cta__inner">
                <span>Sipariş Ver</span>
                <span className="ml-cta__chev" aria-hidden>
                  ›
                </span>
              </span>
            </Link>
          </div>
        </RevealSection>
      </section>

      <section className="ml-pricing">
        <RevealSection className="ml-pricing__inner">
          <p className="ml-eyebrow ml-eyebrow--light">Paketler</p>
          <h2 className="ml-section-title ml-section-title--light font-serif">
            Size uygun deneyim
          </h2>
          <div className="ml-pricing-grid">
            {PRICING_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={cn(
                  "ml-plan",
                  plan.featured && "ml-plan--featured"
                )}
              >
                {plan.featured ? (
                  <span className="ml-plan__badge">Öne Çıkan</span>
                ) : null}
                <h3 className="font-serif">{plan.name}</h3>
                <p className="ml-plan__price">{plan.priceLabel}</p>
                <p className="ml-plan__tagline">{plan.tagline}</p>
                <ul className="ml-plan__features">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link href={`/order?package=${plan.id}`} className="ml-plan__link">
                  Sipariş Oluştur →
                </Link>
              </article>
            ))}
          </div>
          <div className="ml-pricing-more">
            <GoldButton href="/pricing" variant="secondary">
              Tüm Paketleri Gör
            </GoldButton>
          </div>
        </RevealSection>
      </section>

      <section id="demo" className="ml-demo">
        <RevealSection className="ml-demo__inner">
          <p className="ml-eyebrow ml-eyebrow--light">Demo</p>
          <h2 className="ml-section-title ml-section-title--light font-serif">
            Canlı örnekler
          </h2>
          <div className="ml-demo-grid">
            {demos.length > 0 ? (
              demos.map((demo) => (
                <Link key={demo.slug} href={`/${demo.slug}`} className="ml-demo-card">
                  <p className="ml-demo-card__eyebrow">Demo Site</p>
                  <p className="ml-demo-card__title font-serif">{demo.title}</p>
                  <p className="ml-demo-card__slug">/{demo.slug}</p>
                </Link>
              ))
            ) : (
              <div className="ml-demo-card ml-demo-card--empty">
                <p className="font-serif">Demo yakında</p>
                <p>Sipariş formu ile ilk sitenizi oluşturabilirsiniz.</p>
              </div>
            )}
          </div>
        </RevealSection>
      </section>

      <section id="contact" className="ml-faq">
        <RevealSection className="ml-faq__inner">
          <p className="ml-eyebrow ml-eyebrow--light">SSS</p>
          <h2 className="ml-section-title ml-section-title--light font-serif">
            Sık sorulanlar
          </h2>
          <div className="ml-faq-list">
            {FAQ.map((item) => (
              <details key={item.q} className="ml-faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </RevealSection>
      </section>
      </div>
    </div>
  );
}
