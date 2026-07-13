import type { Couple, CoupleSettingsInput } from "./types";
import { formatDisplayDate } from "./mock-data";
import type { LandingTimelineItem } from "./hero-config";

export function coupleToSettingsInput(couple: Couple): CoupleSettingsInput {
  return {
    groomName: couple.groomName,
    brideName: couple.brideName,
    displayTitle: couple.displayTitle,
    slug: couple.slug,
    weddingDate: couple.weddingDate,
    heroSubtitle: couple.heroSubtitle,
    heroVideoUrl: couple.heroVideoUrl,
    quizEnabled: couple.quizEnabled,
    quizWinnerName: couple.quizWinnerName ?? "",
    playlistTitle: couple.playlistTitle,
    playlistArtist: couple.playlistArtist,
    playlistUrl: couple.playlistUrl,
    brideEmail: couple.brideEmail,
    groomEmail: couple.groomEmail,
    driveFolderUrl: couple.driveFolderUrl,
    mediaUploadEnabled: couple.mediaUploadEnabled,
    couplePhotoUrl: couple.couplePhotoUrl ?? "",
    adminPin: couple.adminPin ?? "",
    status: couple.status,
    invitationEnabled: couple.invitationEnabled,
    invitationTitle: couple.invitationTitle,
    invitationMessage: couple.invitationMessage,
    venueName: couple.venueName,
    venueAddress: couple.venueAddress,
    venueMapsUrl: couple.venueMapsUrl,
    weddingTime: couple.weddingTime,
    rsvpEnabled: couple.rsvpEnabled,
    rsvpDeadline: couple.rsvpDeadline,
    maxGuestCount: couple.maxGuestCount,
  };
}

export interface InviteVenueInfo {
  name: string;
  address: string;
  mapsUrl: string;
}

/** Returns venue details for the invite top bar when name or address is set. */
export function getInviteVenueInfo(
  couple: Pick<Couple, "venueName" | "venueAddress" | "venueMapsUrl">
): InviteVenueInfo | null {
  const name = couple.venueName.trim();
  const address = couple.venueAddress.trim();
  if (!name && !address) return null;

  return {
    name,
    address,
    mapsUrl: couple.venueMapsUrl.trim(),
  };
}

export function getCoupleDisplayTitle(couple: Couple): string {
  if (couple.displayTitle?.trim()) return couple.displayTitle.trim();
  if (couple.groomName && couple.brideName) {
    return `${couple.groomName} & ${couple.brideName}`;
  }
  return couple.names;
}

/** Split title into stacked hero lines — gelin üstte, damat altta */
export function getCoupleHeroLines(couple: Couple): string[] {
  const bride = couple.brideName?.trim();
  const groom = couple.groomName?.trim();
  if (bride && groom) return [bride, "&", groom];

  const title = getCoupleDisplayTitle(couple);
  const parts = title.split(/\s*&\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) return [parts[0], "&", parts[1]];
  return [title];
}

export type CoupleAdminTitleParts =
  | { mode: "couple"; firstName: string; secondName: string; accent: string }
  | { mode: "full"; title: string };

/** Admin panel hero — serif names with optional script accent */
export function getCoupleAdminTitleParts(couple: Couple): CoupleAdminTitleParts {
  const groom = couple.groomName?.trim();
  const bride = couple.brideName?.trim();

  if (groom && bride) {
    return {
      mode: "couple",
      firstName: groom,
      secondName: bride,
      accent: couple.heroSubtitle?.trim() || "daima birlikte",
    };
  }

  const title = getCoupleDisplayTitle(couple);
  const parts = title.split(/\s*&\s*/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    return {
      mode: "couple",
      firstName: parts[0],
      secondName: parts[1],
      accent: couple.heroSubtitle?.trim() || "daima birlikte",
    };
  }

  return { mode: "full", title };
}

export function buildTimelineFromCouple(couple: Couple): LandingTimelineItem[] {
  const title = getCoupleDisplayTitle(couple);
  const date = couple.weddingDate ? formatDisplayDate(couple.weddingDate) : undefined;

  return [
    {
      id: "couple",
      title,
      date,
      quote: "En güzel günümüz.",
      thumbnail: "couple",
    },
    {
      id: "life",
      title: "Yeni Bir Hayat",
      description: "Birlikte büyüyen anılarımız.",
      thumbnail: "leaf",
    },
    {
      id: "promise",
      title: "Sözümüz",
      date,
      quote: "Daima, her zaman.",
      thumbnail: "promise",
    },
  ];
}
