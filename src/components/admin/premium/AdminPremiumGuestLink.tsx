"use client";

import { cn } from "@/lib/utils";
import { IconLink } from "./AdminPremiumIcons";

interface AdminPremiumGuestLinkProps {
  url: string;
  onCopy: () => void;
  copyLabel?: string;
  className?: string;
}

export function AdminPremiumGuestLink({
  url,
  onCopy,
  copyLabel = "Kopyala",
  className,
}: AdminPremiumGuestLinkProps) {
  return (
    <section className={cn("admin-premium-card admin-premium-card--living admin-premium-guest-link", className)}>
      <div className="admin-premium-guest-link__head">
        <h2 className="admin-premium-card__title admin-premium-card__title--solo">
          Misafir Linki
        </h2>
        <button type="button" onClick={onCopy} className="admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-btn-enter admin-premium-btn-enter--d2 admin-premium-interactive">
          <IconLink />
          {copyLabel}
        </button>
      </div>
      <p className="admin-premium-guest-link__url">{url}</p>
    </section>
  );
}
