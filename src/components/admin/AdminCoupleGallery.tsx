"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CouplePhotoFrameEditor } from "./CouplePhotoFrameEditor";
import { MemoriesFramedPhoto } from "@/components/couple-gallery/MemoriesFramedPhoto";
import type { Couple } from "@/lib/types";
import { updateMemoriesGalleryEnabled } from "@/lib/supabase/couples";
import { fetchCouplePhotosForAdmin } from "@/lib/supabase/couple-photos";
import type { CouplePhoto } from "@/lib/types";
import { getCouplePhotoImageUrl } from "@/lib/couple-photo-utils";
import type { MemoriesFrameCrop } from "@/lib/memories-frame-crop";
import { MAX_COUPLE_GALLERY_PHOTOS } from "@/lib/supabase/constants";
import { formatCoupleGalleryUploadError } from "@/lib/couple-gallery-migration";
import { getMaxUploadMbLabel, isAllowedGalleryImageMimeType } from "@/lib/upload-validation";
import { cn } from "@/lib/utils";

interface AdminCoupleGalleryProps {
  couple: Couple;
  onCoupleUpdated?: (couple: Couple) => void;
}

type PendingUpload = {
  file: File;
  previewUrl: string;
};

type EditingPhoto = {
  photo: CouplePhoto;
  previewUrl: string;
};

