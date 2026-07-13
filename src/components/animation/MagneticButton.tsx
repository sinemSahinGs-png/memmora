"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function MagneticButton({
  href,
  children,
  className = "",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    gsap.to(el, { x, y, duration: 0.35, ease: "power2.out" });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.55, ease: "power3.out" });
  };

  return (
    <Link
      ref={ref}
      href={href}
      className={`cine-btn ${className}`.trim()}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span>{children}</span>
    </Link>
  );
}
