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

const PANELS = [
  {
    title: "Tek dokunuş",
    text: "Kart, anahtarlık, magnet veya jeton — misafirler fiziksel bir nesneyle özel dünyaya girer.",
  },
  {
    title: "Özel bellek",
    text: "Her dokunuş çiftin kapalı anı evrenini açar. Uygulama indirme yok; sadece zarif bir köprü.",
  },
  {
    title: "Yaşayan bağ",
    text: "Ürün, düğün bittikten sonra da hatıraları taşıyan bir kapı olarak kalır.",
  },
] as const;

export function NfcExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      const product = productRef.current;
      if (!section || !product || reduced) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px)", () => {
        gsap.to(product, {
          rotateY: 3,
          rotateX: -2,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            scrub: 0.8,
          },
        });

        gsap.fromTo(
          ".cine-nfc__ring",
          { opacity: 0.2, scale: 0.92 },
          {
            opacity: 0.75,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          },
        );
      });

      const onMove = (event: PointerEvent) => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        const rect = product.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
        gsap.to(product, {
          rotateY: x,
          rotateX: y,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const onLeave = () => {
        gsap.to(product, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.7,
          ease: "power3.out",
        });
      };

      product.addEventListener("pointermove", onMove);
      product.addEventListener("pointerleave", onLeave);

      return () => {
        product.removeEventListener("pointermove", onMove);
        product.removeEventListener("pointerleave", onLeave);
        mm.revert();
      };
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="nfc-urunler"
      className="cine-nfc"
      aria-label="NFC ürün deneyimi"
    >
      <div className="cine-nfc__layout">
        <div ref={productRef} className="cine-nfc__product">
          <div className="cine-nfc__frame">
            <Image
              src={ASSETS.landingCardNote}
              alt="Memoora NFC yaprak ürünü"
              fill
              sizes="(max-width: 900px) 100vw, 44vw"
              className="cine-nfc__image"
            />
            <span className="cine-nfc__ring" aria-hidden />
            <span className="cine-nfc__point" aria-hidden />
          </div>
        </div>

        <div className="cine-nfc__panels">
          <p className="cine-eyebrow">NFC Ürünler</p>
          <SplitTextReveal as="h2" className="cine-heading">
            Bir hatıradan daha fazlası.
          </SplitTextReveal>
          <ScrollReveal>
            <p className="cine-body cine-nfc__lead">
              Memoora NFC ürünleri, misafirleri çiftin yaşayan anı dünyasına tek
              dokunuşla bağlar.
            </p>
          </ScrollReveal>

          {PANELS.map((panel) => (
            <ScrollReveal key={panel.title} className="cine-nfc__panel" y={22}>
              <h3>{panel.title}</h3>
              <p>{panel.text}</p>
              <span className="cine-gold-line" aria-hidden />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
