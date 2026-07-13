"use client";

import type { ContributionWithMedia } from "@/lib/supabase/database.types";
import {
  IconChevron,
  IconDownload,
  IconGrid,
  IconMedia,
  IconSettings,
} from "./AdminPremiumIcons";
import { AdminPremiumMessageRow } from "./AdminPremiumMessageRow";
import { AdminPremiumGuestLink } from "./AdminPremiumGuestLink";
import type { AdminPremiumTab } from "./admin-premium-types";

interface AdminPremiumOverviewProps {
  contributions: ContributionWithMedia[];
  guestUrl: string;
  coupleSlug: string;
  onViewAllLeaves: () => void;
  onExportCsv: () => void;
  onNavigate: (tab: AdminPremiumTab) => void;
  onCopyGuestLink: () => void;
  copyGuestLabel?: string;
}

export function AdminPremiumOverview({
  contributions,
  guestUrl,
  coupleSlug,
  onViewAllLeaves,
  onExportCsv,
  onNavigate,
  onCopyGuestLink,
  copyGuestLabel,
}: AdminPremiumOverviewProps) {
  const recent = contributions.slice(0, 3);

  const quickActions = [
    {
      key: "export",
      label: "Notları İndir",
      hint: "Misafir mesajlarını dışa aktar.",
      icon: IconDownload,
      onClick: onExportCsv,
    },
    {
      key: "gallery",
      label: "Misafir Galerisi",
      hint: "Misafir fotoğraf ve video arşivi.",
      icon: IconMedia,
      onClick: () => onNavigate("gallery"),
    },
    {
      key: "memories",
      label: "Anılarımız",
      hint: "Public sitede frame içinde gösterilecek fotoğraflar.",
      icon: IconGrid,
      onClick: () => onNavigate("memories"),
    },
    {
      key: "settings",
      label: "Sayfa Ayarları",
      icon: IconSettings,
      onClick: () => onNavigate("settings"),
    },
  ] as const;

  return (
    <div className="admin-premium-overview">
      <section className="admin-premium-card admin-premium-card--living admin-premium-card--leaves admin-premium-reveal admin-premium-reveal--d5">
        <div className="admin-premium-card__head">
          <h2 className="admin-premium-card__title">Son Yapraklar</h2>
          <button
            type="button"
            onClick={onViewAllLeaves}
            className="admin-premium-text-link admin-premium-text-link--animated admin-premium-interactive admin-premium-interactive--link"
          >
            Tümünü Gör
            <IconChevron className="admin-premium-icon--sm" />
          </button>
        </div>

        {recent.length === 0 ? (
          <p className="admin-premium-empty">Henüz yaprak yok.</p>
        ) : (
          <div className="admin-premium-message-list">
            {recent.map((item, index) => (
              <AdminPremiumMessageRow
                key={item.id}
                item={item}
                coupleSlug={coupleSlug}
                compact
                enterDelay={0.58 + index * 0.1}
              />
            ))}
          </div>
        )}
      </section>

      <section className="admin-premium-card admin-premium-card--living admin-premium-reveal admin-premium-reveal--d6">
        <h2 className="admin-premium-card__title admin-premium-card__title--solo">
          Hızlı İşlemler
        </h2>
        <div className="admin-premium-quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className={`admin-premium-quick-action admin-premium-btn-enter admin-premium-interactive admin-premium-btn-enter--d${Math.min(index + 1, 4)}`}
            >
              <span className="admin-premium-quick-action__icon-wrap">
                <action.icon />
              </span>
              <span className="admin-premium-quick-action__copy">
                <span className="admin-premium-quick-action__label">
                  {action.label}
                </span>
                {"hint" in action && action.hint ? (
                  <span className="admin-premium-quick-action__hint">
                    {action.hint}
                  </span>
                ) : null}
              </span>
              <IconChevron className="admin-premium-icon--sm" />
            </button>
          ))}
        </div>
      </section>

      <AdminPremiumGuestLink
        url={guestUrl}
        onCopy={onCopyGuestLink}
        copyLabel={copyGuestLabel}
        className="admin-premium-reveal admin-premium-reveal--d7"
      />
    </div>
  );
}
