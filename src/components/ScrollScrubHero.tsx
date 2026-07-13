"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

const SCRUB_VIDEO_SRC = "/memoora-hero-scrub.mp4";
const LERP_FACTOR = 0.12;
const SEEK_THRESHOLD = 0.015;
const MOBILE_HEIGHT = "320vh";
const DESKTOP_HEIGHT = "500vh";

export function ScrollScrubHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

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

  /* Hero typography entrance — visual/scrub unchanged */
  useLayoutEffect(() => {
    if (reduceMotion || isLoading) return;

    const heading = headingRef.current;
    const body = bodyRef.current;
    const eyebrow = eyebrowRef.current;
    const hint = hintRef.current;
    if (!heading || !body || !eyebrow || !hint) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const split = new SplitType(heading, { types: "words", tagName: "span" });
      const words = split.words ?? [];

      gsap.set([eyebrow, hint], {
        opacity: 0,
        y: 18,
        filter: "blur(8px)",
      });
      gsap.set(body, { opacity: 1 });
      const bodyLines = body.querySelectorAll("[data-line]");
      gsap.set(bodyLines.length ? bodyLines : body, {
        opacity: 0,
        y: 22,
        filter: "blur(6px)",
      });
      gsap.set(words, {
        opacity: 0,
        y: 45,
        rotateX: -8,
        filter: "blur(10px)",
        transformOrigin: "50% 100%",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(eyebrow, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
      });

      tl.to(
        words,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 1.1,
          stagger: 0.09,
        },
        "-=0.15",
      );

      tl.to(
        bodyLines.length ? bodyLines : body,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          stagger: 0.12,
        },
        "-=0.45",
      );

      tl.to(
        hint,
        { opacity: 0.85, y: 0, filter: "blur(0px)", duration: 0.7 },
        "-=0.25",
      );

      gsap.to(hint, {
        y: 7,
        opacity: 1,
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: tl.duration(),
      });

      return () => split.revert();
    });

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
          hintRef.current.style.opacity = String(Math.max(0, 1 - progress * 3.5));
        }

        if (copyRef.current) {
          const copyOpacity =
            progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) / 0.18) : 1;
          const lift = progress > 0.82 ? (progress - 0.82) * -6 : 0;
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
      style={{ height: reduceMotion ? "100vh" : sectionHeight }}
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
          <p ref={eyebrowRef} className="hero-scrub__label">
            MEMOORA
          </p>
          <h1 ref={headingRef} className="hero-scrub__heading">
            <span className="hero-scrub__heading-line">Düğün Anıları Artık</span>{" "}
            <span className="hero-scrub__heading-gold">Yaşıyor</span>
          </h1>
          <p ref={bodyRef} className="hero-scrub__supporting">
            <span data-line>
              NFC ile açılan premium anı deneyimi. Her mesaj bir yaprak olur,
            </span>{" "}
            <span data-line>
              her fotoğraf ağacın etrafında bir anı ışığına dönüşür.
            </span>
          </p>
        </div>

        <p ref={hintRef} className="hero-scrub__hint">
          Keşfetmek için kaydır
        </p>
      </div>
    </section>
  );
}
