"use client";

import { useEffect, useRef, useState } from "react";

interface AftermoviePlayerProps {
  src: string;
  poster?: string | null;
  title: string;
  onComplete?: () => void;
  onContinueToMemories?: () => void;
  autoPlayMuted?: boolean;
}

export function AftermoviePlayer({
  src,
  poster,
  title,
  onComplete,
  onContinueToMemories,
  autoPlayMuted = false,
}: AftermoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlayMuted) return;
    video.muted = true;
    void video.play().then(() => setPlaying(true)).catch(() => undefined);
  }, [autoPlayMuted, src]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setError(true);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const unmute = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    if (video.paused) {
      await video.play().catch(() => undefined);
      setPlaying(true);
    }
  };

  const requestFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen();
  };

  const replay = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    await video.play().catch(() => undefined);
    setPlaying(true);
  };

  return (
    <div className="aftermovie-player">
      <video
        ref={videoRef}
        className="aftermovie-player__video"
        src={src}
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        muted={muted}
        onLoadedData={() => setReady(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration) return;
          setProgress(v.currentTime / v.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onComplete?.();
        }}
        onError={() => setError(true)}
        aria-label={title}
      />

      {!ready && !error ? (
        <div className="aftermovie-player__loading">Film hazırlanıyor…</div>
      ) : null}

      {error ? (
        <div className="aftermovie-player__error" role="alert">
          <p>
            Film şu anda oynatılamıyor. Anılarınızı keşfetmeye devam
            edebilirsiniz.
          </p>
          <a
            href="#gallery"
            className="aftermovie-player__fallback-cta"
            onClick={(e) => {
              onContinueToMemories?.();
              // allow default hash navigation
              void e;
            }}
          >
            Anılara Devam Et
          </a>
        </div>
      ) : null}

      <div className="aftermovie-player__controls">
        <button type="button" onClick={() => void togglePlay()} aria-label={playing ? "Duraklat" : "Oynat"}>
          {playing ? "Duraklat" : "Filmi İzle"}
        </button>
        <button type="button" onClick={() => void unmute()} aria-label="Sesi aç">
          {muted ? "Sesi Aç" : "Ses Açık"}
        </button>
        <button type="button" onClick={requestFullscreen} aria-label="Tam ekran">
          Tam Ekran
        </button>
        <button type="button" onClick={() => void replay()} aria-label="Yeniden izle">
          Yeniden
        </button>
        <div className="aftermovie-player__progress" aria-hidden>
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
