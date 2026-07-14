"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#davetiye", label: "Davetiye" },
  { href: "#quiz", label: "Quiz" },
  { href: "#nfc-urunler", label: "NFC Ürünler" },
  { href: "#demo", label: "Demo" },
] as const;

interface HomeNavbarProps {
  demoHref: string;
}

export function HomeNavbar({ demoHref }: HomeNavbarProps) {
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const updateNavState = useCallback(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    setPastHero(rect.bottom <= 72);
  }, []);

  useEffect(() => {
    updateNavState();

    const lenis = window.__lenis;
    if (lenis) {
      lenis.on("scroll", updateNavState);
      return () => {
        lenis.off("scroll", updateNavState);
      };
    }

    window.addEventListener("scroll", updateNavState, { passive: true });
    return () => window.removeEventListener("scroll", updateNavState);
  }, [updateNavState]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;

    event.preventDefault();
    setMenuOpen(false);

    const target = document.querySelector(href);
    if (!target || !(target instanceof HTMLElement)) return;

    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -72 });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        className={`home-nav${pastHero ? " home-nav--solid" : ""}`}
        data-past-hero={pastHero}
      >
        <div className="home-nav__inner">
          <Link
            href="/"
            className="home-nav__logo"
            onClick={() => setMenuOpen(false)}
          >
            MEMOORA
          </Link>

          <nav className="home-nav__links" aria-label="Ana menü">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href === "#demo" ? demoHref : link.href}
                className="home-nav__link"
                onClick={(event) =>
                  handleAnchorClick(
                    event,
                    link.href === "#demo" ? demoHref : link.href,
                  )
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            className={`home-nav__toggle${menuOpen ? " home-nav__toggle--open" : ""}`}
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`home-nav__drawer${menuOpen ? " home-nav__drawer--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="home-nav__backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setMenuOpen(false)}
        />
        <nav className="home-nav__drawer-nav" aria-label="Mobil menü">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href === "#demo" ? demoHref : link.href}
              onClick={(event) =>
                handleAnchorClick(
                  event,
                  link.href === "#demo" ? demoHref : link.href,
                )
              }
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