export function AdminCoupleGallery({
  couple,
  onCoupleUpdated,
}: AdminCoupleGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<CouplePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingPhotoId, setUpdatingPhotoId] = useState<string | null>(null);
  const [togglingGallery, setTogglingGallery] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(couple.memoriesGalleryEnabled);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto | null>(null);

  const clearPendingUploads = useCallback(() => {
    setPendingUploads((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  }, []);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCouplePhotosForAdmin(couple.id);
      setPhotos(rows);
    } catch (err) {
      setPhotos([]);
      const errMessage =
        err instanceof Error ? err.message : "Fotoğraflar yüklenemedi.";
      if (errMessage.includes("couple_photos")) {
        setError(
          "couple_photos tablosu henüz oluşturulmamış. Supabase Dashboard → SQL Editor'da supabase/migration-couple-gallery.sql dosyasını çalıştırın."
        );
      } else {
        setError("Fotoğraflar yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, [couple.id]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    setGalleryVisible(couple.memoriesGalleryEnabled);
  }, [couple.memoriesGalleryEnabled]);

  useEffect(() => {
    return () => {
      pendingUploads.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [pendingUploads]);

  const handleToggleGalleryVisibility = async () => {
    setTogglingGallery(true);
    setMessage(null);
    setError(null);

    const next = !galleryVisible;
    const result = await updateMemoriesGalleryEnabled(couple.id, next);

    setTogglingGallery(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setGalleryVisible(next);
    onCoupleUpdated?.(result.couple);
    setMessage(
      next
        ? "Anılarımız bölümü sitede görünür."
        : "Anılarımız bölümü siteden gizlendi."
    );
  };

  const uploadWithCrop = async (
    file: File,
    crop: MemoriesFrameCrop
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("coupleSlug", couple.slug);
      formData.append("frameZoom", String(crop.zoom));
      formData.append("framePanX", String(crop.panX));
      formData.append("framePanY", String(crop.panY));

      const response = await fetch("/api/upload-couple-photo", {
        method: "POST",
        body: formData,
      });

      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const detail = payload.error ?? `"${file.name}" yüklenemedi.`;
        return { ok: false, error: formatCoupleGalleryUploadError(detail) };
      }

      return { ok: true };
    } catch {
      return { ok: false, error: `"${file.name}" yüklenirken bağlantı hatası oluştu.` };
    }
  };

  const saveFrameForPhoto = async (
    photoId: string,
    crop: MemoriesFrameCrop
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/update-couple-photo-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          coupleSlug: couple.slug,
          frameZoom: crop.zoom,
          framePanX: crop.panX,
          framePanY: crop.panY,
        }),
      });
      let payload: { error?: string } = {};
      try {
        payload = (await response.json()) as { error?: string };
      } catch {
        payload = {};
      }
      if (!response.ok) {
        return { ok: false, error: payload.error ?? "Frame ayarı kaydedilemedi." };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: "Frame ayarı kaydedilirken bağlantı hatası oluştu." };
    }
  };

  const updatePhotoMeta = async (
    photoId: string,
    options: { isVisible?: boolean; promoteToFront?: boolean }
  ) => {
    setUpdatingPhotoId(photoId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/update-couple-photo-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          coupleSlug: couple.slug,
          ...options,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Fotoğraf güncellenemedi.");
        return false;
      }

      await loadPhotos();
      if (options.isVisible === true) {
        setMessage("Fotoğraf sitede gösterilecek.");
      } else if (options.isVisible === false) {
        setMessage("Fotoğraf gizlendi.");
      } else if (options.promoteToFront) {
        setMessage("Fotoğraf öne alındı.");
      }
      return true;
    } catch {
      setError("Fotoğraf güncellenemedi.");
      return false;
    } finally {
      setUpdatingPhotoId(null);
    }
  };

  const handleFilePick = (files: FileList | null) => {
    if (!files?.length) return;

    const remainingSlots = MAX_COUPLE_GALLERY_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setError(`En fazla ${MAX_COUPLE_GALLERY_PHOTOS} fotoğraf yüklenebilir.`);
      return;
    }

    const accepted = Array.from(files).filter((file) =>
      isAllowedGalleryImageMimeType(file.type)
    );
    const rejectedCount = files.length - accepted.length;

    if (accepted.length === 0) {
      setError("Sadece JPEG, PNG veya WebP yükleyebilirsiniz.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const batch = accepted.slice(0, remainingSlots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (accepted.length > remainingSlots) {
      setMessage(
        `Yalnızca ${remainingSlots} fotoğraf daha eklenebilir; ilk ${remainingSlots} dosya seçildi.`
      );
    } else {
      setMessage(null);
    }

    if (rejectedCount > 0) {
      setError(`${rejectedCount} dosya desteklenmeyen formatta olduğu için atlandı.`);
    } else {
      setError(null);
    }

    setEditorError(null);
    setPendingUploads(batch);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async (crop: MemoriesFrameCrop) => {
    if (pendingUploads.length === 0) return;

    setUploading(true);
    setEditorError(null);
    setError(null);

    let successCount = 0;
    const total = pendingUploads.length;

    try {
      for (let index = 0; index < pendingUploads.length; index += 1) {
        setUploadProgress({ current: index + 1, total });
        const item = pendingUploads[index];
        const result = await uploadWithCrop(item.file, crop);

        if (!result.ok) {
          const partialNote =
            successCount > 0 ? ` ${successCount} fotoğraf kaydedildi.` : "";
          setEditorError(
            (result.error ?? `"${item.file.name}" kaydedilemedi.`) + partialNote
          );
          if (successCount > 0) {
            await loadPhotos();
            setPendingUploads((current) => {
              const remaining = current.slice(successCount);
              current.slice(0, successCount).forEach((upload) => {
                URL.revokeObjectURL(upload.previewUrl);
              });
              return remaining;
            });
          }
          return;
        }

        successCount += 1;
      }

      setMessage(
        successCount === 1
          ? "Fotoğraf frame ile kaydedildi."
          : `${successCount} fotoğraf frame ile kaydedildi.`
      );
      clearPendingUploads();
      await loadPhotos();
    } catch {
      setEditorError("Fotoğraflar kaydedilirken beklenmeyen bir hata oluştu.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleConfirmEdit = async (crop: MemoriesFrameCrop) => {
    if (!editingPhoto) return;
    setUploading(true);
    setEditorError(null);
    setError(null);

    try {
      const result = await saveFrameForPhoto(editingPhoto.photo.id, crop);
      if (result.ok) {
        setMessage("Frame konumu güncellendi.");
        await loadPhotos();
        setEditingPhoto(null);
        setEditorError(null);
      } else {
        setEditorError(result.error ?? "Frame ayarı kaydedilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      setEditorError("Frame ayarı kaydedilirken bağlantı hatası oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/delete-couple-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, coupleSlug: couple.slug }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Fotoğraf silinemedi.");
        return;
      }

      await loadPhotos();
      setMessage("Fotoğraf silindi.");
    } catch {
      setError("Fotoğraf silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const maxMb = getMaxUploadMbLabel();
  const atLimit = photos.length >= MAX_COUPLE_GALLERY_PHOTOS;

  return (
    <>
      <section className="admin-premium-memories admin-premium-card admin-premium-card--living admin-premium-reveal admin-premium-reveal--d5">
        <p className="admin-premium-memories__eyebrow">Anılarımız</p>
        <h2 className="admin-premium-card__title admin-premium-card__title--solo">
          Anı Galerisi
        </h2>
        <p className="admin-premium-memories__intro">
          Romantik, seçilmiş anılarınızı yükleyin. Her fotoğraf public sitede
          premium memories frame içinde görünür; yüklemeden önce frame önizlemesi
          ile konumlandırın.
        </p>

        <div className="admin-premium-memories__toolbar">
          <p className="admin-premium-memories__meta">
            {photos.length} / {MAX_COUPLE_GALLERY_PHOTOS} fotoğraf · max {maxMb}MB
            {!galleryVisible ? " · sitede gizli" : ""}
          </p>
          <div className="admin-premium-memories__actions">
            <button
              type="button"
              disabled={togglingGallery}
              onClick={handleToggleGalleryVisibility}
              className={cn(
                "admin-premium-outline-btn admin-premium-outline-btn--sm admin-premium-interactive",
                !galleryVisible && "admin-premium-outline-btn--cta"
              )}
            >
              {togglingGallery
                ? "Kaydediliyor…"
                : galleryVisible
                  ? "Anılarımı Gizle"
                  : "Anılarımı Göster"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={uploading || atLimit}
              onChange={(e) => handleFilePick(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading || atLimit}
              onClick={() => fileInputRef.current?.click()}
              className="admin-premium-outline-btn admin-premium-outline-btn--cta admin-premium-outline-btn--photos admin-premium-interactive"
            >
              {uploading
                ? uploadProgress
                  ? `${uploadProgress.current}/${uploadProgress.total} kaydediliyor…`
                  : "Kaydediliyor…"
                : atLimit
                  ? "Limit doldu"
                  : "Fotoğraf Yükle"}
            </button>
          </div>
        </div>

        {message ? (
          <p className="admin-premium-memories__feedback admin-premium-memories__feedback--ok">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="admin-premium-memories__feedback admin-premium-memories__feedback--err">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="admin-premium-memories__empty">Fotoğraflar yükleniyor…</div>
        ) : photos.length === 0 ? (
          <div className="admin-premium-memories__empty admin-premium-memories__empty--dashed">
            <p className="admin-premium-memories__empty-title">Henüz fotoğraf yok</p>
            <p className="admin-premium-memories__empty-sub">
              İlk fotoğrafı yüklediğinizde premium frame galerisi sitede açılır.
            </p>
          </div>
        ) : (
          <ul className="admin-premium-memories__grid">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className="admin-premium-memories__item admin-premium-sheen-surface admin-premium-interactive-lift"
              >
                <MemoriesFramedPhoto
                  src={getCouplePhotoImageUrl(
                    photo.id,
                    photo.driveFileId,
                    photo.imageUrl
                  )}
                  alt={photo.filename ?? `Anı ${index + 1}`}
                  crop={{
                    zoom: photo.frameZoom,
                    panX: photo.framePanX,
                    panY: photo.framePanY,
                  }}
                  className="admin-premium-memories__frame"
                  frameClassName="admin-premium-memories__frame-inner"
                />
                {photo.isVisible && galleryVisible ? (
                  <span className="admin-premium-memories__live-badge">
                    Public&apos;te gösteriliyor
                  </span>
                ) : !photo.isVisible ? (
                  <span className="admin-premium-memories__live-badge admin-premium-memories__live-badge--hidden">
                    Gizli
                  </span>
                ) : null}
                <div className="admin-premium-memories__item-foot">
                  <p className="admin-premium-memories__item-name">
                    {photo.filename ?? `Anı ${index + 1}`}
                  </p>
                  <div className="admin-premium-memories__item-actions">
                    <button
                      type="button"
                      className="admin-premium-text-link admin-premium-text-link--animated admin-premium-interactive admin-premium-interactive--link"
                      disabled={updatingPhotoId === photo.id}
                      onClick={() =>
                        setEditingPhoto({
                          photo,
                          previewUrl: getCouplePhotoImageUrl(
                            photo.id,
                            photo.driveFileId,
                            photo.imageUrl
                          ),
                        })
                      }
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      disabled={updatingPhotoId === photo.id}
                      onClick={() =>
                        void updatePhotoMeta(photo.id, {
                          isVisible: !photo.isVisible,
                        })
                      }
                      className="admin-premium-text-link admin-premium-text-link--animated admin-premium-interactive admin-premium-interactive--link"
                    >
                      {photo.isVisible ? "Gizle" : "Göster"}
                    </button>
                    {index > 0 ? (
                      <button
                        type="button"
                        disabled={updatingPhotoId === photo.id}
                        onClick={() =>
                          void updatePhotoMeta(photo.id, { promoteToFront: true })
                        }
                        className="admin-premium-text-link admin-premium-text-link--animated admin-premium-interactive admin-premium-interactive--link"
                      >
                        Öne al
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={deletingId === photo.id || updatingPhotoId === photo.id}
                      onClick={() => handleDelete(photo.id)}
                      className="admin-premium-memories__delete"
                    >
                      {deletingId === photo.id ? "…" : "Sil"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingUploads.length > 0 ? (
        <CouplePhotoFrameEditor
          previewUrl={pendingUploads[0].previewUrl}
          filename={pendingUploads[0].file.name}
          saving={uploading}
          savingLabel={
            uploadProgress
              ? `${uploadProgress.current}/${uploadProgress.total} kaydediliyor…`
              : "Kaydediliyor…"
          }
          batchHint={
            pendingUploads.length > 1
              ? `${pendingUploads.length} fotoğraf seçildi · aynı çerçeve konumu hepsine uygulanır`
              : undefined
          }
          error={editorError}
          onCancel={() => {
            if (uploading) return;
            clearPendingUploads();
            setEditorError(null);
          }}
          onConfirm={handleConfirmUpload}
        />
      ) : null}

      {editingPhoto ? (
        <CouplePhotoFrameEditor
          previewUrl={editingPhoto.previewUrl}
          filename={editingPhoto.photo.filename ?? "Fotoğraf"}
          initialCrop={{
            zoom: editingPhoto.photo.frameZoom,
            panX: editingPhoto.photo.framePanX,
            panY: editingPhoto.photo.framePanY,
          }}
          saving={uploading}
          confirmLabel="Kaydet"
          error={editorError}
          onCancel={() => {
            if (uploading) return;
            setEditingPhoto(null);
            setEditorError(null);
          }}
          onConfirm={handleConfirmEdit}
        />
      ) : null}
    </>
  );
}
