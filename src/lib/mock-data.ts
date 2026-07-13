import type { Couple, PlaylistTrack, QuizQuestion } from "./types";
import {
  BRAND_NAME,
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_VIDEO,
  DEFAULT_INVITATION_MESSAGE,
} from "./supabase/constants";

const MOCK_COUPLES: Couple[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "mert-irem",
    names: "Mert & İrem",
    brideName: "İrem",
    groomName: "Mert",
    displayTitle: "Mert & İrem",
    brandName: BRAND_NAME,
    weddingDate: "2026-06-06",
    heroSubtitle: DEFAULT_HERO_SUBTITLE,
    heroVideoUrl: DEFAULT_HERO_VIDEO,
    quizEnabled: true,
    quizWinnerName: null,
    playlistTitle: "Iris",
    playlistArtist: "Goo Goo Dolls",
    playlistUrl: "",
    status: "active",
    packageType: "premium",
    leafCount: 0,
    brideEmail: "",
    groomEmail: "",
    driveFolderUrl: "",
    mediaUploadEnabled: true,
    memoriesGalleryEnabled: true,
    couplePhotoUrl: "",
    adminPin: "0606",
    invitationEnabled: true,
    invitationTitle: "",
    invitationMessage: DEFAULT_INVITATION_MESSAGE,
    venueName: "",
    venueAddress: "",
    venueMapsUrl: "",
    weddingTime: "",
    rsvpEnabled: true,
    rsvpDeadline: "",
    maxGuestCount: 5,
    tagline: DEFAULT_HERO_SUBTITLE,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "berkin-beste",
    names: "Berkin & Beste",
    brideName: "Beste",
    groomName: "Berkin",
    displayTitle: "Berkin & Beste",
    brandName: BRAND_NAME,
    weddingDate: "2026-06-06",
    heroSubtitle: DEFAULT_HERO_SUBTITLE,
    heroVideoUrl: DEFAULT_HERO_VIDEO,
    quizEnabled: true,
    quizWinnerName: null,
    playlistTitle: "At Last",
    playlistArtist: "Etta James",
    playlistUrl: "",
    status: "active",
    packageType: "premium",
    leafCount: 0,
    brideEmail: "",
    groomEmail: "",
    driveFolderUrl: "",
    mediaUploadEnabled: true,
    memoriesGalleryEnabled: true,
    couplePhotoUrl: "",
    adminPin: "0606",
    invitationEnabled: true,
    invitationTitle: "",
    invitationMessage: DEFAULT_INVITATION_MESSAGE,
    venueName: "",
    venueAddress: "",
    venueMapsUrl: "",
    weddingTime: "",
    rsvpEnabled: true,
    rsvpDeadline: "",
    maxGuestCount: 5,
    tagline: DEFAULT_HERO_SUBTITLE,
  },
];

/** Fallback when Supabase is not configured */
export const MOCK_COUPLE = MOCK_COUPLES[0];

export const MOCK_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "Mert ve İrem ilk nerede tanıştı?",
    options: [
      "Karaköy'de bir galeride",
      "Kadıköy'de bir kafede",
      "Zorlu'da bir konserde",
      "Ortak bir arkadaşın yemeğinde",
    ],
    correctIndex: 0,
  },
];

export const MOCK_PLAYLIST: PlaylistTrack[] = [
  { id: "t1", title: "Iris", artist: "Goo Goo Dolls", duration: "4:19" },
];

/** Demo guest messages for hero floating bubbles */
export const MOCK_BUBBLE_MEMORIES = [
  {
    id: "mock-bubble-1",
    guest_name: "Ayşe",
    message: "Hayatınız boyunca mutluluğunuz daim olsun. Harika bir gün!",
  },
  {
    id: "mock-bubble-2",
    guest_name: "Can",
    message: "İkinizi bir arada görmek ne kadar güzel. Sonsuz sevgiler.",
  },
  {
    id: "mock-bubble-3",
    guest_name: "Elif",
    message: "Bu ağaca bir yaprak daha: sizin için en güzel dileklerim.",
  },
  {
    id: "mock-bubble-4",
    guest_name: "Murat",
    message: "Düğününüz muhteşemdi. Birlikte nice yıllara!",
  },
  {
    id: "mock-bubble-5",
    guest_name: "Zeynep",
    message: "Gözlerinizdeki mutluluk her şeyi anlatıyor. Tebrikler!",
  },
  {
    id: "mock-bubble-6",
    guest_name: "Emre",
    message: "Aşkınız bize ilham veriyor. Hep birlikte kutlayalım.",
  },
  {
    id: "mock-bubble-7",
    guest_name: "Selin",
    message: "Bugün çok duygulandım. Yeni yolculuğunuz kutlu olsun.",
  },
  {
    id: "mock-bubble-8",
    guest_name: "Burak",
    message: "En güzel anılarınız bu ağaçta yeşersin.",
  },
  {
    id: "mock-bubble-9",
    guest_name: "Deniz",
    message: "Kalpleriniz bir, gülüşünüz bir. Nice mutlu yıllara!",
  },
  {
    id: "mock-bubble-10",
    guest_name: "Cem",
    message: "Sizin için bu gece unutulmazdı. Sevgiyle kucaklıyorum.",
  },
] as const;

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getMockCoupleBySlug(slug: string): Couple | undefined {
  const found = MOCK_COUPLES.find((c) => c.slug === slug);
  return found ? { ...found } : undefined;
}

export function coupleToPlaylistTrack(couple: Couple): PlaylistTrack | null {
  if (!couple.playlistTitle.trim()) return null;
  return {
    id: `playlist-${couple.id}`,
    title: couple.playlistTitle,
    artist: couple.playlistArtist || "—",
    duration: "",
    url: couple.playlistUrl || undefined,
  };
}
