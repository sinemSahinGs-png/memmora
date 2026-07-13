"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Couple, RsvpStatus } from "@/lib/types";
import { formatDisplayDate } from "@/lib/mock-data";
import { getCoupleAdminTitleParts, getInviteVenueInfo } from "@/lib/couple-utils";
import { RSVP_SUCCESS_MESSAGES } from "@/lib/supabase/rsvp";
import { INVITE_ASSETS, INVITE_PAPER_LAYOUT, type InviteStage } from "@/lib/invite-assets";
import { InviteTopBar } from "@/components/invite/InviteTopBar";
import styles from "./PremiumInviteExperience.module.css";

interface PremiumInviteExperienceProps {
  couple: Couple;
}

export function PremiumInviteExperience({ couple }: PremiumInviteExperienceProps) {
  const [stage, setStage] = useState<InviteStage>("closed");
  const videoRef = useRef<HTMLVideoElement>(null);

  const titleParts = useMemo(() => getCoupleAdminTitleParts(couple), [couple]);

  const isCouple = titleParts.mode === "couple";
  const name1 = isCouple ? titleParts.firstName : titleParts.title;
  const name2 = isCouple ? titleParts.secondName : undefined;

  const dateLabel = couple.weddingDate ? formatDisplayDate(couple.weddingDate) : "";
  const venueInfo = useMemo(() => getInviteVenueInfo(couple), [couple]);
  const rsvpOpen = couple.rsvpEnabled && couple.status === "active";
  const maxGuestCount = Math.max(1, couple.maxGuestCount);

  const handleOpen = useCallback(() => {
    setStage("opening");
  }, []);

  /* Preload opening video while envelope is visible */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.preload = "auto";
    video.load();
  }, []);

  /* ── Video lifecycle ── */
  useLayoutEffect(() => {
    if (stage !== "opening") return;

    let cancelled = false;
    let unbind: (() => void) | undefined;

    const finish = () => {
      if (!cancelled) setStage("opened");
    };

    const fail = () => {
      if (!cancelled) setStage("opened");
    };

    const start = (video: HTMLVideoElement) => {
      const onEnded = () => finish();
      const onError = () => fail();

      video.addEventListener("ended", onEnded);
      video.addEventListener("error", onError);

      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.currentTime = 0;

      const tryPlay = () => {
        void video.play().catch(() => {
          if (cancelled) return;
          if (video.readyState < 2) {
            video.addEventListener(
              "canplay",
              () => {
                void video.play().catch(() => fail());
              },
              { once: true }
            );
            video.load();
            return;
          }
          fail();
        });
      };

      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener("canplay", tryPlay, { once: true });
        video.load();
      }

      const timeout = window.setTimeout(() => {
        if (!cancelled && video.readyState < 2) fail();
      }, 10000);

      unbind = () => {
        window.clearTimeout(timeout);
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("error", onError);
      };
    };

    const video = videoRef.current;
    if (video) {
      start(video);
    } else {
      const retryId = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const retryVideo = videoRef.current;
        if (retryVideo) start(retryVideo);
        else fail();
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(retryId);
        unbind?.();
      };
    }

    return () => {
      cancelled = true;
      unbind?.();
    };
  }, [stage]);

  const showForm = stage === "opened" && rsvpOpen;
  const showVideo = stage === "opening";
  const showPoster = stage === "opened";

  return (
    <div className="invite-page invite-page--premium">
      <div className={styles.scene}>
        <div className={styles.frame}>
          <div className={styles.frameBody}>
          {/* ── Layer 0: Botanical background (closed only) ── */}
          <div
            className={`${styles.bgLayer} ${stage !== "closed" ? styles.bgLayerHidden : ""}`}
            aria-hidden={stage !== "closed"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={INVITE_ASSETS.background}
              alt=""
              className={styles.bgImg}
              draggable={false}
            />
            <div className={styles.ambient} />
          </div>

          {/* ── Layer 1: Closed state UI ── */}
          {stage === "closed" ? (
            <div className={styles.closedLayer} aria-hidden={false}>
              <div className={styles.heroGroup}>
                <div className={styles.namesBlock}>
                  {isCouple && name2 ? (
                    <>
                      <p className={styles.nameLine}>{name1}</p>
                      <span className={styles.nameAmp}>&amp;</span>
                      <p className={styles.nameLine}>{name2}</p>
                    </>
                  ) : (
                    <p className={styles.nameLine}>{name1}</p>
                  )}
                </div>

                <div className={styles.envelopeWrap}>
                  <div className={styles.envelopeGlow} aria-hidden />
                  <div className={styles.envelopeFloat}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={INVITE_ASSETS.envelope}
                      alt=""
                      className={styles.envelopeImg}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {(stage === "closed" || stage === "opening" || stage === "opened") ? (
            <div className={styles.bottomDock}>
              {couple.weddingDate || venueInfo ? (
                <InviteTopBar
                  weddingDate={couple.weddingDate}
                  weddingTime={couple.weddingTime}
                  venue={venueInfo}
                />
              ) : null}
              {stage === "closed" ? (
                <button type="button" className={styles.cta} onClick={handleOpen}>
                  DAVETİYEYİ AÇ
                </button>
              ) : null}
            </div>
          ) : null}

          {/* ── Video preload (hidden) + opening/opened media layer ── */}
          <div
            className={`${styles.mediaStage} ${stage === "closed" ? styles.mediaStagePreload : styles.mediaStageVisible} ${stage === "opening" ? styles.mediaStageOpening : ""}`}
            aria-hidden={stage === "closed"}
          >
            <div className={styles.mediaFrame}>
              <video
                ref={videoRef}
                className={`${styles.media} ${showVideo ? styles.mediaPlaying : styles.mediaHidden}`}
                src={INVITE_ASSETS.openingVideo}
                muted
                playsInline
                preload="auto"
                autoPlay={showVideo}
              />

              {showPoster ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={INVITE_ASSETS.finalPoster}
                  alt=""
                  className={`${styles.media} ${styles.mediaPoster}`}
                  draggable={false}
                />
              ) : null}

              {showForm ? (
                <div className={styles.formLayer}>
                  <PaperRsvpOverlay
                    coupleSlug={couple.slug}
                    name1={name1}
                    name2={name2}
                    isCouple={isCouple}
                    dateLabel={dateLabel}
                    maxGuestCount={maxGuestCount}
                  />
                </div>
              ) : null}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Inline RSVP overlay ── */

interface PaperRsvpOverlayProps {
  coupleSlug: string;
  name1: string;
  name2?: string;
  isCouple: boolean;
  dateLabel: string;
  maxGuestCount: number;
}

function PaperRsvpOverlay({
  coupleSlug,
  name1,
  name2,
  isCouple,
  dateLabel,
  maxGuestCount,
}: PaperRsvpOverlayProps) {
  const [guestName, setGuestName] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("attending");
  const [guestCount, setGuestCount] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<RsvpStatus | null>(null);

  const countOptions = useMemo(() => [1, 2, 3, 4] as const, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleSlug,
          guest_name: guestName.trim(),
          status,
          guest_count: status === "not_attending" ? 0 : guestCount,
          note: note.trim() || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; status?: RsvpStatus };
      if (!response.ok) throw new Error(data.error || "Yanıt gönderilemedi.");
      setSuccessStatus(data.status ?? status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yanıt gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.paperOverlay}
      style={{
        top: INVITE_PAPER_LAYOUT.insetTop,
        right: INVITE_PAPER_LAYOUT.insetRight,
        bottom: INVITE_PAPER_LAYOUT.insetBottom,
        left: INVITE_PAPER_LAYOUT.insetLeft,
      }}
    >
      <div className={styles.paperScroll}>
        <div
          className={styles.paperInner}
          style={{
            width: INVITE_PAPER_LAYOUT.formWidth,
            maxWidth: INVITE_PAPER_LAYOUT.formMaxWidth,
          }}
        >
          <header className={styles.paperHeader}>
            <p className={styles.paperTitle}>Katılım Durumu</p>
            {isCouple && name2 ? (
              <p className={styles.paperSubtitle}>
                {name1} <span className={styles.paperAmp}>&amp;</span> {name2}{" "}
                <span className={styles.paperSubtitleMuted}>düğün daveti</span>
              </p>
            ) : (
              <p className={styles.paperSubtitle}>
                {name1}{" "}
                <span className={styles.paperSubtitleMuted}>düğün daveti</span>
              </p>
            )}
            {dateLabel ? <p className={styles.paperDate}>{dateLabel}</p> : null}
          </header>

          {successStatus ? (
            <div className={styles.success}>
              <span className={styles.successIcon} aria-hidden>
                ✦
              </span>
              <h2 className={styles.successTitle}>Teşekkürler</h2>
              <p className={styles.successText}>
                {RSVP_SUCCESS_MESSAGES[successStatus]}
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formBody}>
                <label className={styles.field}>
                  <span className={styles.label}>Ad Soyad</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Adınız ve soyadınız"
                    required
                    autoComplete="name"
                  />
                </label>

                <fieldset className={styles.field}>
                  <legend className={styles.label}>Katılım</legend>
                  <div className={styles.pills}>
                    {(
                      [
                        { id: "attending" as const, label: "Katılıyorum" },
                        { id: "not_attending" as const, label: "Katılamıyorum" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.pill} ${status === opt.id ? styles.pillActive : ""}`}
                        onClick={() => {
                          setStatus(opt.id);
                          if (opt.id === "attending") {
                            setGuestCount((c) => (c < 1 ? 1 : c));
                          } else {
                            setGuestCount(0);
                          }
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <AnimatePresence initial={false}>
                  {status === "attending" ? (
                    <motion.fieldset
                      key="guest-count"
                      className={styles.field}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <legend className={styles.label}>Kişi Sayısı</legend>
                      <div className={styles.countRow}>
                        {countOptions.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`${styles.countPill} ${guestCount === n || (n === 4 && guestCount >= 4) ? styles.countPillActive : ""}`}
                            onClick={() =>
                              setGuestCount(n === 4 ? Math.min(maxGuestCount, 5) : n)
                            }
                          >
                            {n === 4 ? "4+" : n}
                          </button>
                        ))}
                      </div>
                    </motion.fieldset>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {status === "not_attending" ? (
                    <motion.label
                      key="note-field"
                      className={styles.field}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className={styles.label}>Notunuz</span>
                      <textarea
                        className={styles.textarea}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Dilerseniz kısa bir not bırakın..."
                        rows={2}
                      />
                    </motion.label>
                  ) : null}
                </AnimatePresence>

                {error ? (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className={styles.submitWrap}>
                <button
                  type="submit"
                  className={styles.submit}
                  disabled={submitting}
                  aria-busy={submitting}
                >
                  {submitting ? "Gönderiliyor…" : "Yanıtı Gönder"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
