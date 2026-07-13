"use client";

import { GoldButton } from "../GoldButton";

interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Evet, sil",
  cancelLabel = "Vazgeç",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: AdminConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Kapat"
      />
      <div className="glass-panel-strong relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">
          Onay
        </p>
        <h2
          id="admin-confirm-title"
          className="mt-2 font-serif text-xl text-white/95"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/55">{description}</p>
        {children}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <GoldButton
            type="button"
            variant="secondary"
            className="w-full !text-[10px] sm:flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </GoldButton>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-6 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-red-200 transition-colors hover:border-red-400/50 hover:bg-red-500/20 disabled:opacity-50 sm:flex-1"
          >
            {loading ? "Siliniyor…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
