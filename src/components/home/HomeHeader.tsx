"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LeafIcon } from "./home-icons";

const DRAWER_LINKS = [
  { href: "#how-it-works", label: "Nasıl Çalışır" },
  { href: "#packages", label: "Paketler" },
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/order", label: "Sipariş Ver" },
] as const;

export function HomeHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <header className="mh-header">
        <div className="mh-header__inner">
          <div className="mh-header__left">
            <button
              type="button"
              className="mh-hamburger"
              aria-label={drawerOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <Link href="/" className="mh-header__logo">
            <LeafIcon />
            <span>MEMOORA</span>
          </Link>

          <div className="mh-header__right" aria-hidden />
        </div>
      </header>

      <div
        className={`mh-drawer${drawerOpen ? " mh-drawer--open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className="mh-drawer__backdrop"
          aria-label="Menüyü kapat"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={closeDrawer}
        />
        <div className="mh-drawer__panel">
          <nav className="mh-drawer__nav" aria-label="Mobil menü">
            {DRAWER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeDrawer}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
