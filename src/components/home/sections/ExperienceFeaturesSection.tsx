"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ASSETS } from "@/lib/assets";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

export function ExperienceFeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const panels = gsap.utils.toArray<HTMLElement>(".cine-feat__panel");
      const lines = gsap.utils.toArray<HTMLElement>(".cine-feat__line");

      panels.forEach((panel, index) => {
        const from =
          index % 2 === 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";

        gsap.fromTo(
          panel,
          { clipPath: from },
          {
            clipPath: "inset(0 0% 0 0%)",
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 82%",
              end: "top 40%",
              scrub: 0.55,
            },
          },
        );
      });

      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              end: "top 55%",
              scrub: true,
            },
          },
        );
      });
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      className="cine-feat"
      aria-label="Quiz ve playlist"
    >
      <div className="cine-feat__intro cine-container">
        <p className="cine-eyebrow">Çift Deneyimi</p>
        <SplitTextReveal as="h2" className="cine-heading cine-heading--light">
          Ağacın yanında iki zarif ritüel
        </SplitTextReveal>
      </div>

      <article className="cine-feat__panel">
        <div className="cine-feat__media">
          <Image
            src={ASSETS.quizLeadersBg}
            alt=""
            fill
            sizes="100vw"
            className="cine-feat__image"
          />
          <div className="cine-feat__scrim" aria-hidden />
        </div>
        <div className="cine-feat__text">
          <p className="cine-eyebrow">Birlikte Eğlenin</p>
          <h3 className="cine-feat__title">Çifti ne kadar tanıyorsun?</h3>
          <span className="cine-feat__line" aria-hidden />
          <p className="cine-body">
            Canlı sıralama ve düğüne özel sorular.
          </p>
        </div>
      </article>

      <article className="cine-feat__panel">
        <div className="cine-feat__media">
          <Image
            src={ASSETS.galleryBg}
            alt=""
            fill
            sizes="100vw"
            className="cine-feat__image"
          />
          <div className="cine-feat__scrim" aria-hidden />
        </div>
        <div className="cine-feat__text">
          <p className="cine-eyebrow">O Geceyi Dinle</p>
          <h3 className="cine-feat__title">Düğünün sesi hep seninle.</h3>
          <span className="cine-feat__line" aria-hidden />
          <p className="cine-body">
            Çiftin seçtiği parçalar ve düğün playlist’i.
          </p>
        </div>
      </article>
    </section>
  );
}
