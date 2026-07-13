"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

const ENABLE_SESSION_SKIP = false;
const INTRO_SESSION_KEY = "memoora_intro_seen";

const EASE_PREMIUM = [0.19, 1, 0.22, 1] as const;

const LANDING_CARDS = [
  { image: ASSETS.landingCardMemories, side: "left" as const },
  { image: ASSETS.landingCardNote, side: "right" as const },
] as const;

const FEATURES = [
  {
    title: "NFC ile Bağlantı",
    text: "Yaprağa dokununca anı sayfası açılır.",
    icon: "nfc",
  },
  {
    title: "Anılar Büyür",
    text: "Her mesaj ağacınızı yeşertir.",
    icon: "sprout",
  },
  {
    title: "Yaşayan Miras",
    text: "Hatıralarınız bir arada kalır.",
    icon: "tree",
  },
] as const;

type IntroStage = "lockup" | "reveal" | "expanding" | "final" | "complete";

const STAGE_AT = {
  reveal: 1900,
  expanding: 3600,
  final: 5500,
  complete: 6500,
} as const;

interface MemooraIntroHeroProps {
  demoSlug?: string;
  videoSrc?: string;
}

function shouldForceIntro(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

function MemooraLeafIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 4C24 4 8 28 8 44C8 58 15 68 24 68C33 68 40 58 40 44C40 28 24 4 24 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 12V64" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M24 22L16 30M24 30L14 40M24 38L16 48M24 46L14 56"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M24 22L32 30M24 30L34 40M24 38L32 48M24 46L34 56"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
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
      <path d="M24 20L18 26M24 26L16 34M24 32L18 38" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M24 20L30 26M24 26L32 34M24 32L30 38" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function MemooraIntroHero({
  videoSrc = "/videos/memoora-landing-intro.mp4",
}: MemooraIntroHeroProps) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const forceIntroRef = useRef(false);
  const [stage, setStage] = useState<IntroStage>("lockup");
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
    forceIntroRef.current = shouldForceIntro();

    if (reducedMotion && !forceIntroRef.current) {
      setSkipAnimation(true);
      setStage("complete");
      return;
    }

    if (
      ENABLE_SESSION_SKIP &&
      !forceIntroRef.current &&
      sessionStorage.getItem(INTRO_SESSION_KEY) === "1"
    ) {
      setSkipAnimation(true);
      setStage("complete");
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!mounted || skipAnimation) return;

    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setStage("reveal"), STAGE_AT.reveal);
    const t2 = window.setTimeout(() => setStage("expanding"), STAGE_AT.expanding);
    const t3 = window.setTimeout(() => setStage("final"), STAGE_AT.final);
    const t4 = window.setTimeout(() => {
      setStage("complete");
      if (ENABLE_SESSION_SKIP && !forceIntroRef.current) {
        sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      }
      document.body.style.overflow = "";
    }, STAGE_AT.complete);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      document.body.style.overflow = "";
    };
  }, [mounted, skipAnimation]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useFallback) return;

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [useFallback, mounted]);

  const handleVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  const activeStage = skipAnimation ? "complete" : stage;

  const isSettled =
    skipAnimation || stage === "final" || stage === "complete";

  const isExpanded =
    skipAnimation ||
    stage === "expanding" ||
    stage === "final" ||
    stage === "complete";

  const showVideo =
    skipAnimation ||
    stage === "reveal" ||
    stage === "expanding" ||
    stage === "final" ||
    stage === "complete";

  const showContent =
    skipAnimation || stage === "final" || stage === "complete";

  const showDeck =
    skipAnimation || stage === "complete";

  const showBrand =
    !skipAnimation &&
    (stage === "lockup" || stage === "reveal" || stage === "expanding");

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.08 + i * 0.14,
        duration: 0.95,
        ease: EASE_PREMIUM,
      },
    }),
  };

  const deckFade: Variants = {
    hidden: { opacity: 0, y: 36 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2 + i * 0.12,
        duration: 0.9,
        ease: EASE_PREMIUM,
      },
    }),
  };

  const cardSlide: Variants = {
    hidden: (side: "left" | "right") => ({
      opacity: 0,
      x: side === "left" ? -56 : 56,
      y: 32,
      scale: 0.92,
    }),
    visible: (side: "left" | "right") => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        delay: side === "left" ? 0.15 : 0.32,
        duration: 1.05,
        ease: EASE_PREMIUM,
      },
    }),
  };

  return (
    <>
      <section
        className={cn(
          "memoora-intro-hero",
          `stage-${activeStage}`,
          isExpanded && "memoora-intro-hero--expanded",
          skipAnimation && "memoora-intro-hero--skipped"
        )}
        aria-label="Memoora ana sayfa"
        data-stage={activeStage}
      >
        <div
          className={cn(
            "memoora-intro-brand",
            showBrand && "memoora-intro-brand--visible",
            stage === "expanding" && "memoora-intro-brand--fade"
          )}
          aria-hidden={!showBrand}
        >
          <div className="memoora-intro-brand__top">
            <MemooraLeafIcon className="memoora-intro-brand__leaf" />
            <span className="memoora-intro-brand__name">
              <span className="memoora-intro-brand__name-text">MEMOORA</span>
            </span>
          </div>
          <span className="memoora-intro-brand__tag">THE LIVING TREE</span>
        </div>

        <div
          className={cn(
            "memoora-intro-video-card",
            showVideo && "memoora-intro-video-card--visible",
            isExpanded && "memoora-intro-video-card--expanded",
            isSettled && "memoora-intro-video-card--settled"
          )}
        >
          <div className="memoora-intro-video-card__inner">
            {!useFallback ? (
              <video
                ref={videoRef}
                className="memoora-intro-video"
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                onError={handleVideoError}
                aria-hidden
              />
            ) : null}
            <div
              className="memoora-intro-video-fallback memoora-intro-video-fallback--gradient"
              aria-hidden
            />
            {useFallback ? (
              <div
                className="memoora-intro-video-fallback memoora-intro-video-fallback--image"
                style={{ backgroundImage: `url(${ASSETS.treeHero})` }}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "memoora-intro-final-overlay",
                isExpanded && "memoora-intro-final-overlay--visible"
              )}
              aria-hidden
            />
          </div>
        </div>

        <div
          className={cn(
            "memoora-hero-v2",
            showContent && "memoora-hero-v2--visible"
          )}
          aria-hidden={!showContent}
        >
          <div className="memoora-hero-v2__inner">
            <motion.h1
              className="memoora-hero-v2__title font-serif"
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
            >
              Her anı bir yaprağa dönüşsün.
            </motion.h1>

            <motion.p
              className="memoora-hero-v2__lead"
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
            >
              Sevdikleriniz NFC yaprağına dokunsun, sözlerini bıraksın. Her
              dokunuşla ağacınız büyüsün, anılarınız yaşasın.
            </motion.p>

            <motion.div
              className="memoora-hero-v2__actions"
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
            >
              <Link
                href="/order"
                className="memoora-hero-v2__cta memoora-hero-v2__cta--primary"
              >
                <span className="memoora-hero-v2__cta-beam" aria-hidden />
                <span className="memoora-hero-v2__cta-inner">
                  <MemooraLeafIcon className="memoora-hero-v2__cta-leaf" />
                  <span className="memoora-hero-v2__cta-label">
                    Anı Yolculuğunu Başlat
                  </span>
                  <span className="memoora-hero-v2__cta-chevron" aria-hidden>
                    ›
                  </span>
                </span>
              </Link>

              <Link href="#how-it-works" className="memoora-hero-v2__link">
                Nasıl Çalışır?
                <span className="memoora-hero-v2__link-ring" aria-hidden>
                  →
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div
        id="how-it-works"
        className={cn(
          "memoora-landing-deck",
          showDeck && "memoora-landing-deck--visible"
        )}
        aria-hidden={!showDeck}
      >
        <div className="memoora-landing-deck__wave" aria-hidden>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="memooraWaveGoldDeck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e8c878" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#ffd978" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#c5a059" stopOpacity="0.45" />
              </linearGradient>
              <filter id="memooraWaveGlowDeck" x="-20%" y="-80%" width="140%" height="260%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M0,96 C200,28 380,132 580,72 C780,12 980,118 1180,58 C1320,18 1380,82 1440,68 L1440,160 L0,160 Z"
              fill="var(--memoora-cream)"
            />
            <path
              d="M0,96 C200,28 380,132 580,72 C780,12 980,118 1180,58 C1320,18 1380,82 1440,68"
              fill="none"
              stroke="url(#memooraWaveGoldDeck)"
              strokeWidth="2.5"
              filter="url(#memooraWaveGlowDeck)"
            />
          </svg>
        </div>

        <section className="memoora-landing-cream">
          <motion.header
            className="memoora-landing-cream__header"
            custom={0}
            variants={deckFade}
            initial="hidden"
            animate={showDeck ? "visible" : "hidden"}
          >
            <span className="memoora-landing-cream__leaves" aria-hidden>
              <MemooraLeafIcon />
              <MemooraLeafIcon />
            </span>
            <h2 className="memoora-landing-cream__title font-serif">
              Sözler, Yapraklarda Yaşar
            </h2>
          </motion.header>

          <div className="memoora-landing-cards">
            {LANDING_CARDS.map((card) => (
              <motion.div
                key={card.side}
                className={cn(
                  "memoora-landing-card",
                  card.side === "left"
                    ? "memoora-landing-card--left"
                    : "memoora-landing-card--right"
                )}
                custom={card.side}
                variants={cardSlide}
                initial="hidden"
                animate={showDeck ? "visible" : "hidden"}
              >
                <img src={card.image} alt="" />
              </motion.div>
            ))}
          </div>
        </section>

        <div className="memoora-landing-wave memoora-landing-wave--to-green" aria-hidden>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path
              d="M0,36 C240,88 480,8 720,52 C960,96 1200,18 1440,58 L1440,100 L0,100 Z"
              fill="var(--memoora-forest-deep, #1b2b1e)"
            />
            <path
              d="M0,36 C240,88 480,8 720,52 C960,96 1200,18 1440,58"
              fill="none"
              stroke="#d4b06a"
              strokeWidth="2"
              strokeOpacity="0.55"
            />
          </svg>
        </div>

        <section className="memoora-landing-features" aria-label="Özellikler">
          <div className="memoora-landing-features__grid">
            {FEATURES.map((item, i) => (
              <motion.article
                key={item.title}
                className="memoora-landing-features__item"
                custom={i}
                variants={deckFade}
                initial="hidden"
                animate={showDeck ? "visible" : "hidden"}
              >
                <div className="memoora-landing-features__icon" aria-hidden>
                  <FeatureIcon type={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                {i < FEATURES.length - 1 ? (
                  <span className="memoora-landing-features__star" aria-hidden>
                    ✦
                  </span>
                ) : null}
              </motion.article>
            ))}
          </div>
        </section>

        <div className="memoora-landing-wave memoora-landing-wave--to-cream" aria-hidden>
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path
              d="M0,28 C220,78 460,12 720,48 C980,84 1220,22 1440,62 L1440,90 L0,90 Z"
              fill="var(--memoora-cream)"
            />
          </svg>
        </div>

        <section className="memoora-landing-quote">
          <motion.blockquote
            custom={0}
            variants={deckFade}
            initial="hidden"
            animate={showDeck ? "visible" : "hidden"}
          >
            <span className="memoora-landing-quote__mark memoora-landing-quote__mark--open font-serif" aria-hidden>
              &ldquo;
            </span>
            <p className="font-serif">
              Bazı anlar vardır ki, zamanla değil, kalpten saklanır.
            </p>
            <span className="memoora-landing-quote__mark memoora-landing-quote__mark--close font-serif" aria-hidden>
              &rdquo;
            </span>
            <span className="memoora-landing-quote__leaf" aria-hidden>
              <MemooraLeafIcon />
            </span>
          </motion.blockquote>
        </section>
      </div>
    </>
  );
}
