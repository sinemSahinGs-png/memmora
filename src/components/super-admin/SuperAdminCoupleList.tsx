"use client";

import { useState } from "react";
import type { CoupleListItem } from "@/lib/types";
import { formatDisplayDate } from "@/lib/mock-data";
import { provisionCoupleDriveFolder } from "@/lib/provision-drive-folder-client";
import { buildCoupleAdminUrl, buildCouplePublicUrl } from "@/lib/site-url";
import {
  formatManualShareMessage,
  shareCoupleDriveFolder,
} from "@/lib/share-drive-folder-client";
import { cn } from "@/lib/utils";

interface SuperAdminCoupleListProps {
  couples: CoupleListItem[];
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, current: CoupleListItem["status"]) => void;
  onDelete: (id: string, slug: string) => void;
  onRefresh?: () => void | Promise<void>;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function SuperAdminCoupleList({
  couples,
  onEdit,
  onToggleStatus,
  onDelete,
  onRefresh,
}: SuperAdminCoupleListProps) {
  if (couples.length === 0) {
    return (
      <div className="super-admin-empty">
        <p>Henüz çift kaydı yok.</p>
      </div>
    );
  }

  return (
    <ul className="super-admin-couple-grid">
      {couples.map((couple) => (
        <CoupleControlCard
          key={couple.id}
          couple={couple}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      ))}
    </ul>
  );
}

function CoupleControlCard({
  couple: c,
  onEdit,
  onToggleStatus,
  onDelete,
  onRefresh,
}: {
  couple: CoupleListItem;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, current: CoupleListItem["status"]) => void;
  onDelete: (id: string, slug: string) => void;
  onRefresh?: () => void | Promise<void>;
}) {
  const publicUrl = buildCouplePublicUrl(c.slug);
  const adminUrl = buildCoupleAdminUrl(c.slug);
  const [pinVisible, setPinVisible] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const flash = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const handleCopy = async (key: string, value: string) => {
    if (!value) return;
    const ok = await copyText(value);
    if (ok) flash(key);
  };

  const handleShareDrive = async () => {
    const share = await shareCoupleDriveFolder(c.slug);
    if (!share.ok) {
      window.alert(share.error ?? "Drive paylaşımı başarısız.");
      return;
    }
    window.alert(formatManualShareMessage(share));
  };

  const handleProvisionDrive = async () => {
    if (c.driveFolderUrl) {
      window.open(c.driveFolderUrl, "_blank", "noopener,noreferrer");
      return;
    }
    const result = await provisionCoupleDriveFolder(c.slug);
    if (!result.ok) {
      window.alert(result.error ?? "Drive klasörü oluşturulamadı.");
      return;
    }
    await onRefresh?.();
    window.alert(
      result.created
        ? "Google Drive klasörü oluşturuldu."
        : "Drive klasörü zaten hazırdı.",
    );
    if (result.driveFolderUrl) {
      window.open(result.driveFolderUrl, "_blank", "noopener,noreferrer");
    }
  };

  const pin = c.adminPin?.trim() || "—";

  return (
    <li className="super-admin-couple-card">
      <div className="super-admin-couple-card__top">
        <div>
          <p className="super-admin-couple-card__title">{c.displayTitle}</p>
          <p className="super-admin-couple-card__slug">{c.slug}</p>
        </div>
        <span
          className={cn(
            "super-admin-status",
            c.status === "active"
              ? "super-admin-status--active"
              : "super-admin-status--passive",
          )}
        >
          {c.status === "active" ? "Aktif" : c.status === "archived" ? "Arşiv" : "Pasif"}
        </span>
      </div>

      <div className="super-admin-couple-card__pin">
        <div>
          <p className="super-admin-couple-card__pin-label">Admin PIN</p>
          <p className="super-admin-couple-card__pin-value">
            {pinVisible ? pin : "••••"}
          </p>
        </div>
        <div className="super-admin-couple-card__pin-actions">
          <button
            type="button"
            className="super-admin-action"
            onClick={() => setPinVisible((v) => !v)}
          >
            {pinVisible ? "Gizle" : "Göster"}
          </button>
          <button
            type="button"
            className="super-admin-action"
            disabled={!c.adminPin}
            onClick={() => void handleCopy("pin", c.adminPin ?? "")}
          >
            {copied === "pin" ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </div>

      <dl className="super-admin-couple-card__meta">
        <div>
          <dt>Düğün</dt>
          <dd>{c.weddingDate ? formatDisplayDate(c.weddingDate) : "—"}</dd>
        </div>
        <div>
          <dt>Anılar</dt>
          <dd>
            {c.leafCount} yaprak · {c.mediaCount} medya
          </dd>
        </div>
        <div>
          <dt>RSVP</dt>
          <dd>
            {c.rsvpGuestCount ?? 0} misafir · {c.rsvpResponseCount ?? 0} yanıt
          </dd>
        </div>
        <div>
          <dt>Paket</dt>
          <dd>{c.packageType ?? "—"}</dd>
        </div>
      </dl>

      {(c.brideEmail || c.groomEmail) && (
        <div className="super-admin-couple-card__emails">
          {c.brideEmail ? <span>Gelin: {c.brideEmail}</span> : null}
          {c.groomEmail ? <span>Damat: {c.groomEmail}</span> : null}
        </div>
      )}

      <div className="super-admin-couple-card__links">
        <button
          type="button"
          className="super-admin-action"
          onClick={() => void handleCopy("public", publicUrl)}
        >
          {copied === "public" ? "Link kopyalandı" : "Site linki"}
        </button>
        <button
          type="button"
          className="super-admin-action"
          onClick={() => void handleCopy("admin", adminUrl)}
        >
          {copied === "admin" ? "Admin linki kopyalandı" : "Admin linki"}
        </button>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="super-admin-action">
          Aç
        </a>
        <a href={adminUrl} target="_blank" rel="noreferrer" className="super-admin-action">
          Panele git
        </a>
      </div>

      <div className="super-admin-couple-card__actions">
        <button type="button" className="super-admin-action" onClick={() => onEdit(c.id)}>
          Düzenle
        </button>
        <button
          type="button"
          className="super-admin-action"
          onClick={() => onToggleStatus(c.id, c.status)}
        >
          {c.status === "active" ? "Pasifleştir" : "Aktifleştir"}
        </button>
        <button
          type="button"
          className="super-admin-action"
          onClick={() => void handleProvisionDrive()}
        >
          {c.driveFolderUrl ? "Drive" : "Drive kur"}
        </button>
        <button
          type="button"
          className="super-admin-action"
          onClick={() => void handleShareDrive()}
        >
          Paylaş
        </button>
        <button
          type="button"
          className="super-admin-action super-admin-action--danger"
          onClick={() => onDelete(c.id, c.slug)}
        >
          Sil
        </button>
      </div>
    </li>
  );
}
