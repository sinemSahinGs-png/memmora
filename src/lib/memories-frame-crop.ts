export interface MemoriesFrameCrop {
  zoom: number;
  panX: number;
  panY: number;
}

export const DEFAULT_MEMORIES_FRAME_CROP: MemoriesFrameCrop = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const MEMORIES_FRAME_ZOOM_MIN = 1;
export const MEMORIES_FRAME_ZOOM_MAX = 3;
export const MEMORIES_FRAME_PAN_MAX = 45;

export function clampFrameCrop(crop: Partial<MemoriesFrameCrop>): MemoriesFrameCrop {
  const zoom = Math.min(
    MEMORIES_FRAME_ZOOM_MAX,
    Math.max(MEMORIES_FRAME_ZOOM_MIN, Number(crop.zoom) || 1)
  );
  const panX = Math.min(
    MEMORIES_FRAME_PAN_MAX,
    Math.max(-MEMORIES_FRAME_PAN_MAX, Number(crop.panX) || 0)
  );
  const panY = Math.min(
    MEMORIES_FRAME_PAN_MAX,
    Math.max(-MEMORIES_FRAME_PAN_MAX, Number(crop.panY) || 0)
  );
  return { zoom, panX, panY };
}

export function getMemoriesFrameCropStyle(
  crop: MemoriesFrameCrop
): { transform: string; transformOrigin: string } {
  return {
    transform: `translate(calc(-50% + ${crop.panX}%), calc(-50% + ${crop.panY}%)) scale(${crop.zoom})`,
    transformOrigin: "center center",
  };
}

export function parseFrameCropFromForm(formData: FormData): MemoriesFrameCrop {
  return clampFrameCrop({
    zoom: Number(formData.get("frameZoom")),
    panX: Number(formData.get("framePanX")),
    panY: Number(formData.get("framePanY")),
  });
}
