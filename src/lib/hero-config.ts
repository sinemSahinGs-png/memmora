import { ASSETS } from "./assets";

export const DEFAULT_HERO_VIDEO_SRC = ASSETS.heroVideo;

export type TimelineThumbnail = "couple" | "leaf" | "promise";

export interface LandingTimelineItem {
  id: string;
  title: string;
  date?: string;
  quote?: string;
  description?: string;
  thumbnail: TimelineThumbnail;
}
