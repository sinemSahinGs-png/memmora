"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { cn } from "@/lib/utils";

/** Test: /?intro=1 — oturumda bir kez oynar, sonra atlanır */
export const LANDING_INTRO_SESSION_KEY = "memooraLandingIntroSeen";

const INTRO_VIDEO_SRC = ASSETS.landingIntroVideo;
/** Post-intro hero — change ASSETS.landingHeroVideo or use landingHeroVideoAmbient */
export const LANDING_HERO_VIDEO_SRC = ASSETS.landingHeroVideo;
/** Product clip: telefon ekranı CSS ile karartılır (çift ismi gizlenir) */
export const LANDING_HERO_MASKS_PHONE_SCREEN =
  LANDING_HERO_VIDEO_SRC === ASSETS.landingIntroVideo;
const EASE = [0.19, 1, 0.22, 1] as const;

const copyContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
} as const;

const copyItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.82, ease: EASE },
  },
} as const;

type IntroStage = "lockup" | "reveal" | "expanding" | "final" | "complete";

const STAGE_AT = {
  reveal: 2200,
  expanding: 4200,
  final: 6200,
  complete: 7400,
} as const;

const HERO_FEATURES = [
  {
    icon: "nfc" as const,
    title: "NFC TEKNOLOJİSİ",
    text: "Dokun ve bağlan.",
  },
  {
    icon: "quality" as const,
    title: "PREMIUM DENEYİM",
    text: "Zarif ve özel tasarım.",
  },
  {
    icon: "personal" as const,
    title: "KİŞİSELLEŞTİR",
    text: "Çiftinize özel içerikler.",
  },
  {
    icon: "shipping" as const,
    title: "HIZLI KURULUM",
    text: "Siteniz otomatik hazırlanır.",
  },
] as const;

interface LandingCinematicHeroProps {
  onIntroComplete?: () => void;
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

function HeroFeatureIcon({ type }: { type: (typeof HERO_FEATURES)[number]["icon"] }) {
  if (type === "nfc") {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="9" y="5" width="14" height="22" rx="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 11V17M13 14H19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path
          d="M6 16C6 16 4 14 4 11C4 8 6 7 9 8M26 16C26 16 28 14 28 11C28 8 26 7 23 8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (type === "quality") {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 4L19 12H28L21 17L23 26L16 21L9 26L11 17L4 12H13L16 4Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "personal") {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M16 6C16 6 8 12 8 19C8 24 11 27 16 27C21 27 24 24 24 19C24 12 16 6 16 6Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M16 10V24" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="10" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 14H28M10 10V8M22 10V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 18H12M16 18H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function LandingCinematicHero({ onIntroComplete }: LandingCinematicHeroProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<number[]>([]);
  const completedRef = useRef(false);
  const forceIntroRef = useRef(false);
  const onIntroCompleteRef = useRef(onIntroComplete);

  const [playMode, setPlayMode] = useState<"intro" | "skipped">("intro");
  const [stage, setStage] = useState<IntroStage>("lockup");
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    onIntroCompleteRef.current = onIntroComplete;
  }, [onIntroComplete]);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    document.body.style.overflow = "";
    onIntroCompleteRef.current?.();
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startIntroTimeline = useCallback(() => {
    clearTimers();
    setPlayMode("intro");
    setStage("lockup");
    document.body.style.overflow = "hidden";

    timersRef.current = [
      window.setTimeout(() => setStage("reveal"), STAGE_AT.reveal),
      window.setTimeout(() => setStage("expanding"), STAGE_AT.expanding),
      window.setTimeout(() => setStage("final"), STAGE_AT.final),
      window.setTimeout(() => {
        setStage("complete");
        sessionStorage.setItem(LANDING_INTRO_SESSION_KEY, "1");
        finishIntro();
      }, STAGE_AT.complete),
    ];
  }, [clearTimers, finishIntro]);

  useLayoutEffect(() => {
    forceIntroRef.current = shouldForceIntro();

    if (forceIntroRef.current) {
      sessionStorage.removeItem(LANDING_INTRO_SESSION_KEY);
    }

    const seen =
      !forceIntroRef.current &&
      sessionStorage.getItem(LANDING_INTRO_SESSION_KEY) === "1";

    const shouldSkip =
      (reduced === true && !forceIntroRef.current) || seen;

    if (shouldSkip) {
      clearTimers();
      setPlayMode("skipped");
      setStage("complete");
      finishIntro();
      return;
    }

    startIntroTimeline();

    return () => {
      clearTimers();
      document.body.style.overflow = "";
    };
  }, [reduced, clearTimers, finishIntro, startIntroTimeline]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useFallback) return;

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [useFallback, stage]);

  const handleVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  const isSkipped = playMode === "skipped";
  const activeStage = isSkipped ? "complete" : stage;

  const showSplitLayout =
    isSkipped || stage === "final" || stage === "complete";

  const isExpanded =
    isSkipped ||
    stage === "expanding" ||
    stage === "final" ||
    stage === "complete";

