"use client";

import type { CoupleListItem } from "@/lib/types";
import { formatDisplayDate } from "@/lib/mock-data";
import { provisionCoupleDriveFolder } from "@/lib/provision-drive-folder-client";
import { buildCoupleAdminUrl, buildCouplePublicUrl } from "@/lib/site-url";
import { formatManualShareMessage, shareCoupleDriveFolder } from "@/lib/share-drive-folder-client";
import { cn } from "@/lib/utils";

interface SuperAdminCoupleListProps {
  couples: CoupleListItem[];
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, current: CoupleListItem["status"]) => void;
  onDelete: (id: string, slug: string) => void;
  onRefresh?: () => void | Promise<void>;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
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
    <>
      <div className="super-admin-table-wrap hidden md:block">
        <table className="super-admin-table">
          <thead>
            <tr>
              <th>Çift</th>
              <th>Slug</th>
              <th>Düğün</th>
              <th>Yaprak</th>
              <th>Medya</th>
              <th>Katılım</th>
              <th>Quiz</th>
              <th>Durum</th>
              <th>Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            {couples.map((c) => (
              <CoupleRowDesktop
                key={c.id}
                couple={c}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
                onRefresh={onRefresh}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 md:hidden">
        {couples.map((c) => (
          <CoupleCardMobile
            key={c.id}
            couple={c}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
        ))}
      </ul>
    </>
  );
}

function CoupleRowDesktop({
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

  return (
    <tr>
      <td>
        <p className="font-medium text-white/90">{c.displayTitle}</p>
        <p className="text-[10px] text-white/35">
          {formatDisplayDate(c.createdAt.split("T")[0])}
        </p>
      </td>
      <td className="text-white/65">{c.slug}</td>
      <td className="text-white/55">
        {c.weddingDate ? formatDisplayDate(c.weddingDate) : "—"}
      </td>
      <td>{c.leafCount}</td>
      <td>{c.mediaCount}</td>
      <td>
        <span title={`${c.rsvpResponseCount ?? 0} yanıt`}>
          {c.rsvpGuestCount ?? 0}
        </span>
        <span className="text-white/35 text-[10px]">
          {" "}
          · {c.invitationEnabled === false ? "Kapalı" : "Açık"}
        </span>
      </td>
      <td>{c.quizEnabled ? "Açık" : "Kapalı"}</td>
      <td>
        <StatusBadge status={c.status} />
      </td>
      <td>
        <ActionButtons
          couple={c}
          publicUrl={publicUrl}
          adminUrl={adminUrl}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      </td>
    </tr>
  );
}

function CoupleCardMobile({
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

  return (
    <li className="super-admin-mobile-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white/90">{c.displayTitle}</p>
          <p className="text-xs text-white/45">{c.slug}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/50">
        <span>{c.leafCount} yaprak</span>
        <span>{c.mediaCount} medya</span>
        <span>{c.rsvpGuestCount ?? 0} katılım</span>
        <span>{c.quizEnabled ? "Quiz açık" : "Quiz kapalı"}</span>
      </div>
      <div className="mt-4">
        <ActionButtons
          couple={c}
          publicUrl={publicUrl}
          adminUrl={adminUrl}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: CoupleListItem["status"] }) {
  return (
    <span
      className={cn(
        "super-admin-status",
        status === "active" ? "super-admin-status--active" : "super-admin-status--passive"
      )}
    >
      {status === "active" ? "Aktif" : "Pasif"}
    </span>
  );
}

function ActionButtons({
  couple: c,
  publicUrl,
  adminUrl,
  onEdit,
  onToggleStatus,
  onDelete,
  onRefresh,
}: {
  couple: CoupleListItem;
  publicUrl: string;
  adminUrl: string;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, current: CoupleListItem["status"]) => void;
  onDelete: (id: string, slug: string) => void;
  onRefresh?: () => void | Promise<void>;
}) {
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
        : "Drive klasörü zaten hazırdı."
    );

    if (result.driveFolderUrl) {
      window.open(result.driveFolderUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a href={publicUrl} target="_blank" rel="noreferrer" className="super-admin-action">
        Sayfa
      </a>
      <a href={adminUrl} target="_blank" rel="noreferrer" className="super-admin-action">
        Admin
      </a>
      <button type="button" className="super-admin-action" onClick={() => copyText(publicUrl)}>
        Link
      </button>
      <button type="button" className="super-admin-action" onClick={() => copyText(publicUrl)}>
        NFC
      </button>
      <button type="button" className="super-admin-action" onClick={() => void handleProvisionDrive()}>
        {c.driveFolderUrl ? "Drive Aç" : "Drive Oluştur"}
      </button>
      <button type="button" className="super-admin-action" onClick={() => void handleShareDrive()}>
        Drive Paylaş
      </button>
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
        className="super-admin-action super-admin-action--danger"
        onClick={() => onDelete(c.id, c.slug)}
      >
        Sil
      </button>
    </div>
  );
}
