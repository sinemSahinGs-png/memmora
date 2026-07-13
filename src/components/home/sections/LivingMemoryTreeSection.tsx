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

export function LivingMemoryTreeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const tree = section.querySelector(".cine-tree__frame");
      const fog = section.querySelector(".cine-tree__fog");
      const leaves = gsap.utils.toArray<HTMLElement>(".cine-tree__leaf");
      const orbs = gsap.utils.toArray<HTMLElement>(".cine-tree__orb");
      const message = section.querySelector(".cine-tree__closing");
      const stage = section.querySelector(".cine-tree__stage");

      gsap.set(tree, { scale: 0.96, opacity: 0.35, filter: "brightness(0.45)" });
      gsap.set(leaves, { opacity: 0, scale: 0.7, rotate: -8 });
      gsap.set(orbs, { opacity: 0, scale: 0.6, y: 20 });
      gsap.set(message, { opacity: 0, y: 24 });
      if (fog) gsap.set(fog, { opacity: 0.7, yPercent: 10 });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=250%",
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
          },
        });

        tl.to(tree, {
          scale: 1,
          opacity: 1,
          filter: "brightness(1)",
          duration: 2,
          ease: "none",
        });
        if (fog) {
          tl.to(fog, { opacity: 0.25, yPercent: -8, duration: 2, ease: "none" }, 0);
        }
        tl.to(
          leaves,
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            stagger: 0.15,
            duration: 1.4,
            ease: "none",
          },
          1.2,
        );
        tl.to(
          orbs,
          {
            opacity: 0.9,
            scale: 1,
            y: 0,
            stagger: 0.18,
            duration: 1.5,
            ease: "none",
          },
          2,
        );
        tl.to(message, { opacity: 1, y: 0, duration: 1.2, ease: "none" }, 3);
        if (stage) {
          tl.to(stage, { "--bloom": 0.35, duration: 3, ease: "none" }, 0);
        }
      });

      mm.add("(max-width: 767px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "bottom 20%",
              scrub: 0.85,
            },
          })
          .to(tree, { scale: 1, opacity: 1, filter: "brightness(1)", duration: 1 })
          .to(leaves, { opacity: 1, scale: 1, rotate: 0, stagger: 0.1 }, 0.2)
          .to(orbs, { opacity: 0.85, scale: 1, y: 0, stagger: 0.1 }, 0.45)
          .to(message, { opacity: 1, y: 0 }, 0.7);
      });

      return () => mm.revert();
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="ani-agaci"
      className="cine-tree"
      aria-label="Yaşayan anı ağacı"
    >
      <div className="cine-tree__stage">
        <div className="cine-tree__fog" aria-hidden />
        <div className="cine-tree__copy">
          <p className="cine-eyebrow">Anı Ağacı</p>
          <SplitTextReveal as="h2" className="cine-heading cine-heading--light">
            Her katkıyla büyüyen yaşayan bellek
          </SplitTextReveal>
        </div>

        <div className="cine-tree__visual">
          <div className="cine-tree__frame">
            <Image
              src={ASSETS.treeHero}
              alt="Memoora yaşayan anı ağacı"
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              className="cine-tree__image"
            />
          </div>

          <span className="cine-tree__leaf" style={{ "--x": "18%", "--y": "28%" } as React.CSSProperties} />
          <span className="cine-tree__leaf" style={{ "--x": "72%", "--y": "34%" } as React.CSSProperties} />
          <span className="cine-tree__leaf" style={{ "--x": "56%", "--y": "18%" } as React.CSSProperties} />
          <span className="cine-tree__leaf" style={{ "--x": "34%", "--y": "42%" } as React.CSSProperties} />

          <span className="cine-tree__orb" style={{ "--x": "22%", "--y": "58%" } as React.CSSProperties} />
          <span className="cine-tree__orb cine-tree__orb--soft" style={{ "--x": "78%", "--y": "52%" } as React.CSSProperties} />
          <span className="cine-tree__orb" style={{ "--x": "48%", "--y": "68%" } as React.CSSProperties} />
        </div>

        <p className="cine-tree__closing">
          Her mesaj ağacın yeni bir yaprağıdır.
        </p>
      </div>
    </section>
  );
}
