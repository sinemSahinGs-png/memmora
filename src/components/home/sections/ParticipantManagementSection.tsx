"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const GUESTS = [
  { name: "Ece Yılmaz", status: "Katılacak", detail: "2 kişi", tone: "yes" },
  { name: "Burak Kaya", status: "Yanıt Bekleniyor", detail: "", tone: "wait" },
  { name: "Selin Akın", status: "Katılamayacak", detail: "", tone: "no" },
  { name: "Mert Demir", status: "Katılacak", detail: "1 kişi", tone: "yes" },
  { name: "Ayşe Korkmaz", status: "Katılacak", detail: "2 kişi", tone: "new" },
] as const;

export function ParticipantManagementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const panel = section.querySelector(".cine-admin__panel");
      const rows = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-admin__row"),
      );
      const attend = section.querySelector("[data-stat='attend']");
      const newRow = section.querySelector(".cine-admin__row--new");

      gsap.set(panel, { opacity: 1, y: 0 });
      gsap.set(rows, { opacity: 1, y: 0 });
      if (newRow) gsap.set(newRow, { opacity: 1, y: 0 });

      if (!panel) return;

      const mm = gsap.matchMedia();

      mm.add("all", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        });

        tl.to(panel, { opacity: 1, y: 0, ease: "none", duration: 1 });
        tl.to(rows.slice(0, 4), { opacity: 1, y: 0, stagger: 0.08, ease: "none" }, 0.15);
        if (attend) {
          tl.add(() => {
            attend.textContent = "143";
          }, 0.6);
        }
        if (newRow) {
          tl.to(newRow, { opacity: 1, y: 0, duration: 0.5, ease: "none" }, 0.7);
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
      id="davetli"
      className="cine-admin"
      aria-label="Davetli yönetimi"
    >
      <div className="cine-container cine-admin__grid">
        <div className="cine-admin__copy">
          <p className="cine-eyebrow">DAVETLİ YÖNETİMİ</p>
          <SplitTextReveal as="h2" className="cine-heading">
            Kim geliyor,
            <br />
            tek ekrandan takip et.
          </SplitTextReveal>
          <ScrollReveal>
            <p className="cine-body">
              Katılacak, katılamayacak ve henüz yanıt vermeyen davetlileri anlık
              olarak görün.
            </p>
          </ScrollReveal>
        </div>

        <div className="cine-admin__panel">
          <div className="cine-admin__stats">
            <div>
              <span>Toplam Davetli</span>
              <strong>186</strong>
            </div>
            <div>
              <span>Katılacak</span>
              <strong data-stat="attend">142</strong>
            </div>
            <div>
              <span>Katılamayacak</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Yanıt Bekleniyor</span>
              <strong>26</strong>
            </div>
          </div>

          <ul className="cine-admin__list">
            {GUESTS.map((guest) => (
              <li
                key={guest.name}
                className={`cine-admin__row${guest.tone === "new" ? " cine-admin__row--new" : ""}`}
              >
                <div>
                  <p className="cine-admin__name">{guest.name}</p>
                  {guest.detail ? (
                    <p className="cine-admin__detail">{guest.detail}</p>
                  ) : null}
                </div>
                <span className={`cine-admin__chip cine-admin__chip--${guest.tone}`}>
                  {guest.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
