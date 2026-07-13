"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface PremiumLeafIconProps {
  className?: string;
  variant?: "cta" | "inline";
}

export function PremiumLeafIcon({
  className,
  variant = "inline",
}: PremiumLeafIconProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `premium-leaf-${uid}`;

  return (
    <svg
      viewBox="0 0 24 32"
      fill="none"
      aria-hidden
      className={cn(
        variant === "cta" && "premium-leaf-icon--cta",
        className
      )}
    >
      <defs>
        <linearGradient id={gradId} x1="18%" y1="0%" x2="84%" y2="92%">
          <stop offset="0%" stopColor="#fff4d0" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7a9268" />
        </linearGradient>
      </defs>

      <path
        d="M12 27.5V30.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M12 1.8
          C7.6 6.8 5.2 11.6 5.5 16.8
          C5.7 20.8 7.6 24.4 10.2 26.6
          C11.1 27.4 11.7 28 12 28.4
          C12.3 28 12.9 27.4 13.8 26.6
          C16.4 24.4 18.3 20.8 18.5 16.8
          C18.8 11.6 16.4 6.8 12 1.8Z"
        fill={`url(#${gradId})`}
        stroke="rgba(255, 236, 180, 0.45)"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.5V26.5"
        stroke="rgba(72, 54, 18, 0.38)"
        strokeWidth="0.65"
        strokeLinecap="round"
      />
      <path
        d="M12 8.5C9.4 9.6 7.8 11.4 7 13.6"
        stroke="rgba(72, 54, 18, 0.32)"
        strokeWidth="0.45"
        strokeLinecap="round"
      />
      <path
        d="M12 8.5C14.6 9.6 16.2 11.4 17 13.6"
        stroke="rgba(72, 54, 18, 0.32)"
        strokeWidth="0.45"
        strokeLinecap="round"
      />
      <path
        d="M12 13.5C9.2 14.8 7.4 17 6.6 19.8"
        stroke="rgba(72, 54, 18, 0.26)"
        strokeWidth="0.4"
        strokeLinecap="round"
      />
      <path
        d="M12 13.5C14.8 14.8 16.6 17 17.4 19.8"
        stroke="rgba(72, 54, 18, 0.26)"
        strokeWidth="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
