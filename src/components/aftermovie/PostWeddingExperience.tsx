"use client";

import { useMemo, useState } from "react";
import type { Couple } from "@/lib/types";
import type { CoupleAftermovie } from "@/lib/aftermovie/types";
import { AftermoviePlayer } from "./AftermoviePlayer";
import {
  AftermovieSlideshow,
  mediaItemsToSlides,
} from "./AftermovieSlideshow";
import {
  AftermovieBgm,
  DEFAULT_AFTER_MUSIC,
  resolveAftermovieMusicUrl,
} from "./AftermovieBgm";
import { FadeWords } from "./FadeWords";
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

  const musicUrl = resolveAftermovieMusicUrl(
    aftermovie.music?.fileUrl?.trim() || DEFAULT_AFTER_MUSIC,
  );

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
      <AftermovieBgm src={musicUrl} active />

      <section className="post-wedding__hero" id="aftermovie">
        <div className="post-wedding__copy">
          <FadeWords
            as="p"
            className="post-wedding__eyebrow"
            text="MEMOORA AFTER"
            startDelayMs={80}
            stepMs={100}
            slowOnMobile
          />
          <h1 className="post-wedding__headline">
            <FadeWords
              as="span"
              className="post-wedding__headline-line"
              text="Hikâyeniz şimdi"
              startDelayMs={280}
              stepMs={150}
              slowOnMobile
            />
            <br />
            <FadeWords
              as="span"
              className="post-wedding__headline-line"
              text="film oldu."
              startDelayMs={720}
              stepMs={170}
              slowOnMobile
            />
          </h1>
          <div className="post-wedding__names">
            <FadeWords
              as="p"
              className="post-wedding__names-title"
              text={title}
              startDelayMs={1100}
              stepMs={190}
              slowOnMobile
            />
          </div>
        </div>

        {useSlideshow ? (
          <AftermovieSlideshow
            slides={slides}
            title={title}
            openingText={aftermovie.openingText}
            closingText={aftermovie.closingText}
            weddingDateLabel={dateLabel}
            durationPreset={aftermovie.durationPreset}
            musicUrl={null}
            posterUrl={poster}
            showArchiveLinks={false}
            autoStartMusic={false}
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
          <FadeWords
            as="p"
            className="post-wedding__closing"
            text="Anılar yaşamaya devam ediyor."
            startDelayMs={80}
            stepMs={140}
            slowOnMobile
          />
        ) : null}
      </section>
    </div>
  );
}
