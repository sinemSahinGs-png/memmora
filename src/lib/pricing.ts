import type { PackageType } from "@/lib/types";

export interface PricingPlan {
  id: PackageType;
  name: string;
  tagline: string;
  priceLabel: string;
  featured?: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Anılarınızı toplamaya başlayın.",
    priceLabel: "Tek seferlik",
    features: [
      "NFC / link ile anı bırakma",
      "Mesaj toplama",
      "Fotoğraf yükleme",
      "Çift admin paneli",
      "Google Drive arşivi",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Düğün gecenize özel dijital deneyim.",
    priceLabel: "En popüler",
    featured: true,
    features: [
      "Fotoğraf + video yükleme",
      "Quiz & liderlik tablosu",
      "Şarkı kartı",
      "Google Drive medya arşivi",
      "Admin panel",
      "Kişiselleştirilmiş hero alanı",
    ],
  },
  {
    id: "luxury",
    name: "Luxury",
    tagline: "Unutulmaz bir hatıra koleksiyonu.",
    priceLabel: "Özel kurulum",
    features: [
      "Premium özelliklerin tamamı",
      "NFC yaprak / anahtarlık desteği",
      "Özel tasarım",
      "Öncelikli kurulum",
      "Fiziksel konsept ürün opsiyonları",
    ],
  },
];

export function getPlanById(id: string | null | undefined): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === id);
}

export function packageDefaults(packageType: PackageType) {
  switch (packageType) {
    case "basic":
      return { quizEnabled: false, mediaUploadEnabled: true };
    case "premium":
    case "luxury":
      return { quizEnabled: true, mediaUploadEnabled: true };
    default:
      return { quizEnabled: true, mediaUploadEnabled: true };
  }
}
