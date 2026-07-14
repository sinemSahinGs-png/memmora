"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  ITEM_COUNT,
  buildSharedMemories,
  guestByline,
  type SharedMemory,
} from "@/components/home/shared-memories-data";

gsap.registerPlugin(ScrollTrigger);

const DEG = Math.PI / 180;
const PERSPECTIVE = 1600;
const TURNS = 1;
const TILT = 58;
const ROT_Y = 86;
const RING_SCALE = 0.88;
const PARALLAX = 4;
const HOVER_OUT = 16;
const HOVER_Z = 12;
const HOVER_SCALE = 1.02;
const HOVER_DURATION = 0.32;
const MOBILE_MQ = "(max-width: 768px)";
const MOBILE_SELECTED_OUT = 8;
const MOBILE_SELECTED_Z = 2;
const MOBILE_SELECTED_SCALE = 1.005;
const MOBILE_TRANSITION = 0.25;
const MOBILE_FOCUS_ANGLE = -35;
const MOBILE_DRAG_SPEED = 0.35;
const INC = 360 / ITEM_COUNT;

interface SharedMemoriesArchiveSectionProps {
  demoHref: string;
}

type RingCard = {
  el: HTMLElement;
  cardEl: HTMLElement;
  index: number;
  memory: SharedMemory;
  depth: number;
};

