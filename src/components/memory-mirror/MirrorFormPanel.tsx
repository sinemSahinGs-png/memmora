"use client";

import { motion } from "framer-motion";
import type { GuestMemoryFormController } from "@/hooks/useGuestMemoryForm";

interface MirrorFormPanelProps {
  form: GuestMemoryFormController;
  disabled?: boolean;
}

export function MirrorFormPanel({ form, disabled = false }: MirrorFormPanelProps) {
  const locked = disabled || form.loading;

  if (disabled) {
    return (
      <div className="mirror-form-panel mirror-form-panel--disabled">
        <header className="mirror-form-header">
          <h2 className="mirror-form-title">Anı kabul edilmiyor</h2>
          <p className="mirror-form-subtitle">
            Bu Memoora sayfası şu anda yeni anı kabul etmiyor.
          </p>
        </header>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="mirror-form-panel">
      <header className="mirror-form-header">
        <h2 className="mirror-form-title">Bir anı bırak.</h2>
        <p className="mirror-form-subtitle">Mesajın yaprağa dönüşsün.</p>
      </header>

      <label className="mirror-field">
        <span className="mirror-label">Ad</span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          placeholder="Adın"
          className="mirror-input"
          required
          disabled={locked}
        />
      </label>

      <label className="mirror-field">
        <span className="mirror-label">Mesaj</span>
        <textarea
          value={form.message}
          onChange={(e) => form.setMessage(e.target.value)}
          placeholder="Kısa bir not yaz..."
          className="mirror-input mirror-textarea"
          required
          disabled={locked}
        />
      </label>

      <div className="mirror-field">
        <span className="mirror-label">Medya</span>
        <button
          type="button"
          className="mirror-upload-pill"
          onClick={form.openFilePicker}
          disabled={locked}
        >
          + Dosya seç
        </button>
        <input
          ref={form.fileInputRef}
          type="file"
          accept={form.acceptTypes}
          multiple
          onChange={form.handleFileChange}
          disabled={locked}
          className="sr-only"
        />
        {form.files.length > 0 && (
          <p className="mirror-file-count">
            {form.files.length} dosya
            <button
              type="button"
              className="mirror-file-clear"
              onClick={() => {
                const count = form.files.length;
                for (let i = 0; i < count; i++) form.removeFile(0);
              }}
            >
              ×
            </button>
          </p>
        )}
      </div>

      {form.error && <p className="mirror-form-error">{form.error}</p>}
      {form.warning && (
        <p className="mirror-form-warning">{form.warning}</p>
      )}

      <motion.button
        type="submit"
        className="mirror-submit-btn"
        disabled={locked}
        whileTap={{ scale: locked ? 1 : 0.98 }}
        transition={{ duration: 0.18 }}
      >
        {form.loading ? "Ekleniyor…" : "Bırak"}
      </motion.button>
    </form>
  );
}
