import { notFound } from "next/navigation";
import { CoupleMemoryWorld } from "@/components/CoupleMemoryWorld";
import { CoupleStatusNotice } from "@/components/CoupleStatusNotice";
import { resolveCoupleForPage } from "@/lib/supabase/couples";
import { fetchCoupleAftermovie } from "@/lib/supabase/aftermovie";
import {
  getGlobalAftermovieMusic,
} from "@/lib/aftermovie/global-music";
import {
  isAftermoviePubliclyAvailable,
  isSlideshowFilm,
  resolveCoupleLifecycleMode,
  toPublicAftermovie,
} from "@/lib/aftermovie/lifecycle";
import type { CoupleAftermovie } from "@/lib/aftermovie/types";
import { getMediaViewUrl } from "@/lib/admin-media-urls";
import "@/app/aftermovie.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);
  if (!couple) return { title: "Bulunamadı" };
  return {
    title: `${couple.names} — Memoora`,
    description: couple.tagline,
  };
}

export default async function CouplePage({ params }: PageProps) {
  const { slug } = await params;
  const couple = await resolveCoupleForPage(slug);

  if (!couple) {
    notFound();
  }

  if (couple.deletedAt) {
    return (
      <CoupleStatusNotice displayTitle={couple.displayTitle} variant="deleted" />
    );
  }

  if (couple.status === "archived") {
    return (
      <CoupleStatusNotice displayTitle={couple.displayTitle} variant="archived" />
    );
  }

  let aftermovie = null;
  try {
    aftermovie = await fetchCoupleAftermovie(couple.id, {
      includePrivate: true,
    });
  } catch {
    aftermovie = null;
  }

  const lifecycle = resolveCoupleLifecycleMode({
    weddingDate: couple.weddingDate,
    aftermovie,
  });
  const postWedding = isAftermoviePubliclyAvailable(aftermovie);

  // Never serialize private production fields / mock film to the public client.
  let publicAftermovie: CoupleAftermovie | null = null;
  if (aftermovie) {
    if (postWedding) {
      const slideshow = isSlideshowFilm(aftermovie);
      let music = null;
      if (slideshow) {
        try {
          music = await getGlobalAftermovieMusic();
        } catch {
          music = null;
        }
      }
      const publicMedia = slideshow
        ? (aftermovie.media ?? []).map((m) => ({
            ...m,
            proxyUrl: getMediaViewUrl(m.mediaId, couple.slug),
          }))
        : undefined;

      publicAftermovie = {
        ...aftermovie,
        ...toPublicAftermovie(aftermovie),
        renderProvider: aftermovie.renderProvider,
        renderError: null,
        productionNotes: null,
        revisionNote: null,
        renderJobId: null,
        finalVideoStorageKey: null,
        finalPosterStorageKey: null,
        media: publicMedia,
        music: music
          ? {
              ...music,
              // Only expose playback URL; no license internals needed
              licenseSource: null,
              storageKey: null,
            }
          : null,
      } as CoupleAftermovie;
    } else {
      // Teaser may show publish date only — no video / private metadata.
      publicAftermovie = {
        ...aftermovie,
        finalVideoUrl: null,
        finalVideoStorageKey: null,
        finalPosterUrl: null,
        finalPosterStorageKey: null,
        renderError: null,
        productionNotes: null,
        revisionNote: null,
        renderJobId: null,
        media: undefined,
        music: null,
        approvedAt: null,
      } as CoupleAftermovie;
    }
  }

  return (
    <CoupleMemoryWorld
      couple={couple}
      initialLeafCount={couple.leafCount}
      acceptsMemories={couple.status === "active" && lifecycle !== "post_wedding"}
      aftermovie={publicAftermovie}
      lifecycle={lifecycle}
      postWeddingPublished={postWedding}
    />
  );
}
