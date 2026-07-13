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

const STEPS = [
  {
    id: "01",
    title: "Dokun",
    body: "NFC ürününü telefona yaklaştır.",
  },
  {
    id: "02",
    title: "Hatıranı Bırak",
    body: "Mesajını, fotoğrafını veya videonu ekle.",
  },
  {
    id: "03",
    title: "Ağacı Büyüt",
    body: "Her katkı yaşayan anı ağacının bir parçasına dönüşür.",
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

      mm.add("(min-width: 900px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".cine-steps__item");
        const visuals = gsap.utils.toArray<HTMLElement>(".cine-steps__visual-layer");
        const progress = section.querySelector(".cine-steps__progress-fill");

        gsap.set(steps, { opacity: 0.28, y: 28, filter: "blur(4px)" });
        gsap.set(steps[0], { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(visuals, { opacity: 0, clipPath: "inset(0 0 100% 0)" });
        gsap.set(visuals[0], { opacity: 1, clipPath: "inset(0 0 0% 0)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.85,
            anticipatePin: 1,
          },
        });

        steps.forEach((_, index) => {
          if (index === 0) return;
          const prev = index - 1;
          tl.to(
            steps[prev],
            { opacity: 0.2, y: -24, filter: "blur(5px)", duration: 1 },
            index,
          );
          tl.to(
            steps[index],
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 },
            index,
          );
          tl.to(
            visuals[prev],
            { opacity: 0, clipPath: "inset(0 0 100% 0)", duration: 1 },
            index,
          );
          tl.to(
            visuals[index],
            { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 1 },
            index,
          );
        });

        if (progress) {
          tl.to(progress, { scaleY: 1, ease: "none", duration: steps.length }, 0);
        }
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
      <div className="cine-steps__inner">
        <div className="cine-steps__copy">
          <p className="cine-eyebrow">Deneyim</p>
          <SplitTextReveal as="h2" className="cine-heading">
            Üç dokunuşta yaşayan dünya
          </SplitTextReveal>

          <div className="cine-steps__progress" aria-hidden>
            <span className="cine-steps__progress-fill" />
          </div>

          <ol className="cine-steps__list">
            {STEPS.map((step) => (
              <li key={step.id} className="cine-steps__item">
                <span className="cine-steps__num">{step.id}</span>
                <h3 className="cine-steps__title">{step.title}</h3>
                <p className="cine-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="cine-steps__visual">
          <div className="cine-steps__visual-layer">
            <Image
              src={ASSETS.landingCardNote}
              alt="Memoora NFC ürünü"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              className="cine-steps__image"
            />
            <span className="cine-steps__pulse" aria-hidden />
          </div>
          <div className="cine-steps__visual-layer">
            <Image
              src={ASSETS.landingCardMemories}
              alt="Anı bırakma deneyimi"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              className="cine-steps__image"
            />
          </div>
          <div className="cine-steps__visual-layer">
            <Image
              src={ASSETS.treeHero}
              alt="Büyüyen anı ağacı"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              className="cine-steps__image"
            />
            <span className="cine-steps__orb" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
