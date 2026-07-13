export interface HomeDemoCouple {
  slug: string;
  title: string;
}

/** Homepage hero copy */
export const HOME_HERO = {
  headlineLines: ["Düğün", "anılarını", "yaşat."] as const,
  body:
    "Memoora ile ücretsiz dijital davetiye, NFC ürünler, anı mesajları ve büyüyen anı ağacı tek bir deneyimde.",
  primaryCta: "Demo Düğünü Gör",
  secondaryCta: "Nasıl Çalışır?",
} as const;

export const HOME_FEATURE_STRIP = [
  {
    icon: "envelope" as const,
    title: "Ücretsiz Davetiye",
    text: "Pakete dahil",
  },
  {
    icon: "nfc" as const,
    title: "NFC Ürünler",
    text: "Magnet veya anahtarlık",
  },
  {
    icon: "quiz" as const,
    title: "Quiz Deneyimi",
    text: "Düğünde interaktif eğlence",
  },
  {
    icon: "tree" as const,
    title: "Anı Ağacı",
    text: "Her mesaj bir yaprak",
  },
] as const;

export const HOME_PRODUCTS = [
  {
    title: "NFC Magnet",
    gradient: "linear-gradient(145deg, #f6edd8 0%, #e8d4a8 55%, #c9922e 100%)",
    href: "/order?package=premium",
  },
  {
    title: "NFC Anahtarlık",
    gradient: "linear-gradient(145deg, #eef3e4 0%, #c8d4a8 50%, #6f7f42 100%)",
    href: "/order?package=premium",
  },
  {
    title: "Dijital Davetiye",
    gradient: "linear-gradient(145deg, #fffdf8 0%, #f8f4e8 45%, #d4af37 100%)",
    href: "/order?package=basic",
  },
] as const;

export const HOME_STEPS = [
  { title: "Çift sayfası hazırlanır", icon: "setup" as const },
  { title: "NFC ürün teslim edilir", icon: "nfc" as const },
  { title: "Misafir dokunur", icon: "tap" as const },
  { title: "Mesaj bırakır / quiz oynar", icon: "message" as const },
  { title: "Ağaç büyür", icon: "tree" as const },
] as const;

export const HOME_TREE_LABELS = ["Mesaj", "Fotoğraf", "Video", "Quiz"] as const;

export const HOME_QUIZ_OPTIONS = [
  "Üniversitede",
  "Ortak arkadaşta",
  "Bir kafede",
  "Tatilde",
] as const;

export const HOME_LEADERBOARD = [
  { rank: 1, name: "Ayşe Y." },
  { rank: 2, name: "Mehmet K." },
  { rank: 3, name: "Zeynep A." },
] as const;

export const HOME_PROOF_STATS = [
  { value: "1.248", label: "Anı mesajı" },
  { value: "832", label: "Paylaşılan fotoğraf" },
  { value: "346", label: "Quiz katılımcısı" },
  { value: "5.0", label: "Misafir memnuniyeti" },
] as const;

export const HOME_PACKAGES = [
  {
    id: "basic" as const,
    name: "Başlangıç",
    price: "2.490₺",
    featured: false,
    features: [
      "Ücretsiz dijital davetiye",
      "NFC magnet seçeneği",
      "Anı ağacı",
      "Temel quiz",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: "4.490₺",
    featured: true,
    badge: "En Popüler",
    features: [
      "Ücretsiz dijital davetiye",
      "NFC magnet veya anahtarlık",
      "Gelişmiş anı ağacı",
      "Fotoğraf/video yükleme",
      "Quiz + leaderboard",
    ],
  },
  {
    id: "luxury" as const,
    name: "Luxury",
    price: "7.990₺",
    featured: false,
    features: [
      "Özel tasarım çift sayfası",
      "Premium NFC ürünler",
      "Gelişmiş anı ağacı",
      "Galeri + quiz + playlist",
      "Öncelikli destek",
    ],
  },
] as const;

export const DEFAULT_DEMO_SLUG = "mert-irem";

export function getDemoHref(demos: HomeDemoCouple[]): string {
  return `/${demos[0]?.slug ?? DEFAULT_DEMO_SLUG}`;
}
