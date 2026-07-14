"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SCRUB_VIDEO_SRC = "/memoora-hero-scrub.mp4";
const LERP_FACTOR = 0.12;
const SEEK_THRESHOLD = 0.015;
const MOBILE_HEIGHT = "180svh";
const DESKTOP_HEIGHT = "380vh";

interface ScrollScrubHeroProps {
  demoHref?: string;
}

export function ScrollScrubHero({ demoHref = "#demo" }: ScrollScrubHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const targetProgressRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const isVideoReadyRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sectionHeight, setSectionHeight] = useState(DESKTOP_HEIGHT);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateSectionHeight = () => {
      setSectionHeight(mediaQuery.matches ? MOBILE_HEIGHT : DESKTOP_HEIGHT);
    };

    updateSectionHeight();
    mediaQuery.addEventListener("change", updateSectionHeight);
    window.addEventListener("resize", updateSectionHeight);

    return () => {
      mediaQuery.removeEventListener("change", updateSectionHeight);
      window.removeEventListener("resize", updateSectionHeight);
    };
  }, []);

  /* Typography entrance only — video/scrub unchanged */
  useLayoutEffect(() => {
    if (reduceMotion || isLoading) return;

    const heading = headingRef.current;
    const body = bodyRef.current;
    const hint = hintRef.current;
    const note = noteRef.current;
    const actions = actionsRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    if (!heading || !body || !hint || !line1 || !line2) return;

    const words1 = gsap.utils.toArray<HTMLElement>(line1.querySelectorAll(".hero-word"));
    const words2 = gsap.utils.toArray<HTMLElement>(line2.querySelectorAll(".hero-word"));
    const ctaItems = actions
      ? gsap.utils.toArray<HTMLElement>(actions.children)
      : [];

    const ctx = gsap.context(() => {
      gsap.set([body, note, hint, ...ctaItems].filter(Boolean), {
        opacity: 0,
        y: 16,
        filter: "blur(6px)",
      });
      gsap.set([...words1, ...words2], {
        opacity: 0,
        y: 36,
        rotateX: -8,
        filter: "blur(8px)",
        transformOrigin: "50% 100%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(
        words1,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.08,
        },
        0.15,
      );

      tl.to(
        words2,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.08,
        },
        "-=0.72",
      );

      tl.to(
        body,
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75 },
        "-=0.35",
      );

      if (note) {
        tl.to(
          note,
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 },
          "-=0.25",
        );
      }

      if (ctaItems.length) {
        tl.to(
          ctaItems,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.75,
            stagger: 0.1,
          },
          "-=0.15",
        );
      }

      tl.to(
        hint,
        { opacity: 0.48, y: 0, filter: "blur(0px)", duration: 0.65 },
        "-=0.2",
      );

      /* Persist final states — no leftover clip/opacity */
      tl.set([...words1, ...words2, body, note, ...ctaItems].filter(Boolean), {
        clearProps: "filter",
        opacity: 1,
        y: 0,
        rotateX: 0,
      });

      gsap.to(hint, {
        y: 6,
        opacity: 0.62,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: tl.duration() * 0.02,
      });
    }, heading);

    return () => ctx.revert();
  }, [reduceMotion, isLoading]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let cancelled = false;

    const markReady = () => {
      if (cancelled || isVideoReadyRef.current) return;
      isVideoReadyRef.current = true;
      video.pause();
      currentTimeRef.current = 0;
      if (Math.abs(video.currentTime) > SEEK_THRESHOLD) {
        video.currentTime = 0;
      }
      setIsLoading(false);
    };

    const onLoadedMetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      durationRef.current = video.duration;
    };

    const onLoadedData = () => {
      markReady();
    };

    const onError = () => {
      setIsLoading(false);
    };

    isVideoReadyRef.current = video.readyState >= 2;
    if (isVideoReadyRef.current) {
      durationRef.current = video.duration;
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("error", onError);

    if (video.readyState >= 1) onLoadedMetadata();
    if (video.readyState >= 2) onLoadedData();

    let scrollTrigger: ScrollTrigger | null = null;
    let scrubTick: (() => void) | null = null;

    if (!reduceMotion) {
      const sticky = stickyRef.current;
      if (!sticky) return;

      gsap.registerPlugin(ScrollTrigger);

      scrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: sticky,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetProgressRef.current = self.progress;
        },
      });

      scrubTick = () => {
        if (!isVideoReadyRef.current) return;

        const duration = durationRef.current;
        if (!duration) return;

        const progress = targetProgressRef.current;
        const target = progress * duration;
        const lerpFactor = progress > 0.9 ? 0.28 : LERP_FACTOR;

        currentTimeRef.current += (target - currentTimeRef.current) * lerpFactor;

        if (progress >= 0.995) {
          currentTimeRef.current = target;
        }

        if (!video.paused) video.pause();

        if (Math.abs(video.currentTime - currentTimeRef.current) > SEEK_THRESHOLD) {
          video.currentTime = currentTimeRef.current;
        }

        if (hintRef.current) {
          hintRef.current.style.opacity = String(Math.max(0, 0.55 - progress * 2.2));
        }

        if (copyRef.current) {
          const copyOpacity =
            progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) / 0.12) : 1;
          const lift = progress > 0.88 ? (progress - 0.88) * -5 : 0;
          copyRef.current.style.opacity = String(copyOpacity);
          copyRef.current.style.transform = `translate3d(0, ${lift}vh, 0)`;
        }
      };

      gsap.ticker.add(scrubTick);

      const onResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", onResize);
      ScrollTrigger.refresh();

      return () => {
        cancelled = true;
        window.removeEventListener("resize", onResize);
        if (scrubTick) gsap.ticker.remove(scrubTick);
        scrollTrigger?.kill();
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("error", onError);
      };
    }

    const showStaticFrame = () => {
      if (cancelled) return;
      video.pause();
      video.currentTime = 0;
      setIsLoading(false);
    };

    if (video.readyState >= 2) {
      showStaticFrame();
    } else {
      video.addEventListener("loadeddata", showStaticFrame, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("loadeddata", showStaticFrame);
      video.removeEventListener("error", onError);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.refresh();
  }, [sectionHeight, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`hero-scrub${reduceMotion ? " hero-scrub--static" : ""}`}
      style={{ height: reduceMotion ? "100svh" : sectionHeight }}
      aria-label="Memoora cinematic hero"
    >
      <div ref={stickyRef} className="hero-scrub__sticky">
        <video
          ref={videoRef}
          className={`hero-scrub__video${isLoading ? "" : " hero-scrub__video--ready"}`}
          src={SCRUB_VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden
        />

        <div className="hero-scrub__wash" aria-hidden />
        <div className="hero-scrub__veil" aria-hidden />

        <div className="hero-scrub__particles" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="hero-scrub__particle"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
        </div>

        <div
          className={`hero-scrub__loading${isLoading ? "" : " hero-scrub__loading--hidden"}`}
          aria-live="polite"
          aria-busy={isLoading}
        >
          <span className="hero-scrub__loading-pulse" />
        </div>

        <div ref={copyRef} className="hero-scrub__copy">
          <div className="hero-scrub__copy-inner">
            <h1 ref={headingRef} className="hero-title">
              <span ref={line1Ref} className="hero-title-line">
                <span className="hero-word">Düğün</span>
                <span className="hero-word">Anıları</span>
              </span>
              <span
                ref={line2Ref}
                className="hero-title-line hero-title-line--accent"
              >
                <span className="hero-word">Artık</span>
                <span className="hero-word">Yaşıyor</span>
              </span>
            </h1>

            <p ref={bodyRef} className="hero-scrub__supporting">
              Ücretsiz dijital davetiye, interaktif düğün quiz’i ve size özel NFC
              hatıra ürünleri tek bir deneyimde.
            </p>

            <p ref={noteRef} className="hero-scrub__micro">
              <span className="hero-scrub__micro-dot" aria-hidden />
              Dijital davetiye ücretsiz dahil.
            </p>

            <div ref={actionsRef} className="hero-scrub__actions">
              <a href={demoHref} className="hero-cta hero-cta--primary">
                Demo Düğünü Gör
              </a>
              <a href="#davetiye" className="hero-cta hero-cta--secondary">
                <span className="hero-cta__play" aria-hidden />
                Nasıl Çalışır?
              </a>
            </div>
          </div>
        </div>

        <p ref={hintRef} className="hero-scrub__hint">
          KEŞFETMEK İÇİN KAYDIR
        </p>
      </div>
    </section>
  );
}
