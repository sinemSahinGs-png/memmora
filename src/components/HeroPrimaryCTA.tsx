"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PremiumLeafIcon } from "@/components/icons/PremiumLeafIcon";
import { cn } from "@/lib/utils";

interface HeroPrimaryCTAProps {
  href?: string;
  onClick?: () => void;
  className?: string;
}

const motionTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const };

function CTAContent() {
  return (
    <>
      <span className="premium-cta-shimmer" aria-hidden />
      <PremiumLeafIcon
        variant="cta"
        className="premium-cta-icon h-[20px] w-[15px] transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-8 group-hover:-translate-y-px"
      />
      <span className="relative z-10">Anı Bırak</span>
    </>
  );
}

export function HeroPrimaryCTA({ href, onClick, className }: HeroPrimaryCTAProps) {
  if (onClick) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className={cn("premium-cta group", className)}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.97 }}
        transition={motionTransition}
      >
        <CTAContent />
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={motionTransition}
      className={cn("inline-block", className && "w-full")}
    >
      <Link href={href ?? "#memory"} className={cn("premium-cta group", className)}>
        <CTAContent />
      </Link>
    </motion.div>
  );
}
