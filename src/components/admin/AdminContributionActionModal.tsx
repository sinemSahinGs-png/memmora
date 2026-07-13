"use client";

import { GoldButton } from "../GoldButton";

interface AdminContributionActionModalProps {
  open: boolean;
  guestName: string;
  loading?: boolean;
  onHide: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function AdminContributionActionModal({
  open,
  guestName,
  loading = false,
  onHide,
  onDelete,
  onCancel,
}: AdminContributionActionModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-contribution-action-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Kapat"
      />
      <div className="glass-panel-strong relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
          Yorum yönetimi
        </p>
        <h2
          id="admin-contribution-action-title"
          className="mt-2 font-serif text-xl text-white/95"
        >
          Bu yorumu ne yapmak istersiniz?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          <span className="text-white/80">{guestName}</span> adlı misafirin yorumu
          için bir işlem seçin.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <GoldButton
            type="button"
            variant="primary"
            className="w-full !text-[10px]"
            onClick={onHide}
            disabled={loading}
          >
            {loading ? "İşleniyor…" : "Gizle"}
          </GoldButton>
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-red-200 transition-colors hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-50"
          >
            Sil
          </button>
          <GoldButton
            type="button"
            variant="secondary"
            className="w-full !text-[10px]"
            onClick={onCancel}
            disabled={loading}
          >
            Vazgeç
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
