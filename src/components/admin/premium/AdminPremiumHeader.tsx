"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatDisplayDate } from "@/lib/mock-data";
import type { Couple } from "@/lib/types";
import { getCoupleAdminTitleParts } from "@/lib/couple-utils";
import {
  IconEnvelopePremium,
  IconMediaPremium,
  IconSettings,
} from "./AdminPremiumIcons";

interface AdminPremiumHeaderProps {
  couple: Couple;
  publicUrl: string;
  quizQuestionCount: number;
  couplePhotoCount: number;
  onSettingsClick: () => void;
  onGalleryClick?: () => void;
  onInviteClick?: () => void;
  onNavigateMemories?: () => void;
  onNavigateQuiz?: () => void;
}

export function AdminPremiumHeader({
  couple,
  publicUrl,
  quizQuestionCount,
  couplePhotoCount,
  onSettingsClick,
  onGalleryClick,
  onInviteClick,
  onNavigateMemories,
  onNavigateQuiz,
}: AdminPremiumHeaderProps) {
  const titleParts = useMemo(() => getCoupleAdminTitleParts(couple), [couple]);
  const isActive = couple.status === "active";
  const inviteActive = couple.invitationEnabled;

  const statusHints = useMemo(() => {
    type Hint =
      | { kind: "static"; label: string }
      | { kind: "memories"; label: string }
      | { kind: "quiz"; label: string };

    const hints: Hint[] = [];
    if (!inviteActive) hints.push({ kind: "static", label: "E-Davetiye pasif" });
    if (couplePhotoCount === 0) {
      hints.push({ kind: "memories", label: "Anılar henüz doldurulmadı" });
    }
    if (quizQuestionCount === 0) {
      hints.push({ kind: "quiz", label: "Quiz soruları eksik" });
    }
    return hints;
  }, [inviteActive, couplePhotoCount, quizQuestionCount]);

  const ctaSingle = !inviteActive;

  return (
    <header className="admin-premium-header admin-premium-reveal">
      <div className="admin-premium-header__top">
        <div className="admin-premium-brand">
          <span className="admin-premium-brand__mark" aria-hidden>
            ✦
          </span>
          <div className="admin-premium-brand__copy">
            <span className="admin-premium-brand__text">Memoora Admin</span>
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-premium-site-link admin-premium-interactive--link"
            >
              Siteyi görüntüle →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={onSettingsClick}
          className="admin-premium-settings-btn admin-premium-btn-enter admin-premium-interactive admin-premium-settings-btn--living"
        >
          <IconSettings />
          Ayarlar
        </button>
      </div>

      <div className="admin-premium-header__hero admin-premium-reveal admin-premium-reveal--d1">
        <div className="admin-premium-header__title-wrap">
          {titleParts.mode === "couple" ? (
            <>
              <h1 className="admin-premium-header__title admin-premium-header__title--couple">
                <span className="admin-premium-header__name admin-premium-header__name--first">
                  {titleParts.firstName}
                </span>
                <span className="admin-premium-header__amp">&amp;</span>
                <span className="admin-premium-header__name admin-premium-header__name--second">
                  {titleParts.secondName}
                </span>
              </h1>
              <p className="admin-premium-header__title-accent">
                {titleParts.accent}
              </p>
            </>
          ) : (
            <h1 className="admin-premium-header__title admin-premium-header__title--single">
              {titleParts.title}
            </h1>
          )}
        </div>

        <div className="admin-premium-header__meta">
          <span className="admin-premium-header__date">
            {couple.weddingDate
              ? formatDisplayDate(couple.weddingDate)
              : "Tarih belirtilmedi"}
          </span>
          <span
            className={
              isActive
                ? "admin-premium-badge admin-premium-badge--active"
                : "admin-premium-badge"
            }
          >
            {isActive ? "Aktif" : couple.status === "passive" ? "Pasif" : "Arşiv"}
          </span>
        </div>

        {statusHints.length > 0 ? (
          <p className="admin-premium-status-hints" role="status">
            {statusHints.map((hint, index) => (
              <span key={hint.label}>
                {index > 0 ? " · " : null}
                {hint.kind === "static" ? (
                  hint.label
                ) : hint.kind === "memories" ? (
                  <button
                    type="button"
                    className="admin-premium-status-hint-link admin-premium-interactive"
                    onClick={onNavigateMemories}
                  >
                    {hint.label}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-premium-status-hint-link admin-premium-interactive"
                    onClick={onNavigateQuiz}
                  >
                    {hint.label}
                  </button>
                )}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      <div
        className={`admin-premium-cta-row admin-premium-reveal admin-premium-reveal--d2${ctaSingle ? " admin-premium-cta-row--single" : ""}`}
      >
        {inviteActive ? (
          <button
            type="button"
            onClick={(e) => {
              onInviteClick?.();
              e.currentTarget.blur();
            }}
            className="admin-premium-outline-btn admin-premium-outline-btn--cta admin-premium-outline-btn--invite admin-premium-btn-enter admin-premium-btn-enter--d1 admin-premium-interactive"
          >
            <span className="admin-premium-outline-btn__icon" aria-hidden>
              <IconEnvelopePremium />
            </span>
            <span className="admin-premium-outline-btn__label admin-premium-outline-btn__label--with-badge">
              E-Davetiye
              <span className="admin-premium-invite-badge">
                <span className="admin-premium-invite-badge__dot" aria-hidden />
                Aktif
              </span>
            </span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            onGalleryClick?.();
            e.currentTarget.blur();
          }}
          className="admin-premium-outline-btn admin-premium-outline-btn--cta admin-premium-outline-btn--gallery-hero admin-premium-btn-enter admin-premium-btn-enter--d2 admin-premium-interactive"
        >
          <span className="admin-premium-outline-btn__icon" aria-hidden>
            <IconMediaPremium />
          </span>
          <span className="admin-premium-outline-btn__label">Galeri</span>
        </button>
      </div>
    </header>
  );
}
