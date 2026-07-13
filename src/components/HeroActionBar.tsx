"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroPrimaryCTA } from "./HeroPrimaryCTA";

interface HeroActionBarProps {
  coupleSlug: string;
  quizEnabled: boolean;
  onMemoryClick?: () => void;
}

export function HeroActionBar({
  coupleSlug,
  quizEnabled,
  onMemoryClick,
}: HeroActionBarProps) {
  return (
    <div className="hero-action-bar">
      <div className="hero-action-bar-inner">
        <HeroPrimaryCTA
          href={onMemoryClick ? undefined : `/${coupleSlug}#memory`}
          onClick={onMemoryClick}
          className="hero-action-primary"
        />
        {quizEnabled && (
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/${coupleSlug}/quiz`} className="hero-action-secondary">
              Quiz&apos;e Katıl
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
