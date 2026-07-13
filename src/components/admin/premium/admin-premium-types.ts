export type AdminPremiumBottomTab = "leaves" | "gallery" | "memories" | "quiz";

export type AdminPremiumTab = AdminPremiumBottomTab | "settings";

export const ADMIN_PREMIUM_BOTTOM_TABS: Array<{
  id: AdminPremiumBottomTab;
  label: string;
}> = [
  { id: "leaves", label: "Yapraklar" },
  { id: "gallery", label: "Galeri" },
  { id: "memories", label: "Anılar" },
  { id: "quiz", label: "Quiz" },
];

/** Desktop tab strip — same as bottom nav (no Ayarlar). */
export const ADMIN_PREMIUM_TOP_TABS = ADMIN_PREMIUM_BOTTOM_TABS;

export type AdminSettingsPanel = "main" | "quiz";
