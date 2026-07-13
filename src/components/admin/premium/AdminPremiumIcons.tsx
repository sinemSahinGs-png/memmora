import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ICON_BASE = "admin-premium-icon shrink-0";

function AdminIcon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      className={cn(ICON_BASE, className)}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconLeaf({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M12 3c-1.2 3.5-4 6.5-8 8 3.5 1 6.5 4 8 8 1.2-3.5 4-6.5 8-8-3.5-1-6.5-4-8-8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconMedia({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10l4 2.5L10 15V10z" fill="currentColor" />
    </AdminIcon>
  );
}

/** CTA — gallery / play */
export function IconMediaPremium({ className }: { className?: string }) {
  return (
    <AdminIcon className={cn("admin-premium-icon--cta", className)}>
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <circle cx="8.5" cy="9.5" r="1.35" fill="currentColor" />
      <path
        d="M13.5 8.8l3.2 2-3.2 2V8.8z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.35"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconExternal({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M14 5h5M14 5v5M14 5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14H5V5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

/** CTA — external link arrow */
export function IconExternalPremium({ className }: { className?: string }) {
  return (
    <AdminIcon className={cn("admin-premium-icon--cta", className)}>
      <path
        d="M8 16H5a1.5 1.5 0 01-1.5-1.5V5A1.5 1.5 0 015 3.5h9.5A1.5 1.5 0 0116 5v3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 5h5v5M16 5l-7 7"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconLink({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M10 14a3.5 3.5 0 004.95 0l2.12-2.12a3.5 3.5 0 00-4.95-4.95L11 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 10a3.5 3.5 0 00-4.95 0L6.93 12.12a3.5 3.5 0 004.95 4.95L13 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </AdminIcon>
  );
}

export function IconSettings({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </AdminIcon>
  );
}

export function IconChevron({ className }: { className?: string }) {
  return (
    <AdminIcon className={cn("admin-premium-icon--sm", className)}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </AdminIcon>
  );
}

export function IconDownload({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M12 4v10M8 10l4 4 4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconGrid({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <rect x="4" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </AdminIcon>
  );
}

export function IconQuiz({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.5 9a2.5 2.5 0 014.5 1.5c0 1.5-2 1.5-2 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r=".75" fill="currentColor" />
    </AdminIcon>
  );
}

/** CTA — envelope / e-davetiye */
export function IconEnvelopePremium({ className }: { className?: string }) {
  return (
    <AdminIcon className={cn("admin-premium-icon--cta", className)}>
      <path
        d="M5 8.5l7 4.5 7-4.5M5 8.5V17a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0020 17V8.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 8.5l7-4 7 4"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconRsvp({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M6 8.5h12M6 12h8M6 15.5h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 5V3.8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </AdminIcon>
  );
}

export function IconHome({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}

export function IconMessage({ className }: { className?: string }) {
  return (
    <AdminIcon className={className}>
      <path
        d="M5 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H5V6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </AdminIcon>
  );
}
