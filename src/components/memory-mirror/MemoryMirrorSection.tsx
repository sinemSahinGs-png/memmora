"use client";

import { useRef } from "react";
import { useGuestMemoryForm } from "@/hooks/useGuestMemoryForm";
import { useMemoryScrollScene } from "@/hooks/useMemoryScrollScene";
import { MemoryGardenBackground } from "./MemoryGardenBackground";
import { MirrorFrame } from "./MirrorFrame";
import { MirrorFormPanel } from "./MirrorFormPanel";

interface MemoryMirrorSectionProps {
  coupleId: string;
  coupleSlug: string;
  onSuccess?: () => void;
  acceptsMemories?: boolean;
}

export function MemoryMirrorSection({
  coupleId,
  coupleSlug,
  onSuccess,
  acceptsMemories = true,
}: MemoryMirrorSectionProps) {
  const form = useGuestMemoryForm({
    coupleId,
    coupleSlug,
    onSuccess,
  });

  const sectionRef = useRef<HTMLElement>(null);
  const { mirrorRef, hintRef, mistRef, goldGlowRef, entryBlendRef } =
    useMemoryScrollScene(sectionRef);

  return (
    <section
      id="memory"
      ref={sectionRef}
      className="memory-mirror-section scroll-mt-0"
    >
      <div className="memory-mirror-sticky">
        <MemoryGardenBackground />
        <div ref={mistRef} className="memory-garden-mist-shift" />
        <div ref={goldGlowRef} className="memory-garden-gold-glow" />
        <div ref={entryBlendRef} className="memory-section-entry-blend" />

        <div ref={hintRef} className="memory-scroll-hint">
          <span className="memory-scroll-hint-text">
            Anını bırakmak için kaydır
          </span>
        </div>

        <div ref={mirrorRef} className="memory-mirror-group">
          <MirrorFrame successPulse={form.successPulse}>
            <MirrorFormPanel form={form} disabled={!acceptsMemories} />
          </MirrorFrame>
        </div>
      </div>
    </section>
  );
}
