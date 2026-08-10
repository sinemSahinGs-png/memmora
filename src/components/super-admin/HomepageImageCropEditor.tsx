"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clampFrameCrop,
  DEFAULT_MEMORIES_FRAME_CROP,
  getMemoriesFrameCropStyle,
  MEMORIES_FRAME_PAN_MAX,
  MEMORIES_FRAME_ZOOM_MAX,
  MEMORIES_FRAME_ZOOM_MIN,
  type MemoriesFrameCrop,
} from "@/lib/memories-frame-crop";

interface HomepageImageCropEditorProps {
  previewUrl: string;
  filename?: string;
  initialCrop?: Partial<MemoriesFrameCrop>;
  saving?: boolean;
  savingLabel?: string;
  confirmLabel?: string;
  onConfirm: (crop: MemoriesFrameCrop) => void | Promise<void>;
  onCancel: () => void;
  error?: string | null;
}

/** Ring-card aspect cropper for homepage memories (no couple frame dependency). */
export function HomepageImageCropEditor({
  previewUrl,
  filename,
  initialCrop,
  saving = false,
  savingLabel = "Kaydediliyor…",
  confirmLabel = "Kaydet",
  onConfirm,
  onCancel,
  error,
}: HomepageImageCropEditorProps) {
  const [zoom, setZoom] = useState(
    initialCrop?.zoom ?? DEFAULT_MEMORIES_FRAME_CROP.zoom,
  );
  const [panX, setPanX] = useState(
    initialCrop?.panX ?? DEFAULT_MEMORIES_FRAME_CROP.panX,
  );
  const [panY, setPanY] = useState(
    initialCrop?.panY ?? DEFAULT_MEMORIES_FRAME_CROP.panY,
  );
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
      const factor = 0.14 / Math.max(zoom, 1);
      setPanX((value) =>
        Math.min(
          MEMORIES_FRAME_PAN_MAX,
          Math.max(-MEMORIES_FRAME_PAN_MAX, value + dx * factor),
        ),
      );
      setPanY((value) =>
        Math.min(
          MEMORIES_FRAME_PAN_MAX,
          Math.max(-MEMORIES_FRAME_PAN_MAX, value + dy * factor),
        ),
      );
    },
    [zoom],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    return () => {
      dragging.current = false;
    };
  }, []);

  return (
    <div className="hp-crop" role="dialog" aria-modal="true">
      <button
        type="button"
        className="hp-crop__backdrop"
        aria-label="Kapat"
        onClick={onCancel}
      />
      <div className="hp-crop__panel">
        <header className="hp-crop__head">
          <p className="hp-crop__eyebrow">Ölçek & konum</p>
          <h2 className="hp-crop__title">Görsel önizleme</h2>
          <p className="hp-crop__subtitle">
            Anasayfa halkasında nasıl görüneceğini ayarlayın.
            {filename ? ` ${filename}` : ""}
          </p>
        </header>

        <div
          className="hp-crop__stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="hp-crop__frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              className="hp-crop__img"
              style={getMemoriesFrameCropStyle(crop)}
              draggable={false}
            />
          </div>
          <p className="hp-crop__hint">Sürükleyerek kaydırın · Slider ile yakınlaştırın</p>
        </div>

        <label className="hp-crop__zoom">
          <span>
            Ölçek <strong>{zoom.toFixed(2)}×</strong>
          </span>
          <input
            type="range"
            min={MEMORIES_FRAME_ZOOM_MIN}
            max={MEMORIES_FRAME_ZOOM_MAX}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {error ? (
          <p className="hp-crop__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="hp-crop__actions">
          <button
            type="button"
            className="hp-crop__btn hp-crop__btn--ghost"
            onClick={resetCrop}
            disabled={saving}
          >
            Ortala
          </button>
          <button
            type="button"
            className="hp-crop__btn hp-crop__btn--ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="hp-crop__btn hp-crop__btn--primary"
            onClick={() => void onConfirm(crop)}
            disabled={saving}
          >
            {saving ? savingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
