"use client";

import { useMemo, useState } from "react";
import type { Couple } from "@/lib/types";
import type { CoupleAftermovie } from "@/lib/aftermovie/types";
import { AftermoviePlayer } from "./AftermoviePlayer";
import {
  AftermovieSlideshow,
  mediaItemsToSlides,
} from "./AftermovieSlideshow";
import { DEFAULT_AFTER_MUSIC } from "./AftermovieBgm";
import { getCoupleDisplayTitle } from "@/lib/couple-utils";
import {
  getAftermoviePlaybackPath,
  getAftermoviePosterPath,
  hasPlayableFinalVideo,
  isSlideshowFilm,
} from "@/lib/aftermovie/lifecycle";

interface PostWeddingExperienceProps {
  couple: Couple;
  aftermovie: CoupleAftermovie;
}

export function PostWeddingExperience({
  couple,
  aftermovie,
}: PostWeddingExperienceProps) {
  const [completed, setCompleted] = useState(false);
  const title = getCoupleDisplayTitle(couple);
  const poster = useMemo(() => {
    if (aftermovie.finalPosterUrl) return aftermovie.finalPosterUrl;
    return getAftermoviePosterPath(couple.slug);
  }, [aftermovie.finalPosterUrl, couple.slug]);

  const useSlideshow =
    isSlideshowFilm(aftermovie) || !hasPlayableFinalVideo(aftermovie);

  const slides = useMemo(
    () => mediaItemsToSlides(aftermovie.media, couple.slug),
    [aftermovie.media, couple.slug],
  );

  const playbackSrc = useMemo(
    () => aftermovie.finalVideoUrl || getAftermoviePlaybackPath(couple.slug),
    [aftermovie.finalVideoUrl, couple.slug],
  );

  const musicUrl =
    aftermovie.music?.fileUrl?.trim() || DEFAULT_AFTER_MUSIC;
  const dateLabel = couple.weddingDate
    ? new Date(
        couple.weddingDate.includes("T")
          ? couple.weddingDate
          : `${couple.weddingDate}T12:00:00`,
      ).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="post-wedding">
      <section className="post-wedding__hero" id="aftermovie">
        <p className="post-wedding__eyebrow">MEMOORA AFTER</p>
        <h1 className="post-wedding__headline">
          Hikâyeniz şimdi
          <br />
          film oldu.
        </h1>
        <p className="post-wedding__names">
          {title}
          {dateLabel ? ` — ${dateLabel}` : ""}
        </p>

        {useSlideshow ? (
          <AftermovieSlideshow
            slides={slides}
            title={title}
            openingText={aftermovie.openingText}
            closingText={aftermovie.closingText}
            weddingDateLabel={dateLabel}
            durationPreset={aftermovie.durationPreset}
            musicUrl={musicUrl}
            posterUrl={poster}
            showArchiveLinks={false}
            autoStartMusic
            onComplete={() => setCompleted(true)}
          />
        ) : (
          <AftermoviePlayer
            src={playbackSrc}
            poster={poster}
            title={`${title} — Memoora After`}
            autoPlayMuted
            onComplete={() => setCompleted(true)}
          />
        )}

        {completed ? (
          <p className="post-wedding__closing">Anılar yaşamaya devam ediyor.</p>
        ) : null}
      </section>
    </div>
  );
}
