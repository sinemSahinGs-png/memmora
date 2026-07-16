import type { ReactNode } from "react";
import "./admin.css";
import "../../aftermovie.css";

export default function CoupleAdminLayout({ children }: { children: ReactNode }) {
  return <div className="memoora-premium-admin-route">{children}</div>;
}