export function SharedMemoriesArchiveSection({
  demoHref: _demoHref,
}: SharedMemoriesArchiveSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hitboxRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const memories = useMemo(() => buildSharedMemories(ITEM_COUNT), []);
  const [active, setActive] = useState<SharedMemory>(memories[0]);
  const [showProject, setShowProject] = useState(false);

  useGsapContext(
    () => {
      const section = sectionRef.current;
      const scene = sceneRef.current;
      const gallery = galleryRef.current;
      const preview = previewRef.current;
      const hitbox = hitboxRef.current;
      if (!section || !scene || !gallery) return;
      if (reduced) return;

      const cards: RingCard[] = [];
      let radius = 470;
      let yOffset = 0;
      let ringRot = 0;
      let introOffset = 0;
      let introPlaying = false;
      let activeCard: RingCard | null = null;
      let mobileSelectedCard: RingCard | null = null;
      let mobileCurrentRotation = 0;
      let mobileTargetRotation = 0;
      let mobileDragging = false;
      let mobileVelocity = 0;
      let raf = 0;
      let running = true;

      const itemEls = gsap.utils.toArray<HTMLElement>(
        gallery.querySelectorAll(".shared-memory-ring__item"),
      );

      itemEls.forEach((el, i) => {
        const cardEl = el.querySelector(
          ".shared-memory-ring__card",
        ) as HTMLElement;
        const card: RingCard = {
          el,
          cardEl,
          index: i,
          memory: memories[i],
          depth: 1,
        };
        cards.push(card);
        (el as HTMLElement & { _card?: RingCard })._card = card;
      });

      const isMobile = () => window.matchMedia(MOBILE_MQ).matches;

      const angleOf = (card: RingCard) =>
        card.index * INC - 90 + ringRot + introOffset;

      const depthOpacity = (rotZdeg: number) => {
        const back = Math.cos(rotZdeg * DEG);
        return 1 - (back + 1) * 0.25;
      };

      const updateRing = () => {
        for (const card of cards) {
          const rotZ = angleOf(card);
          card.depth = depthOpacity(rotZ);
          gsap.set(card.el, { rotationZ: rotZ });
          gsap.set(card.cardEl, { opacity: card.depth, rotationY: ROT_Y });
        }
      };

      const setupItems = () => {
        for (const card of cards) {
          gsap.set(card.el, {
            xPercent: -50,
            yPercent: -50,
            transformOrigin: `50% ${radius}px`,
            rotationZ: angleOf(card),
            force3D: true,
          });
          gsap.set(card.cardEl, {
            rotationY: ROT_Y,
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
            opacity: card.depth,
            force3D: true,
          });
        }
      };

      const pullOut = (
        card: RingCard,
        opts?: {
          out: number;
          z: number;
          scale: number;
          duration: number;
        },
      ) => {
        const out = opts ? opts.out : HOVER_OUT;
        const fwd = opts ? opts.z : HOVER_Z;
        const scl = opts ? opts.scale : HOVER_SCALE;
        const dur = opts ? opts.duration : HOVER_DURATION;
        card.cardEl.classList.add("is-active");

        const sceneRect = scene.getBoundingClientRect();
        const Cx = sceneRect.left + sceneRect.width / 2;
        const Cy = sceneRect.top + sceneRect.height / 2;
        const rect = card.el.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        const len = Math.hypot(px - Cx, py - Cy) || 1;
        const dxs = ((px - Cx) / len) * out;
        const dys = ((py - Cy) / len) * out;
        const T = TILT * DEG;
        const gx = dxs;
        const gy = dys * Math.cos(T) + fwd * Math.sin(T);
        const gz = -dys * Math.sin(T) + fwd * Math.cos(T);
        const phi = angleOf(card) * DEG;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);
        gsap.to(card.cardEl, {
          x: gx * cosP + gy * sinP,
          y: -gx * sinP + gy * cosP,
          z: gz,
          scale: scl,
          duration: dur,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const restoreCard = (card: RingCard, duration?: number) => {
        card.cardEl.classList.remove("is-active");
        gsap.to(card.cardEl, {
          x: 0,
          y: 0,
          z: 0,
          scale: 1,
          duration: duration ?? HOVER_DURATION,
          ease: "power2.out",
          overwrite: true,
        });
      };

      const MOBILE_OPTS = {
        out: MOBILE_SELECTED_OUT,
        z: MOBILE_SELECTED_Z,
        scale: MOBILE_SELECTED_SCALE,
        duration: MOBILE_TRANSITION,
      };

      const nearestMobileCard = () => {
        let idx = Math.round((MOBILE_FOCUS_ANGLE + 90 - ringRot) / INC);
        idx = ((idx % ITEM_COUNT) + ITEM_COUNT) % ITEM_COUNT;
        return cards[idx];
      };

      const updateMobilePreview = (card: RingCard) => {
        setActive(card.memory);
        const img = preview?.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { opacity: 0.3 },
            { opacity: 1, duration: MOBILE_TRANSITION, overwrite: true },
          );
        }
      };

      const updateMobileSelection = () => {
        if (introPlaying) return;
        const card = nearestMobileCard();
        if (card === mobileSelectedCard) return;
        if (mobileSelectedCard) {
          restoreCard(mobileSelectedCard, MOBILE_TRANSITION);
        }
        mobileSelectedCard = card;
        pullOut(card, MOBILE_OPTS);
        updateMobilePreview(card);
      };

      const setDesktopActive = (card: RingCard | null) => {
        if (card === activeCard) return;
        const prev = activeCard;
        activeCard = card;
        if (prev) restoreCard(prev);
        if (card) {
          pullOut(card);
          setActive(card.memory);
          setShowProject(true);
        } else {
          setShowProject(false);
        }
      };

      const computeGeometry = () => {
        const sceneRect = scene.getBoundingClientRect();
        const vw = Math.max(sceneRect.width, 1);
        const vh = Math.max(sceneRect.height, 1);
        if (vw < 40 || vh < 40) return;

        if (isMobile()) {
          radius = vw * 0.74;
          const pr = preview?.getBoundingClientRect();
          const previewBottom =
            pr && pr.bottom > 0 ? pr.bottom : sceneRect.top + vh * 0.46;
          const archiveTop = previewBottom - sceneRect.top + 26;
          const ringCenterX = vw * 0.98;
          gsap.set(gallery, {
            clearProps: "left,top",
            left: "50%",
            top: "50%",
            xPercent: 0,
            yPercent: 0,
            x: ringCenterX - vw / 2,
            y: archiveTop - vh / 2,
            rotationX: TILT,
            rotationY: 0,
            rotationZ: 0,
            force3D: true,
          });
          if (hitbox) {
            hitbox.style.top = `${Math.round(archiveTop - 12)}px`;
          }
        } else {
          radius =
            RING_SCALE * Math.max(300, Math.min(vw * 0.32, vh * 0.55));
          const localY = radius * Math.cos(TILT * DEG);
          const depthZ = radius * Math.sin(TILT * DEG);
          yOffset = localY * (PERSPECTIVE / (PERSPECTIVE - depthZ));
          gsap.set(gallery, {
            clearProps: "left,top",
            left: "50%",
            top: "50%",
            xPercent: 0,
            yPercent: 0,
            x: 0,
            y: -yOffset,
            rotationX: TILT,
            rotationY: 0,
            rotationZ: 0,
            force3D: true,
          });
        }
      };

      const runIntro = () => {
        introPlaying = true;
        introOffset = -360;
        updateRing();
        gsap.to(
          { v: -360 },
          {
            v: 0,
            duration: 1.6,
            ease: "power3.out",
            onUpdate() {
              introOffset = (this.targets()[0] as { v: number }).v;
              updateRing();
            },
            onComplete() {
              introOffset = 0;
              introPlaying = false;
              updateRing();
              if (isMobile()) updateMobileSelection();
            },
          },
        );
      };

      computeGeometry();
      setupItems();
      updateRing();
      gsap.set(gallery, { rotationX: TILT });

      const cleanups: Array<() => void> = [];
      const mm = gsap.matchMedia();

      mm.add(MOBILE_MQ, () => {
        running = true;
        mobileCurrentRotation = mobileTargetRotation = ringRot;
        let lastX = 0;
        let lastY = 0;

        const onDown = (e: PointerEvent) => {
          if (!hitbox) return;
          mobileDragging = true;
          mobileVelocity = 0;
          lastX = e.clientX;
          lastY = e.clientY;
          try {
            hitbox.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        };

        const onMove = (e: PointerEvent) => {
          if (!mobileDragging) return;
          e.preventDefault();
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          const delta = dx * MOBILE_DRAG_SPEED + dy * 0.12;
          mobileTargetRotation += delta;
          mobileVelocity = delta;
        };

        const endDrag = (e: PointerEvent) => {
          if (!mobileDragging || !hitbox) return;
          mobileDragging = false;
          try {
            if (hitbox.hasPointerCapture(e.pointerId)) {
              hitbox.releasePointerCapture(e.pointerId);
            }
          } catch {
            /* ignore */
          }
        };

        const onWheel = (e: WheelEvent) => {
          e.preventDefault();
          mobileTargetRotation += e.deltaY * 0.18;
        };

        const tick = () => {
          if (!running) return;
          if (!mobileDragging) {
            mobileTargetRotation += mobileVelocity;
            mobileVelocity *= 0.92;
            if (Math.abs(mobileVelocity) < 0.01) mobileVelocity = 0;
          }
          mobileCurrentRotation +=
            (mobileTargetRotation - mobileCurrentRotation) * 0.16;
          ringRot = mobileCurrentRotation;
          updateRing();
          updateMobileSelection();
          raf = requestAnimationFrame(tick);
        };

        hitbox?.addEventListener("pointerdown", onDown);
        hitbox?.addEventListener("pointermove", onMove);
        hitbox?.addEventListener("pointerup", endDrag);
        hitbox?.addEventListener("pointercancel", endDrag);
        hitbox?.addEventListener("wheel", onWheel, { passive: false });

        computeGeometry();
        setupItems();
        updateRing();
        updateMobileSelection();
        raf = requestAnimationFrame(tick);

        return () => {
          running = false;
          cancelAnimationFrame(raf);
          hitbox?.removeEventListener("pointerdown", onDown);
          hitbox?.removeEventListener("pointermove", onMove);
          hitbox?.removeEventListener("pointerup", endDrag);
          hitbox?.removeEventListener("pointercancel", endDrag);
          hitbox?.removeEventListener("wheel", onWheel);
        };
      });

      mm.add("(min-width: 769px)", () => {
        const scrub = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
          onUpdate: (self) => {
            ringRot = self.progress * 360 * TURNS;
            updateRing();
          },
        });

        const onPointerMove = (e: PointerEvent) => {
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const hit = target?.closest?.(
            ".shared-memory-ring__item",
          ) as (HTMLElement & { _card?: RingCard }) | null;
          setDesktopActive(hit?._card ?? null);
        };

        const onPointerLeave = () => setDesktopActive(null);

        const onParallax = (e: MouseEvent) => {
          const rect = scene.getBoundingClientRect();
          const px =
            (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          const py =
            (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          gsap.to(gallery, {
            rotationX: TILT + py * PARALLAX,
            rotationY: -px * PARALLAX,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        scene.addEventListener("pointermove", onPointerMove);
        scene.addEventListener("pointerleave", onPointerLeave);
        scene.addEventListener("mousemove", onParallax);

        computeGeometry();
        setupItems();
        updateRing();

        return () => {
          scrub.kill();
          scene.removeEventListener("pointermove", onPointerMove);
          scene.removeEventListener("pointerleave", onPointerLeave);
          scene.removeEventListener("mousemove", onParallax);
        };
      });

      const ro = new ResizeObserver(() => {
        computeGeometry();
        setupItems();
        updateRing();
        ScrollTrigger.refresh();
      });
      ro.observe(scene);
      cleanups.push(() => ro.disconnect());

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          computeGeometry();
          setupItems();
          updateRing();
          runIntro();
        });
      });

      return () => {
        running = false;
        cancelAnimationFrame(raf);
        mm.revert();
        cleanups.forEach((fn) => fn());
      };
    },
    [reduced, memories],
    sectionRef,
  );

  const browseHref = "#shared-memories";
  const heading = active.caption ?? active.title;
  const byline = `${guestByline(active.guestName)}${
    active.time ? ` · ${active.time}` : ""
  }`;

  return (
    <section
      ref={sectionRef}
      id="shared-memories"
      className={`shared-memories${reduced ? " shared-memories--reduced" : ""}`}
      data-ambient-state="memories"
      aria-label="Paylaşılan düğün anıları"
    >
      <div className="shared-memories__shell">
        <header className="shared-memories__intro">
          <p className="cine-eyebrow shared-memories__eyebrow">
            HERKESİN GÖZÜNDEN
          </p>
          <p className="shared-memories__lead">
            Misafirlerin çektiği fotoğraf ve videolar tek bir yerde buluşur.
            Herkes kendi anısını paylaşır; çiftin o gece göremediği anlar bile
            birlikte yaşamaya devam eder.
          </p>
          <p className="shared-memories__secondary">
            Her fotoğraf, o gecenin başka bir anını taşır.
          </p>
        </header>

        <div className="shared-memories__experience">
          <div ref={stickyRef} className="shared-memories__sticky">
            <div ref={previewRef} className="shared-memories__preview">
              <p className="shared-memories__preview-category">
                {active.category}
              </p>
              <h3 className="shared-memories__preview-heading">{heading}</h3>
              <div className="shared-memories__preview-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={active.id}
                  src={active.src}
                  alt={`${active.guestName} — ${active.category}`}
                />
              </div>
              <p className="shared-memories__preview-byline">{byline}</p>
              <div className="shared-memories__actions">
                <Link
                  href={browseHref}
                  className="shared-memories__cta shared-memories__cta--secondary"
                >
                  Paylaşılan Anıları Gör <i>+</i>
                </Link>
                <Link
                  href={browseHref}
                  className="shared-memories__cta shared-memories__cta--primary"
                >
                  Paylaşılan Anılar
                </Link>
              </div>
            </div>

            <div ref={sceneRef} className="shared-memories__scene">
              {reduced ? (
                <div className="shared-memories__reduced-strip">
                  {memories.slice(0, 8).map((memory) => (
                    <figure
                      key={memory.id}
                      className="shared-memories__reduced-card"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={memory.src} alt="" />
                    </figure>
                  ))}
                </div>
              ) : (
                <>
                  <div
                    ref={galleryRef}
                    className="shared-memories__ring-gallery"
                  >
                    {memories.map((memory) => (
                      <div key={memory.id} className="shared-memory-ring__item">
                        <div className="shared-memory-ring__card">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={memory.src} alt="" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    ref={centerRef}
                    className={`shared-memories__center${showProject ? " show-project" : ""}`}
                  >
                    <div className="shared-memories__center-default">
                      <p className="shared-memories__center-eyebrow">
                        Paylaşılan Anılar
                      </p>
                      <h3 className="shared-memories__center-title">
                        Herkesin gördüğü
                        <br />
                        <em>başka bir an</em> var.
                      </h3>
                      <p className="shared-memories__center-sub">
                        Halkanın üzerinde bir karta dokunarak o anıyı aç.
                      </p>
                    </div>
                    <div className="shared-memories__center-project">
                      <div className="shared-memories__center-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          key={active.id}
                          src={active.src}
                          alt={`${active.guestName} — ${active.category}`}
                        />
                      </div>
                      <p className="shared-memories__center-cat">
                        {active.category}
                      </p>
                      <h4 className="shared-memories__center-project-title">
                        {active.title}
                      </h4>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              ref={hitboxRef}
              className="shared-memories__ring-hitbox"
              aria-hidden
            />
          </div>
        </div>

        <p className="shared-memories__drag-help">
          Anılar arasında gezinmek için sürükle
        </p>
      </div>
    </section>
  );
}
