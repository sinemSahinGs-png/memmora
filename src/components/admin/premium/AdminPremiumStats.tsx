"use client";

import { IconLeaf, IconRsvp } from "./AdminPremiumIcons";
import { AdminPremiumCountUp } from "./AdminPremiumCountUp";
import type { AdminPremiumBottomTab } from "./admin-premium-types";

interface AdminPremiumStatsProps {
  leafCount: number;
  rsvpGuestCount: number;
  rsvpResponseCount: number;
  onNavigate?: (tab: AdminPremiumBottomTab) => void;
  onRsvpClick?: () => void;
}

export function AdminPremiumStats({
  leafCount,
  rsvpGuestCount,
  rsvpResponseCount,
  onNavigate,
  onRsvpClick,
}: AdminPremiumStatsProps) {
  return (
    <div className="admin-premium-stats admin-premium-stats--duo admin-premium-reveal admin-premium-reveal--d3">
      <button
        type="button"
        onClick={() => onNavigate?.("leaves")}
        className="admin-premium-stat-card admin-premium-stat-card--stagger-1 admin-premium-stat-card--clickable admin-premium-card--living admin-premium-interactive-lift admin-premium-sheen-surface"
      >
        <div className="admin-premium-stat-card__icon-wrap">
          <IconLeaf />
        </div>
        <div className="admin-premium-stat-card__body">
          <p className="admin-premium-stat-card__value">
            <AdminPremiumCountUp value={leafCount} duration={0.85} />
          </p>
          <p className="admin-premium-stat-card__label">Toplam Yaprak</p>
          <p className="admin-premium-stat-card__hint">Misafir yaprakları</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onRsvpClick}
        className="admin-premium-stat-card admin-premium-stat-card--stagger-2 admin-premium-stat-card--clickable admin-premium-stat-card--rsvp admin-premium-card--living admin-premium-interactive-lift admin-premium-sheen-surface"
      >
        <div className="admin-premium-stat-card__icon-wrap">
          <IconRsvp />
        </div>
        <div className="admin-premium-stat-card__body">
          <p className="admin-premium-stat-card__value">
            <AdminPremiumCountUp value={rsvpGuestCount} duration={0.9} />
          </p>
          <p className="admin-premium-stat-card__label">Katılım</p>
          <p className="admin-premium-stat-card__hint">
            {rsvpResponseCount} yanıt
          </p>
        </div>
      </button>
    </div>
  );
}
