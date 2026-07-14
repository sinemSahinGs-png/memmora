"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ASSETS } from "@/lib/assets";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: "01",
    title: "Dokun",
    body: "NFC ürününü telefonuna yaklaştır.",
    label: "NFC Bağlantısı",
  },
  {
    id: "02",
    title: "Hatıranı Bırak",
    body: "Mesajını, fotoğrafını veya videonu ekle.",
    label: "Anı Katkısı",
  },
  {
    id: "03",
    title: "Ağacı Büyüt",
    body: "Her katkı yaşayan anı ağacında yeni bir iz bırakır.",
    label: "Yaşayan Ağaç",
  },
] as const;

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const mm = gsap.matchMedia();

      /* Desktop: keep cinematic pin, shorter than before */
      mm.add("(min-width: 1024px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".cine-steps__desktop-item");
        const visuals = gsap.utils.toArray<HTMLElement>(".cine-steps__visual-layer");
        const progress = section.querySelector(".cine-steps__progress-fill");

        gsap.set(steps, { opacity: 0.28, y: 24, filter: "blur(3px)" });
        gsap.set(steps[0], { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(visuals, { opacity: 0, clipPath: "inset(0 0 100% 0)" });
        gsap.set(visuals[0], { opacity: 1, clipPath: "inset(0 0 0% 0)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section.querySelector(".cine-steps__desktop"),
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        steps.forEach((_, index) => {
          if (index === 0) return;
          const prev = index - 1;
          tl.to(steps[prev], { opacity: 0.22, y: -20, filter: "blur(4px)", duration: 1 }, index);
          tl.to(steps[index], { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 }, index);
          tl.to(visuals[prev], { opacity: 0, clipPath: "inset(0 0 100% 0)", duration: 1 }, index);
          tl.to(visuals[index], { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1 }, index);
        });

        if (progress) {
          tl.to(progress, { scaleY: 1, ease: "none", duration: steps.length }, 0);
        }
      });

      /* Mobile / tablet: natural stacked stages, short scrub reveal */
      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>(".cine-steps__stage").forEach((stage) => {
          const visual = stage.querySelector(".cine-steps__stage-visual");
          gsap.fromTo(
            visual,
            { opacity: 0.4, y: 28, clipPath: "inset(12% 8% 12% 8%)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: stage,
                start: "top 82%",
                end: "top 35%",
                scrub: 0.5,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="nasil-calisir"
      className="cine-steps"
      aria-label="Memoora nasıl çalışır"
    >
      <div className="cine-steps__intro cine-container">
        <p className="cine-eyebrow">Deneyim</p>
        <SplitTextReveal as="h2" className="cine-heading">
          Bir dokunuş, yaşayan bir hatıraya dönüşür.
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body">
            Memoora, fiziksel bir NFC ürününü çiftin dijital anı dünyasına bağlar.
          </p>
        </ScrollReveal>
      </div>

      {/* Mobile / tablet stacked stages */}
      <div className="cine-steps__mobile">
        {STEPS.map((step, index) => (
          <article key={step.id} className="cine-steps__stage">
            <div className="cine-container">
              <span className="cine-steps__num">{step.id}</span>
              <h3 className="cine-steps__title">{step.title}</h3>
              <p className="cine-body">{step.body}</p>
            </div>

            <div className="cine-steps__stage-visual visual-stage">
              {index === 0 && (
                <>
                  <Image
                    src={ASSETS.landingCardNote}
                    alt="Memoora NFC ürünü"
                    fill
                    sizes="88vw"
                    className="cine-steps__image"
                  />
                  <span className="cine-steps__pulse" aria-hidden />
                  <span className="cine-steps__signal" aria-hidden />
                  <span className="cine-steps__chip">{step.label}</span>
                </>
              )}
              {index === 1 && (
                <div className="cine-memory-panel">
                  <p className="cine-memory-panel__guest">Ayşe Yılmaz</p>
                  <p className="cine-memory-panel__quote">
                    “Bu güzel gününüz hep böyle ışıkla hatırlansın.”
                  </p>
                  <span className="cine-memory-panel__attach">Fotoğraf eklendi</span>
                </div>
              )}
              {index === 2 && (
                <>
                  <Image
                    src={ASSETS.treeHero}
                    alt="Büyüyen anı ağacı"
                    fill
                    sizes="88vw"
                    className="cine-steps__image"
                  />
                  <span className="cine-steps__growth-leaf" aria-hidden />
                  <span className="cine-steps__growth-orb" aria-hidden />
                </>
              )}
            </div>

            <div className="cine-steps__stage-progress" aria-hidden>
              <span style={{ width: `${((index + 1) / STEPS.length) * 100}%` }} />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop pinned storytelling */}
      <div className="cine-steps__desktop">
        <div className="cine-steps__inner">
          <div className="cine-steps__copy">
            <div className="cine-steps__progress" aria-hidden>
              <span className="cine-steps__progress-fill" />
            </div>
            <ol className="cine-steps__list">
              {STEPS.map((step) => (
                <li key={step.id} className="cine-steps__desktop-item">
                  <span className="cine-steps__num">{step.id}</span>
                  <h3 className="cine-steps__title">{step.title}</h3>
                  <p className="cine-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="cine-steps__visual visual-stage visual-stage--desktop">
            <div className="cine-steps__visual-layer">
              <Image
                src={ASSETS.landingCardNote}
                alt="Memoora NFC ürünü"
                fill
                sizes="48vw"
                className="cine-steps__image"
              />
              <span className="cine-steps__pulse" aria-hidden />
              <span className="cine-steps__chip">NFC Bağlantısı</span>
            </div>
            <div className="cine-steps__visual-layer">
              <div className="cine-memory-panel cine-memory-panel--overlay">
                <p className="cine-memory-panel__guest">Ayşe Yılmaz</p>
                <p className="cine-memory-panel__quote">
                  “Bu güzel gününüz hep böyle ışıkla hatırlansın.”
                </p>
                <span className="cine-memory-panel__attach">Fotoğraf eklendi</span>
              </div>
            </div>
            <div className="cine-steps__visual-layer">
              <Image
                src={ASSETS.treeHero}
                alt="Büyüyen anı ağacı"
                fill
                sizes="48vw"
                className="cine-steps__image"
              />
              <span className="cine-steps__growth-orb" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
