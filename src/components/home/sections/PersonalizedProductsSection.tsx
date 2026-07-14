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

export function PersonalizedProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const magnet = section.querySelector(".cine-product__magnet");
      const notes = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-product__annotations p"),
      );
      const keychain = section.querySelector(".cine-product__keychain");
      const pulse = section.querySelector(".cine-product__nfc-glow");

      gsap.set(magnet, { opacity: 0.95, y: 16, rotate: -2 });
      gsap.set(notes, { opacity: 0.35, x: -8 });
      gsap.set(keychain, { opacity: 0.9, y: 18 });
      if (pulse) gsap.set(pulse, { opacity: 0.4, scale: 0.9 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "bottom 30%",
          scrub: 0.55,
          onLeave: () => {
            gsap.set([magnet, keychain, ...notes], {
              opacity: 1,
              x: 0,
              y: 0,
              clearProps: "filter",
            });
          },
        },
      });

      tl.to(magnet, { opacity: 1, y: 0, rotate: 3, ease: "none", duration: 1.2 });
      tl.to(notes[0], { opacity: 1, x: 0, duration: 0.5 }, 0.35);
      tl.to(notes[1], { opacity: 1, x: 0, duration: 0.5 }, 0.65);
      tl.to(pulse, { opacity: 0.85, scale: 1.08, duration: 0.45 }, 0.75);
      tl.to(notes[2], { opacity: 1, x: 0, duration: 0.5 }, 0.95);
      tl.to(keychain, { opacity: 1, y: 0, duration: 0.7 }, 1.1);
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="nfc-urunler"
      className="cine-product"
      aria-label="Kişiye özel NFC hatıraları"
    >
      <div className="cine-container cine-product__intro">
        <p className="cine-eyebrow">KİŞİYE ÖZEL NFC HATIRASI</p>
        <SplitTextReveal as="h2" className="cine-heading">
          Misafirlerine özel.
          <br />
          Sadece size ait.
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body">
            Gelin ve damadın baş harfleriyle kişiselleştirilen yaprak magnet ve
            NFC anahtarlık, Memoora deneyimini kalıcı bir düğün hatırasına
            dönüştürür.
          </p>
          <p className="cine-product__strong">Her çift için özel üretilir.</p>
        </ScrollReveal>
        <ul className="cine-feature-tags">
          <li>Baş harfler</li>
          <li>Düğün tarihi</li>
          <li>Renk seçimi</li>
          <li>NFC bağlantısı</li>
        </ul>
      </div>

      <div className="cine-product__showcase">
        <article className="cine-product__magnet-wrap">
          <div className="cine-product__magnet">
            <div className="cine-product__leaf-stage">
              <Image
                src={ASSETS.leafMagnet}
                alt="Valeriya ve Utku baş harfli yaprak NFC magnet"
                width={460}
                height={613}
                className="cine-product__leaf-img"
              />
              <span className="cine-product__nfc-glow" aria-hidden />
            </div>
          </div>

          <div className="cine-product__annotations">
            <p>
              <span className="cine-product__annotation-line" aria-hidden />
              Kişiye Özel Baş Harfler
            </p>
            <p>
              <span className="cine-product__annotation-line" aria-hidden />
              NFC Etkileşim Noktası
            </p>
            <p>
              <span className="cine-product__annotation-line" aria-hidden />
              Düğüne Özel Üretim
            </p>
          </div>

          <div className="cine-product__copy">
            <h3>Kişiye Özel Yaprak Magnet</h3>
            <p>
              Çiftin baş harfleri ve düğün tarihiyle her düğüne özel olarak
              hazırlanır.
            </p>
          </div>
        </article>

        <article className="cine-product__keychain">
          <div className="cine-product__keychain-visual">
            <Image
              src={ASSETS.leafKeychain}
              alt="Yaprak NFC anahtarlık — halka, zincir ve yaprak gövde"
              width={420}
              height={604}
              className="cine-product__keychain-img"
            />
          </div>
          <div className="cine-product__copy">
            <h3>Yaprak NFC Anahtarlık</h3>
            <p>
              Çiftin özel Memoora sayfasını telefona tek dokunuşla açan yaprak
              biçimli düğün hatırası.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
