import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileAppShellProps {
  children: ReactNode;
  bottomNav?: ReactNode;
  /** Full viewport width — hero uses entire screen on desktop */
  fullWidth?: boolean;
  className?: string;
}

export function MobileAppShell({
  children,
  bottomNav,
  fullWidth = false,
  className,
}: MobileAppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen overflow-x-hidden",
        fullWidth ? "w-full bg-[#1a2822]" : "flex justify-center bg-[#1a2822]",
        className
      )}
    >
      <div
        className={cn(
          "relative min-h-screen overflow-x-hidden",
          fullWidth
            ? "w-full"
            : "w-full max-w-lg shadow-[0_0_60px_rgba(0,0,0,0.35)]"
        )}
      >
        {children}
        {bottomNav}
      </div>
    </div>
  );
}
