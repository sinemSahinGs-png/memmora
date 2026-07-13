"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  delay?: number;
  id?: string;
}

export function GlassCard({
  children,
  className,
  strong = false,
  delay = 0,
  id,
}: GlassCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl md:rounded-3xl p-8 md:p-10",
        strong ? "glass-panel-strong" : "glass-panel",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
