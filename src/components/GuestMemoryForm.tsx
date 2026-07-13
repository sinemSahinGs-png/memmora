"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  submitContribution,
  type SubmitContributionInput,
} from "@/lib/supabase/contributions";
import {
  getMaxUploadMbLabel,
  validateUploadFiles,
} from "@/lib/upload-validation";
import { getSupabaseEnvStatus, isSupabaseConfigured } from "@/lib/supabase/client";
import { ACCEPTED_MEDIA_TYPES } from "@/lib/supabase/constants";

interface GuestMemoryFormProps {
  coupleId: string;
  coupleSlug: string;
  onSuccess?: () => void;
  /** Compact dark glass card sized for mirror inset */
  inMirror?: boolean;
}

export function GuestMemoryForm({
  coupleId,
  coupleSlug,
  onSuccess,
  inMirror = false,
}: GuestMemoryFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const validateAndSetFiles = (selected: File[]) => {
    setError(null);
    const result = validateUploadFiles(selected);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFiles(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFiles(Array.from(e.target.files ?? []));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const envStatus = getSupabaseEnvStatus();
    console.log("coupleId", coupleId);
    console.log(
      "supabaseConfigured",
      envStatus.hasUrl,
      envStatus.hasKey
    );

    if (!isSupabaseConfigured()) {
      const envError =
        "Supabase env eksik: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY proje kökündeki .env.local dosyasında tanımlı olmalı (.env.local/.env.local değil).";
      console.error("submit error", envError, envStatus);
      setError(envError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitContribution({
        coupleId,
        coupleSlug,
        guestName: name.trim(),
        message: message.trim(),
        files,
      });

      if (!result.success) {
        console.error("submit error", result.error);
        setError(result.error);
        return;
      }
    } catch (error) {
      console.error("submit error", error);
      setError(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu."
      );
      return;
    } finally {
      setLoading(false);
    }

    setName("");
    setMessage("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onSuccess?.();
  };

  return (
    <div
      className={
        inMirror ? "memory-ritual-card memory-ritual-card--mirror" : "memory-ritual-card"
      }
    >
      <p className="memory-ritual-eyebrow">Hatıra Ritüeli</p>
      <h2 className="memory-ritual-title">Altın Bir Yaprak Bırak</h2>
      <p className="memory-ritual-desc">
        Mesajın ağacın yeni bir yaprağına dönüşür.
      </p>

      <form onSubmit={handleSubmit} className="memory-ritual-form">
        <Field label="Adın">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seni nasıl tanıyorlar?"
            className="memory-ritual-input"
            required
            disabled={loading}
          />
        </Field>

        <Field label="Mesajın">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bir dilek, bir anı ya da gelecekleri için birkaç söz..."
            className="memory-ritual-input memory-ritual-textarea"
            required
            disabled={loading}
          />
        </Field>

        <div>
          <label className="memory-ritual-label">Fotoğraf veya video</label>
          <button
            type="button"
            className="memory-upload-zone"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <span className="memory-upload-orb" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#9AA89B]">
                <path
                  d="M12 4C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-10Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="memory-upload-text">Fotoğraf veya video ekle</span>
            <span className="memory-upload-hint">
              Dosya başına en fazla {getMaxUploadMbLabel()}MB
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_MEDIA_TYPES}
            multiple
            onChange={handleFileChange}
            disabled={loading}
            className="sr-only"
          />

          {files.length > 0 && (
            <ul className="memory-file-chips">
              {files.map((file, i) => (
                <li key={`${file.name}-${i}`} className="memory-file-chip">
                  {previewUrls[i] ? (
                    <img src={previewUrls[i]!} alt="" className="memory-file-chip-thumb" />
                  ) : (
                    <span className="memory-file-chip-video">Video</span>
                  )}
                  <span className="memory-file-chip-name">{file.name}</span>
                  <button
                    type="button"
                    className="memory-file-chip-remove"
                    onClick={() => removeFile(i)}
                    aria-label="Dosyayı kaldır"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="memory-ritual-error">{error}</p>}

        <motion.button
          type="submit"
          className="memory-ritual-submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          transition={{ duration: 0.22 }}
        >
          {loading ? "Ekleniyor…" : "Yaprağı Ağaca Ekle"}
        </motion.button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="memory-ritual-label">{label}</span>
      {children}
    </label>
  );
}
