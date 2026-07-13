"use client";

import type { ReactNode } from "react";
import { AdminPremiumLeafAmbient } from "./AdminPremiumLeafAmbient";

export function AdminPremiumShell({ children }: { children: ReactNode }) {
  return (
    <div className="memoora-premium-admin">
      <div className="memoora-premium-admin__ambient" aria-hidden />
      <div className="memoora-premium-admin__botanical" aria-hidden />
      <div className="memoora-premium-admin__ambient-glow" aria-hidden />
      <main className="memoora-premium-admin__main">
        <AdminPremiumLeafAmbient />
        <div className="memoora-premium-admin__content">{children}</div>
      </main>
    </div>
  );
}
