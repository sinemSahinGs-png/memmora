/**
 * Premium e-davetiye asset yolları.
 * Dosyalar: public/assets/invite/
 */
export const INVITE_ASSETS = {
  /** Closed-state scenic cover (replaces flat botanical bg) */
  background: "/assets/invite/invite-cover.png",
  envelope: "/assets/invite/invite-envelope.png",
  openingVideo: "/assets/invite/invite-open.mp4",
  finalPoster: "/assets/invite/invite-open-final.png",
} as const;

/** Final poster aspect + form safe-area on the card (tune if asset changes) */
export const INVITE_PAPER_LAYOUT = {
  posterAspect: 9 / 16,
  /** Blank card area inside invite-open-final.png */
  insetTop: "35%",
  insetRight: "20%",
  insetBottom: "22%",
  insetLeft: "20%",
  /** Form content width as % of card safe area */
  formWidth: "84%",
  formMaxWidth: "220px",
} as const;

export type InviteStage = "closed" | "opening" | "opened";
