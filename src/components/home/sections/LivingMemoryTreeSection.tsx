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

export function LivingMemoryTreeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const tree = section.querySelector(".cine-tree__frame");
      const leaves = gsap.utils.toArray<HTMLElement>(".cine-tree__leaf");
      const message = section.querySelector(".cine-tree__message");
      const count = section.querySelector(".cine-tree__count");

      gsap.set(tree, { scale: 0.995, opacity: 1, filter: "brightness(0.96) saturate(0.98)" });
      gsap.set(leaves, { opacity: 0.85, scale: 0.96 });
      gsap.set(message, { opacity: 1, y: 0 });
      gsap.set(count, { opacity: 0.9 });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
          },
        });
        tl.to(tree, { scale: 1, opacity: 1, filter: "brightness(1) saturate(1)", duration: 1.4, ease: "none" });
        tl.to(leaves, { opacity: 1, scale: 1, stagger: 0.12, duration: 1, ease: "none" }, 0.5);
        tl.to(message, { opacity: 1, y: 0, duration: 0.7 }, 1.1);
        tl.to(count, { opacity: 1, duration: 0.5 }, 1.2);
      });

      mm.add("(max-width: 1023px)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              end: "bottom 35%",
              scrub: 0.5,
            },
          })
          .to(tree, { scale: 1, opacity: 1, filter: "brightness(1) saturate(1)", duration: 1 })
          .to(leaves, { opacity: 1, scale: 1, stagger: 0.1 }, 0.25)
          .to(message, { opacity: 1, y: 0 }, 0.55)
          .to(count, { opacity: 1 }, 0.65);
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
        <div className="cine-tree__copy cine-container">
          <p className="cine-eyebrow">YAŞAYAN ANI AĞACI</p>
          <SplitTextReveal as="h2" className="cine-heading cine-heading--light">
            Her mesaj,
            <br />
            yeni bir yaprak.
          </SplitTextReveal>
          <ScrollReveal>
            <p className="cine-body">
              Misafirlerin bıraktığı her mesaj çiftin anı ağacında yeni bir
              yaprağa dönüşür.
            </p>
            <p className="cine-body">
              Düğün sona erer; bırakılan mesajlar yaşamaya devam eder.
            </p>
          </ScrollReveal>
        </div>

        <div className="cine-tree__visual">
          <div className="cine-tree__frame">
            <Image
              src={ASSETS.treeHero}
              alt="Memoora yaşayan anı ağacı"
              fill
              sizes="(max-width: 768px) 92vw, 60vw"
              className="cine-tree__image"
            />
          </div>

          <button type="button" className="cine-tree__leaf" style={{ "--x": "22%", "--y": "30%" } as React.CSSProperties} aria-label="Mesaj yaprağı" />
          <button type="button" className="cine-tree__leaf" style={{ "--x": "68%", "--y": "28%" } as React.CSSProperties} aria-label="Mesaj yaprağı" />
          <button type="button" className="cine-tree__leaf" style={{ "--x": "48%", "--y": "20%" } as React.CSSProperties} aria-label="Mesaj yaprağı" />
          <button type="button" className="cine-tree__leaf" style={{ "--x": "36%", "--y": "44%" } as React.CSSProperties} aria-label="Mesaj yaprağı" />

          <aside className="cine-tree__message">
            <p className="cine-tree__guest">Zeynep</p>
            <p className="cine-tree__quote">
              “Bir ömür boyunca hep böyle gülümseyin.”
            </p>
          </aside>

          <p className="cine-tree__count">248 mesaj yaprağı</p>
        </div>
      </div>
    </section>
  );
}
