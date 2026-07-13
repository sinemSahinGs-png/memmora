"use client";

import { ASSETS } from "@/lib/assets";
import { TreeIcon } from "./home-icons";
import { useState } from "react";

export function HomeHeroVisual() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="mh-hero__visual-wrap" aria-hidden>
      <div className="mh-hero__visual">
        <div className="mh-hero__visual-media">
          {videoFailed ? (
            <div className="mh-hero__fallback" />
          ) : (
            <video
              className="mh-hero-video__media"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
            >
              <source src={ASSETS.memooraHeroVideo} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      <div className="mh-hero__visual-mist" />

      {videoFailed && (
        <>
          <div className="mh-hero__fallback-chain" />
          <div className="mh-hero__fallback-tag">
            <span className="mh-hero__fallback-tag-brand">MEMOORA</span>
            <strong>NFC</strong>
            <span className="mh-hero__fallback-tag-icon">
              <TreeIcon />
            </span>
          </div>
        </>
      )}
    </div>
  );
}
