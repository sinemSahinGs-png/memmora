"use client";

import { useState } from "react";
import { MIRROR_FRAME_SRC } from "@/lib/memory-garden-config";
import { cn } from "@/lib/utils";

interface MirrorFrameProps {
  children: React.ReactNode;
  successPulse?: boolean;
  className?: string;
  /** Override frame PNG (default: memory mirror asset) */
  frameSrc?: string;
  /** Extra class on the inner photo/content inset */
  insetClassName?: string;
}

export function MirrorFrame({
  children,
  successPulse = false,
  className,
  frameSrc = MIRROR_FRAME_SRC,
  insetClassName,
}: MirrorFrameProps) {
  const [frameError, setFrameError] = useState(false);

  return (
    <div
      className={cn(
        "mirror-frame-wrap",
        successPulse && "mirror-frame-wrap--success",
        className
      )}
    >
      <div className={cn("mirror-form-inset", insetClassName)}>{children}</div>

      {!frameError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frameSrc}
          alt=""
          className="mirror-frame-img"
          onError={() => {
            console.warn(
              "[Memoora] mirror frame PNG yüklenemedi — CSS frame fallback."
            );
            setFrameError(true);
          }}
        />
      ) : (
        <div className="mirror-frame-fallback" aria-hidden />
      )}
    </div>
  );
}
