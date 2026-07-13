"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function GoldButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: GoldButtonProps) {
  const base =
    "relative inline-flex items-center justify-center px-8 py-3.5 text-sm tracking-[0.2em] uppercase font-medium transition-colors duration-500 rounded-full overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-champagne/90 to-gold-glow/80 text-deep-black hover:from-gold-glow hover:to-champagne shadow-[0_0_40px_rgba(212,175,55,0.25)]",
    secondary:
      "bg-transparent text-champagne border border-champagne/40 hover:border-champagne/70 hover:bg-champagne/5",
  };

  const content = (
    <motion.span
      className={cn(base, variants[variant], className)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 gold-shimmer opacity-0 hover:opacity-100 transition-opacity duration-700" />
      )}
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn("block w-full", disabled && "pointer-events-none opacity-50")}
    >
      {content}
    </button>
  );
}
