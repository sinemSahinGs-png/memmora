"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MemoriesGalleryFrame } from "@/components/couple-gallery/MemoriesGalleryFrame";
import {
  clampFrameCrop,
  DEFAULT_MEMORIES_FRAME_CROP,
  getMemoriesFrameCropStyle,
  MEMORIES_FRAME_PAN_MAX,
  MEMORIES_FRAME_ZOOM_MAX,
  MEMORIES_FRAME_ZOOM_MIN,
  type MemoriesFrameCrop,
} from "@/lib/memories-frame-crop";
import { cn } from "@/lib/utils";

interface CouplePhotoFrameEditorProps {
  previewUrl: string;
  filename: string;
  initialCrop?: Partial<MemoriesFrameCrop>;
  saving?: boolean;
  savingLabel?: string;
  confirmLabel?: string;
  batchHint?: string;
  error?: string | null;
  onConfirm: (crop: MemoriesFrameCrop) => void | Promise<void>;
  onCancel: () => void;
}

export function CouplePhotoFrameEditor({
  previewUrl,
  filename,
  initialCrop,
  saving = false,
  savingLabel = "Kaydediliyor…",
  confirmLabel = "Kaydet ve Yükle",
  batchHint,
  error,
  onConfirm,
  onCancel,
}: CouplePhotoFrameEditorProps) {
  const [zoom, setZoom] = useState(initialCrop?.zoom ?? DEFAULT_MEMORIES_FRAME_CROP.zoom);
  const [panX, setPanX] = useState(initialCrop?.panX ?? DEFAULT_MEMORIES_FRAME_CROP.panX);
  const [panY, setPanY] = useState(initialCrop?.panY ?? DEFAULT_MEMORIES_FRAME_CROP.panY);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const crop = clampFrameCrop({ zoom, panX, panY });

  const resetCrop = useCallback(() => {
    setZoom(DEFAULT_MEMORIES_FRAME_CROP.zoom);
    setPanX(DEFAULT_MEMORIES_FRAME_CROP.panX);
    setPanY(DEFAULT_MEMORIES_FRAME_CROP.panY);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    dragging.current = true;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      const factor = 0.12 / Math.max(zoom, 1);
      setPanX((value) =>
        Math.min(MEMORIES_FRAME_PAN_MAX, Math.max(-MEMORIES_FRAME_PAN_MAX, value + dx * factor))
      );
      setPanY((value) =>
        Math.min(MEMORIES_FRAME_PAN_MAX, Math.max(-MEMORIES_FRAME_PAN_MAX, value + dy * factor))
      );
    },
    [zoom]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    return () => {
      dragging.current = false;
    };
  }, []);

  const handleConfirmClick = () => {
    void onConfirm(crop);
  };

  return (
    <div
      className="couple-photo-frame-editor"
      role="dialog"
      aria-modal="true"
      aria-labelledby="frame-editor-title"
    >
      <div className="couple-photo-frame-editor__backdrop" onClick={onCancel} aria-hidden />
      <div className="couple-photo-frame-editor__panel">
        <header className="couple-photo-frame-editor__head">
          <p id="frame-editor-title" className="couple-photo-frame-editor__eyebrow">
            Frame içinde konumlandır
          </p>
          <h2 className="couple-photo-frame-editor__title">Memories frame önizleme</h2>
          <p className="couple-photo-frame-editor__subtitle">
            Fotoğrafı memories frame içinde nasıl görüneceğini ayarlayın.
            {filename ? ` (${filename})` : ""}
          </p>
          {batchHint ? (
            <p className="couple-photo-frame-editor__batch-hint">{batchHint}</p>
          ) : null}
        </header>

        <div
          className="couple-photo-frame-editor__stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <MemoriesGalleryFrame className="couple-photo-frame-editor__frame">
            <div className="couple-photo-frame-editor__photo-slot memories-framed-photo__viewport">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                className="memories-framed-photo__img"
                style={getMemoriesFrameCropStyle(crop)}
                draggable={false}
              />
            </div>
          </MemoriesGalleryFrame>
          <p className="couple-photo-frame-editor__drag-hint">
            Fotoğrafı sürükleyerek konumlandırın
          </p>
        </div>

        <label className="couple-photo-frame-editor__zoom">
          <span>Yakınlaştırma</span>
          <input
            type="range"
            min={MEMORIES_FRAME_ZOOM_MIN}
            max={MEMORIES_FRAME_ZOOM_MAX}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>

        {error ? (
          <p className="couple-photo-frame-editor__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="couple-photo-frame-editor__actions">
          <button
            type="button"
            className="couple-photo-frame-editor__btn couple-photo-frame-editor__btn--ghost"
            onClick={resetCrop}
            disabled={saving}
          >
            Ortala
          </button>
          <button
            type="button"
            className="couple-photo-frame-editor__btn couple-photo-frame-editor__btn--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className={cn(
              "couple-photo-frame-editor__btn couple-photo-frame-editor__btn--primary admin-premium-sheen-surface"
            )}
            onClick={handleConfirmClick}
            disabled={saving}
          >
            {saving ? savingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
