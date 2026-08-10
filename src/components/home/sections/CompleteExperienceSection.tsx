"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: "01",
    title: "Davet et.",
    body: "Size özel dijital davetiyenizi paylaşın.",
  },
  {
    id: "02",
    title: "Anları topla.",
    body: "Fotoğraflar, videolar ve mesajlar tek yerde buluşsun.",
  },
  {
    id: "03",
    title: "Hatıranı yaşat.",
    body: "O gece, düğünden sonra da sizinle kalsın.",
  },
] as const;

export function CompleteExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const items = gsap.utils.toArray<HTMLElement>(".cine-complete__item");
      const nums = gsap.utils.toArray<HTMLElement>(".cine-complete__num");

      gsap.set(items, { opacity: 0.28, y: 36, x: -12 });
      gsap.set(nums, { opacity: 0.35, scale: 0.86 });

      items.forEach((item, index) => {
        const num = nums[index];
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            end: "top 52%",
            scrub: 0.55,
          },
        });
        tl.to(item, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 1,
          ease: "none",
        });
        if (num) {
          tl.to(
            num,
            {
              opacity: 1,
              scale: 1,
              color: "#e1c467",
              duration: 0.7,
              ease: "none",
            },
            0,
          );
        }
      });
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="deneyim-ozet"
      className="cine-complete"
      aria-label="Davetiyeden hatıraya"
    >
      <div className="cine-container">
        <SplitTextReveal as="h2" className="cine-heading">
          Davetiyeden
          <br />
          Hatıraya.
        </SplitTextReveal>

        <ol className="cine-complete__list">
          {STEPS.map((step) => (
            <li key={step.id} className="cine-complete__item">
              <span className="cine-complete__num">{step.id}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
