"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PremiumInviteExperience } from "@/components/invite/PremiumInviteExperience";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getMockCoupleBySlug } from "@/lib/mock-data";
import type { Couple } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

function buildPreviewCouple(): Couple {
  const base =
    getMockCoupleBySlug("berkin-beste") ?? getMockCoupleBySlug("mert-irem");
  if (!base) {
    throw new Error("Demo couple missing for invite preview");
  }

  return {
    ...base,
    invitationEnabled: true,
    rsvpEnabled: false,
    status: "active",
    venueName: "Casa Linda Garden",
    venueAddress: "Çankaya, Ankara",
    weddingTime: "19:00",
    weddingDate: base.weddingDate || "2026-08-22",
  };
}

export function DigitalInvitationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const previewCouple = useMemo(() => buildPreviewCouple(), []);

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const phone = section.querySelector(".cine-invite__phone");
      const copy = section.querySelectorAll(".cine-invite__copy > *");

      gsap.set(copy, { opacity: 0.78, y: 12 });
      if (phone) gsap.set(phone, { opacity: 0.92, y: 24 });

      // One-shot reveal so invite interactions stay interactive (no scrub lock)
      gsap.to(copy, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });
      gsap.to(phone, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
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
      id="davetiye"
      className="cine-invite"
      aria-label="Ücretsiz dijital davetiye"
    >
      <div className="cine-container cine-invite__grid">
        <div className="cine-invite__copy">
          <p className="cine-eyebrow">ÜCRETSİZ DİJİTAL DAVETİYE</p>
          <span className="cine-free-badge">Ücretsiz Dahil</span>
          <SplitTextReveal as="h2" className="cine-heading">
            Davetiyen hazır.
            <br />
            Üstelik ücretsiz.
          </SplitTextReveal>
          <ScrollReveal>
            <p className="cine-body">
              Size özel dijital davetiyeyi tek bağlantıyla paylaşın.
              Misafirleriniz katılım durumlarını bildirsin; siz de tüm
              yanıtları admin panelinizden takip edin.
            </p>
          </ScrollReveal>
          <ul className="cine-feature-tags">
            <li>Ücretsiz davetiye</li>
            <li>Mobil uyumlu</li>
            <li>Tek bağlantıyla paylaşım</li>
            <li>Katılım bildirimi</li>
          </ul>
        </div>

        <div className="cine-invite__phone visual-stage">
          <div className="cine-invite__phone-bezel">
            <div className="cine-invite__phone-screen">
              <PremiumInviteExperience couple={previewCouple} embedded />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
