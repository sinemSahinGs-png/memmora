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

const CINE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function PersonalizedProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const items = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-product__item"),
      );

      items.forEach((item) => {
        const isMagnet = item.classList.contains("cine-product__item--magnet");
        const parallax = item.querySelector<HTMLElement>(
          ".cine-product__parallax",
        );
        const figure = item.querySelector<HTMLElement>(
          ".cine-product__figure",
        );
        const sweep = item.querySelector<HTMLElement>(".cine-product__sweep");
        const tag = item.querySelector<HTMLElement>(".cine-product__nfc-tag");
        const title = item.querySelector<HTMLElement>(".cine-product__copy h3");
        const blurb = item.querySelector<HTMLElement>(".cine-product__copy p");

        if (reduced) {
          gsap.set([figure, tag, title, blurb].filter(Boolean), {
            opacity: 1,
            clearProps: "transform,filter",
          });
          return;
        }

        const enterRotate = isMagnet ? -5 : 5;
        const restRotate = isMagnet ? 4 : -3.5;

        if (figure) {
          gsap.set(figure, {
            opacity: 0,
            y: 55,
            scale: 0.9,
            rotate: enterRotate,
            filter: "blur(5px)",
            transformOrigin: isMagnet ? "48% 62%" : "52% 22%",
          });
        }
        if (tag) gsap.set(tag, { opacity: 0, y: 12 });
        if (title) gsap.set(title, { opacity: 0, y: 12 });
        if (blurb) gsap.set(blurb, { opacity: 0, y: 8 });
        if (sweep) {
          gsap.set(sweep, {
            opacity: 0,
            xPercent: -70,
            yPercent: -55,
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            once: true,
          },
        });

        if (figure) {
          tl.to(
            figure,
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotate: restRotate,
              filter: "blur(0px)",
              duration: 1.1,
              ease: CINE_EASE,
            },
            0,
          );
        }

        if (tag) {
          tl.to(
            tag,
            { opacity: 1, y: 0, duration: 0.48, ease: "power2.out" },
            0.58,
          );
        }
        if (title) {
          tl.to(
            title,
            { opacity: 1, y: 0, duration: 0.52, ease: "power2.out" },
            0.7,
          );
        }
        if (blurb) {
          tl.to(
            blurb,
            { opacity: 1, y: 0, duration: 0.52, ease: "power2.out" },
            0.82,
          );
        }

        if (isMagnet && sweep) {
          tl.fromTo(
            sweep,
            { opacity: 0, xPercent: -70, yPercent: -55 },
            {
              opacity: 0.5,
              xPercent: 75,
              yPercent: 60,
              duration: 0.9,
              ease: "power1.inOut",
            },
            0.9,
          ).to(
            sweep,
            { opacity: 0, duration: 0.28, ease: "power1.out" },
            ">-0.15",
          );
        }

        if (!isMagnet && figure) {
          tl.to(
            figure,
            {
              rotate: restRotate + 0.8,
              duration: 0.55,
              ease: "sine.inOut",
            },
            1.12,
          )
            .to(figure, {
              rotate: restRotate - 0.5,
              duration: 0.55,
              ease: "sine.inOut",
            })
            .to(figure, {
              rotate: restRotate,
              duration: 0.4,
              ease: "sine.out",
            });
        }

        if (parallax) {
          gsap.fromTo(
            parallax,
            { y: isMagnet ? 8 : 8 },
            {
              y: isMagnet ? -10 : -12,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
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
          <article
            key={product.id}
            className={`cine-product__item cine-product__item--${product.id}`}
          >
            <div className="cine-product__visual">
              <span className="cine-product__atmos" aria-hidden />
              <span className="cine-product__dust" aria-hidden />
              <div className="cine-product__parallax">
                <div className="cine-product__hover">
                  <div className="cine-product__figure">
                    <div className="cine-product__asset">
                      <span
                        className="cine-product__contact-shadow"
                        aria-hidden
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${product.src}?v=3`}
                        alt={product.alt}
                        width={product.width}
                        height={product.height}
                        decoding="async"
                        className="cine-product__img"
                      />
                      {product.id === "magnet" ? (
                        <span className="cine-product__sweep" aria-hidden />
                      ) : null}
                      <span className="cine-product__nfc-tag">NFC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="cine-product__copy">
              <h3>{product.name}</h3>
              <p>{product.blurb}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
