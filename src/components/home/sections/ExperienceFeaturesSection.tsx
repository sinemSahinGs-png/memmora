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
          index % 2 === 0
            ? "inset(0 100% 0 0)"
            : "inset(0 0 0 100%)";

        gsap.fromTo(
          panel,
          { clipPath: from, opacity: 0.4 },
          {
            clipPath: "inset(0 0% 0 0%)",
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 80%",
              end: "top 40%",
              scrub: 0.7,
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
      <div className="cine-feat__intro">
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
            sizes="(max-width: 900px) 100vw, 50vw"
            className="cine-feat__image"
          />
        </div>
        <div className="cine-feat__text">
          <h3 className="cine-feat__title">Çifti Ne Kadar Tanıyorsun?</h3>
          <span className="cine-feat__line" aria-hidden />
          <p className="cine-body cine-body--muted">
            Misafirler quiz ile ilişki hikâyesine katılır; skorlar yapraklara
            dönüşerek ağacı zenginleştirir.
          </p>
        </div>
      </article>

      <article className="cine-feat__panel cine-feat__panel--reverse">
        <div className="cine-feat__media">
          <Image
            src={ASSETS.galleryBg}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="cine-feat__image"
          />
        </div>
        <div className="cine-feat__text">
          <h3 className="cine-feat__title">Düğünün Sesini Yeniden Dinle</h3>
          <span className="cine-feat__line" aria-hidden />
          <p className="cine-body cine-body--muted">
            Playlist, o gecenin duygusal atmosferini korur — her dönüşte taze,
            her dinleyişte yakın.
          </p>
        </div>
      </article>
    </section>
  );
}
