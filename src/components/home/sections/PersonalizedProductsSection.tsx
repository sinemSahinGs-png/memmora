"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCT_ASSETS } from "@/lib/memoora-purchase/products";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    ...PRODUCT_ASSETS.magnet,
    name: "NFC Yaprak",
    blurb: "Tek dokunuşla düğün hikâyenize açılır.",
  },
  {
    ...PRODUCT_ASSETS.keychain,
    name: "NFC Anahtarlık",
    blurb: "Hatıranızı her gün yanınızda taşıyın.",
  },
] as const;

export function PersonalizedProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const items = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-product__item"),
      );
      gsap.set(items, { opacity: 0.72, y: 28 });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        stagger: 0.14,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="nfc-urunler"
      className="cine-product"
      aria-label="Fiziksel hatıralar"
    >
      <div className="cine-container cine-product__intro">
        <p className="cine-eyebrow">FİZİKSEL HATIRALAR</p>
        <SplitTextReveal as="h2" className="cine-heading">
          Anıların
          <br />
          Fiziksel Hali.
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body">
            Düğününüzden size kalan küçük, kişisel hatıralar.
          </p>
        </ScrollReveal>
      </div>

      <div className="cine-product__grid">
        {PRODUCTS.map((product) => (
          <article key={product.id} className="cine-product__item">
            <div className="cine-product__visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${product.src}?v=3`}
                alt={product.alt}
                width={product.width}
                height={product.height}
                decoding="async"
              />
              <span className="cine-product__nfc-tag">NFC</span>
            </div>
            <h3>{product.name}</h3>
            <p>{product.blurb}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
