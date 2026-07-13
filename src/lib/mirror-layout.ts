/** mirror-frame.png native dimensions: 1024 × 1536 */
export const MIRROR_ASPECT = 1024 / 1536;

/** Safe zone inside the transparent mirror opening (tuned to PNG) */
export const MIRROR_SAFE_INSET = {
  top: "25%",
  right: "24%",
  bottom: "17%",
  left: "24%",
} as const;

export const MIRROR_SAFE_INSET_MOBILE = {
  top: "25%",
  right: "25%",
  bottom: "17%",
  left: "25%",
} as const;
