"use client";

import { motion } from "framer-motion";
import type { PlaylistTrack } from "@/lib/types";

interface PlaylistPreviewProps {
  track: PlaylistTrack | null;
}

function VinylDisc() {
  return (
    <div className="music-vinyl" aria-hidden>
      <div className="music-vinyl-inner" />
      <div className="music-vinyl-hole" />
    </div>
  );
}

function Waveform() {
  return (
    <div className="music-waveform" aria-hidden>
      {[3, 5, 8, 4, 7, 5, 9, 4, 6, 3].map((h, i) => (
        <span key={i} style={{ height: `${h * 2}px` }} />
      ))}
    </div>
  );
}

export function PlaylistPreview({ track }: PlaylistPreviewProps) {
  if (!track) return null;

  const hasUrl = Boolean(track.url?.trim());

  return (
    <section id="playlist" className="scroll-mt-4 px-5 pb-8 pt-2">
      <motion.div
        className="bonus-card bonus-card--music"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.22 }}
      >
        <div className="flex gap-4">
          <VinylDisc />
          <div className="min-w-0 flex-1">
            <p className="bonus-card-label">Onların Şarkısı</p>
            <h2 className="bonus-card-title truncate">{track.title}</h2>
            <p className="bonus-card-sub truncate">{track.artist}</p>
            <Waveform />
          </div>
          {track.duration && (
            <span className="shrink-0 self-start pt-6 text-[10px] text-[#9AA89B]/80">
              {track.duration}
            </span>
          )}
        </div>
        {hasUrl ? (
          <motion.a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn-secondary music-listen-btn mt-5 flex w-full items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            Dinle
          </motion.a>
        ) : (
          <button
            type="button"
            className="premium-btn-secondary music-listen-btn mt-5 w-full opacity-45"
            disabled
          >
            Dinle
          </button>
        )}
      </motion.div>
    </section>
  );
}
