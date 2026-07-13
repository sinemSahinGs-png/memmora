"use client";

import type { Couple } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdminStatusBadgesProps {
  couple: Couple;
}

export function AdminStatusBadges({ couple }: AdminStatusBadgesProps) {
  const driveConnected = Boolean(couple.driveFolderUrl?.trim());

  const badges = [
    {
      label:
        couple.status === "active"
          ? "Sayfa Aktif"
          : couple.status === "passive"
            ? "Sayfa Pasif"
            : "Arşiv",
      tone:
        couple.status === "active"
          ? "active"
          : ("muted" as const),
    },
    {
      label: couple.mediaUploadEnabled ? "Medya Açık" : "Medya Kapalı",
      tone: couple.mediaUploadEnabled ? "active" : "muted",
    },
    {
      label: couple.quizEnabled ? "Quiz Açık" : "Quiz Kapalı",
      tone: couple.quizEnabled ? "active" : "muted",
    },
    {
      label: driveConnected ? "Drive Bağlı" : "Drive Yok",
      tone: driveConnected ? "gold" : "muted",
    },
  ] as const;

  return (
    <div className="admin-status-badges">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={cn(
            "admin-status-badge",
            badge.tone === "active" && "admin-status-badge--active",
            badge.tone === "gold" && "admin-status-badge--gold",
            badge.tone === "muted" && "admin-status-badge--muted"
          )}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
