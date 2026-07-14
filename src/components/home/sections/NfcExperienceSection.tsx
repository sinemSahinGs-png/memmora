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

      mm.add("(min-width: 1024px)", () => {
        gsap.fromTo(
          product,
          { scale: 1.04, rotateY: -2 },
          {
            scale: 1,
            rotateY: 2,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "bottom 40%",
              scrub: 0.65,
            },
          },
        );

        gsap.fromTo(
          ".cine-nfc__ring",
          { opacity: 0.2, scale: 0.92 },
          {
            opacity: 0.75,
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              end: "center center",
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          ".cine-nfc__annotation-line",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(
          product,
          { scale: 1.04, opacity: 0.7 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: product,
              start: "top 82%",
              end: "top 40%",
              scrub: 0.45,
            },
          },
        );
      });

      const onMove = (event: PointerEvent) => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        if (!window.matchMedia("(min-width: 1024px)").matches) return;
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
      <div className="cine-nfc__layout cine-container">
        <div ref={productRef} className="cine-nfc__product">
          <div className="cine-nfc__frame visual-stage">
            <Image
              src={ASSETS.landingCardNote}
              alt="Memoora NFC yaprak ürünü"
              fill
              sizes="(max-width: 768px) 88vw, 44vw"
              className="cine-nfc__image"
            />
            <span className="cine-nfc__ring" aria-hidden />
            <span className="cine-nfc__point" aria-hidden />
            <div className="cine-nfc__annotation">
              <span className="cine-nfc__annotation-line" aria-hidden />
              <span className="cine-nfc__annotation-text">NFC Etkileşim Noktası</span>
            </div>
          </div>
        </div>

        <div className="cine-nfc__panels">
          <p className="cine-eyebrow">Fiziksel Ürün, Dijital Hatıra</p>
          <SplitTextReveal as="h2" className="cine-heading">
            Hatıranın anahtarı.
          </SplitTextReveal>
          <ScrollReveal>
            <p className="cine-body cine-nfc__lead">
              Memoora anahtarlık, magnet ve kartları çiftin yaşayan anı dünyasını
              tek dokunuşla açar.
            </p>
          </ScrollReveal>

          <ul className="cine-nfc__labels">
            <li>Anahtarlık</li>
            <li>Magnet</li>
            <li>Anı Kartı</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