  const isSettled = isSkipped || stage === "final" || stage === "complete";

  const showVideo =
    isSkipped ||
    stage === "reveal" ||
    stage === "expanding" ||
    stage === "final" ||
    stage === "complete";

  const showBrand =
    !isSkipped &&
    (stage === "lockup" || stage === "reveal" || stage === "expanding");

  const showHeroCopy = showSplitLayout;
  const introDone = isSkipped || stage === "complete";
  const showLandingExtras = showSplitLayout && showHeroCopy;
  const useLandingHeroVideo = isSkipped || stage === "complete";
  const heroVideoSrc = useLandingHeroVideo ? LANDING_HERO_VIDEO_SRC : INTRO_VIDEO_SRC;

  return (
    <>
    <section
      className={cn(
        "ml-hero",
        "memoora-intro-hero",
        "ml-hero--cinematic",
        showSplitLayout && "ml-hero--split",
        showSplitLayout && "ml-hero--landing-scene",
        `stage-${activeStage}`,
        isExpanded && "memoora-intro-hero--expanded",
        isSkipped && "memoora-intro-hero--skipped",
        !introDone && "ml-hero--cinematic-lock",
        showHeroCopy && "ml-hero--copy-visible",
        introDone && "ml-hero--ready"
      )}
      aria-label="Memoora ana sayfa"
      data-stage={activeStage}
    >
      {/* Intro lockup yazıları — koyu ekranda kalır */}
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

      {/* Hero sahnesi — intro video + landing split */}
      <div
        className={cn(
          "ml-hero__main",
          showSplitLayout && "ml-hero__main--landing"
        )}
      >
      {/* Landing metin — sol beyaz panel */}
      <div
        className={cn(
          "ml-hero__split-panel",
          showSplitLayout && "ml-hero__split-panel--visible"
        )}
      >
        <motion.div
          className="ml-hero__copy ml-hero__copy--split"
          initial="hidden"
          animate={showHeroCopy ? "visible" : "hidden"}
          variants={copyContainerVariants}
        >
          <motion.h1
            className="ml-hero__title ml-hero__title--split"
            variants={copyItemVariants}
          >
            <span className="ml-hero__title-line">ANILARINI</span>
            <span className="ml-hero__title-line">TAŞI.</span>
          </motion.h1>
          <motion.p className="ml-hero__brand-line" variants={copyItemVariants}>
            MEMOORA
          </motion.p>
          <motion.p className="ml-hero__lead ml-hero__lead--split" variants={copyItemVariants}>
            NFC teknolojisiyle anılarını taşımanın en akıllı yolu.
          </motion.p>
          <motion.div className="ml-hero__actions ml-hero__actions--split" variants={copyItemVariants}>
            <Link href="/order" className="ml-cta ml-cta--split-primary">
              <span className="ml-cta__shine" aria-hidden />
              <span className="ml-cta__label">Anı Yolculuğunu Başlat</span>
            </Link>
            <Link href="#how-it-works" className="ml-hero__link ml-hero__link--split">
              <span className="ml-hero__link-play" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor" />
                </svg>
              </span>
              Nasıl Çalışır?
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {showSplitLayout ? (
        <div className="ml-hero__mist" aria-hidden />
      ) : null}

      <div
        className={cn(
          "memoora-intro-video-card",
          "ml-hero__media",
          showVideo && "memoora-intro-video-card--visible",
          isExpanded && "memoora-intro-video-card--expanded",
          isSettled && "memoora-intro-video-card--settled",
          showSplitLayout && "ml-hero__media--split"
        )}
      >
        <div className="memoora-intro-video-card__inner">
          {!useFallback ? (
            <video
              ref={videoRef}
              className="memoora-intro-video"
              src={heroVideoSrc}
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
          {showSplitLayout && useLandingHeroVideo && LANDING_HERO_MASKS_PHONE_SCREEN ? (
            <div className="ml-hero__phone-veil" aria-hidden>
              <span className="ml-hero__phone-veil-shine" />
              <span className="ml-hero__phone-veil-glow" />
              <span className="ml-hero__phone-veil-grain" />
            </div>
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
              isExpanded && !showSplitLayout && "memoora-intro-final-overlay--visible"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "ml-hero__fog",
              showSplitLayout && "ml-hero__fog--visible"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "ml-hero__scene-glow",
              showSplitLayout && "ml-hero__scene-glow--visible"
            )}
            aria-hidden
          />
        </div>
      </div>
      </div>

      {showLandingExtras ? (
        <motion.div
          className="ml-hero-feature-strip"
          aria-label="Memoora özellikleri"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: EASE }}
        >
          <div className="ml-hero-feature-strip__grid">
            {HERO_FEATURES.map((item, i) => (
              <motion.div
                key={item.title}
                className="ml-hero-feature-strip__item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.32 + i * 0.07, ease: EASE }}
              >
                <span className="ml-hero-feature-strip__icon" aria-hidden>
                  <HeroFeatureIcon type={item.icon} />
                </span>
                <span className="ml-hero-feature-strip__text">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </section>
    </>
  );
}
