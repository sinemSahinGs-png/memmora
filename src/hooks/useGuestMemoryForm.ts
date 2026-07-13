"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  getMaxUploadMbLabel,
  submitContribution,
} from "@/lib/supabase/contributions";
import {
  COUPLE_NOT_FOUND_MESSAGE,
  isPlaceholderCoupleId,
} from "@/lib/supabase/couples";
import { getSupabaseEnvStatus, isSupabaseConfigured } from "@/lib/supabase/client";
import { ACCEPTED_MEDIA_TYPES } from "@/lib/supabase/constants";
import { validateUploadFiles } from "@/lib/upload-validation";

interface UseGuestMemoryFormOptions {
  coupleId: string;
  coupleSlug: string;
  onSuccess?: () => void;
}

export function useGuestMemoryForm({
  coupleId,
  coupleSlug,
  onSuccess,
}: UseGuestMemoryFormOptions) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxUploadMb = getMaxUploadMbLabel();

  const previewUrls = useMemo(
    () =>
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : null
      ),
    [files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const validateAndSetFiles = useCallback((selected: File[]) => {
    setError(null);
    setWarning(null);
    const result = validateUploadFiles(selected);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFiles(selected);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndSetFiles(Array.from(e.target.files ?? []));
    },
    [validateAndSetFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !message.trim()) return;

      if (isPlaceholderCoupleId(coupleId)) {
        setError(COUPLE_NOT_FOUND_MESSAGE);
        return;
      }

      const envStatus = getSupabaseEnvStatus();

      if (!isSupabaseConfigured()) {
        const envError =
          "Supabase env eksik: NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY proje kökündeki .env.local dosyasında tanımlı olmalı.";
        console.error("submit error", envError, envStatus);
        setError(envError);
        return;
      }

      setLoading(true);
      setError(null);
      setWarning(null);

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

        if (result.mediaWarning) {
          setWarning(result.mediaWarning);
        }
      } catch (err) {
        console.error("submit error", err);
        setError(
          err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
        );
        return;
      } finally {
        setLoading(false);
      }

      setName("");
      setMessage("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 2400);
      onSuccess?.();
    },
    [coupleId, coupleSlug, name, message, files, onSuccess]
  );

  return {
    name,
    setName,
    message,
    setMessage,
    files,
    error,
    warning,
    loading,
    successPulse,
    fileInputRef,
    previewUrls,
    handleFileChange,
    removeFile,
    openFilePicker,
    handleSubmit,
    acceptTypes: ACCEPTED_MEDIA_TYPES,
    maxUploadMb,
  };
}

export type GuestMemoryFormController = ReturnType<typeof useGuestMemoryForm>;
