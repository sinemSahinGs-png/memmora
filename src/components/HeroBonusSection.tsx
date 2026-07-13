"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Couple } from "@/lib/types";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";
import { coupleToPlaylistTrack } from "@/lib/mock-data";

interface HeroBonusSectionProps {
  couple: Couple;
}

function LeafBranchDecor() {
  return (
    <div className="hero-bonus-card-decor hero-bonus-card-decor--leaf" aria-hidden>
      <svg viewBox="0 0 56 56" fill="none">
        <path
          d="M6 46C14 34 24 22 46 12"
          stroke="rgba(212,175,55,0.38)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M20 30C28 22 36 16 48 12"
          stroke="rgba(168,148,88,0.26)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <ellipse
          cx="36"
          cy="18"
          rx="6"
          ry="10"
          transform="rotate(-32 36 18)"
          stroke="rgba(212,175,55,0.32)"
          strokeWidth="1"
        />
        <ellipse
          cx="22"
          cy="34"
          rx="5"
          ry="8"
          transform="rotate(22 22 34)"
          stroke="rgba(154,168,155,0.28)"
          strokeWidth="1"
        />
        <circle cx="42" cy="14" r="3" fill="rgba(212,175,55,0.14)" />
      </svg>
    </div>
  );
}

function VinylDecor({ muted = false }: { muted?: boolean }) {
  return (
    <div
      className={`hero-bonus-card-decor hero-bonus-card-decor--vinyl${muted ? " hero-bonus-card-decor--muted" : ""}`}
      aria-hidden
    >
      <div className="hero-bonus-vinyl-disc">
        <span className="hero-bonus-vinyl-groove" />
        <span className="hero-bonus-vinyl-center" />
        <span className="hero-bonus-vinyl-tonearm" />
      </div>
    </div>
  );
}

function MiniWaveform() {
  return (
    <div className="hero-bonus-mini-waveform" aria-hidden>
      {[4, 7, 5, 9, 6, 8, 4, 7, 5, 6].map((h, i) => (
        <span key={i} style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

function BonusButton({
  href,
  external,
  disabled,
  children,
  gold,
}: {
  href?: string;
  external?: boolean;
  disabled?: boolean;
  children: ReactNode;
  gold?: boolean;
}) {
  const className = `hero-bonus-btn${gold ? " hero-bonus-btn--gold" : ""}`;
  const content = (
    <>
      <span>{children}</span>
      <span className="hero-bonus-btn-arrow" aria-hidden>
        →
      </span>
    </>
  );

  if (disabled || !href) {
    return (
      <button type="button" className={className} disabled>
        {content}
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function HeroBonusSection({ couple }: HeroBonusSectionProps) {
  const displayTitle = getCoupleDisplayTitle(couple);
  const track = coupleToPlaylistTrack(couple);
  const hasPlaylist = Boolean(track?.title?.trim());
  const hasPlaylistUrl = Boolean(track?.url?.trim());
  const showQuiz = couple.quizEnabled;

  const cardEnter = (delay: number) => ({
    initial: { opacity: 0, x: -40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="bonus" className="hero-bonus-section scroll-mt-0">
      <div className="hero-bonus-entry-blend" aria-hidden />

      <div className="hero-bonus-inner">
        <div className="hero-bonus-carousel">
          <div
            className={`hero-bonus-cards${showQuiz ? "" : " hero-bonus-cards--solo"}`}
          >
          {showQuiz && (
            <motion.article
              className="hero-bonus-card hero-bonus-card--quiz"
              {...cardEnter(0)}
              whileHover={{ y: -1 }}
            >
              <div className="hero-bonus-card-main">
                <div className="hero-bonus-card-copy">
                  <p className="hero-bonus-eyebrow">Bonus</p>
                  <h2 className="hero-bonus-title">
                    Çifti ne kadar tanıyorsun?
                  </h2>
                  <p className="hero-bonus-body">
                    {displayTitle}&apos;yi ne kadar tanıdığını göster.
                  </p>
                </div>
                <LeafBranchDecor />
              </div>
              <BonusButton href={`/${couple.slug}/quiz`} gold>
                Quiz&apos;e Başla
              </BonusButton>
            </motion.article>
          )}

          <motion.article
            id="playlist"
            className={`hero-bonus-card hero-bonus-card--music${hasPlaylist ? "" : " hero-bonus-card--music-empty"}`}
            {...cardEnter(showQuiz ? 0.14 : 0)}
            whileHover={{ y: -1 }}
          >
            <div className="hero-bonus-card-main hero-bonus-card-main--music">
              <div className="hero-bonus-card-copy hero-bonus-card-copy--music">
                <p className="hero-bonus-eyebrow hero-bonus-eyebrow--soft">
                  Onların Şarkısı
                </p>
                <h2 className="hero-bonus-title hero-bonus-title--music">
                  {hasPlaylist ? track!.title : "Onların Şarkısı"}
                </h2>
                <p
                  className={`hero-bonus-body${hasPlaylist ? " hero-bonus-body--artist" : ""}`}
                >
                  {hasPlaylist ? track!.artist : "Şarkı yakında burada."}
                </p>
              </div>
              <VinylDecor muted={!hasPlaylist} />
            </div>
            {hasPlaylist && <MiniWaveform />}
            <BonusButton
              href={hasPlaylistUrl ? track!.url : undefined}
              external={hasPlaylistUrl}
              disabled={!hasPlaylistUrl}
            >
              Dinle
            </BonusButton>
          </motion.article>
          </div>
        </div>
      </div>

      <div className="hero-bonus-exit-blend" aria-hidden />
    </section>
  );
}
