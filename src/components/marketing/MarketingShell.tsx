"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketingShellProps {
  children: ReactNode;
  landing?: boolean;
  demoSlug?: string;
}

function NavLeafIcon() {
  return (
    <svg viewBox="0 0 24 36" fill="none" aria-hidden className="memoora-nav-leaf-svg">
      <path
        d="M12 2C12 2 4 14 4 22C4 29 8 34 12 34C16 34 20 29 20 22C20 14 12 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M12 6V32" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export function MarketingShell({
  children,
  landing = false,
  demoSlug = "berkin-beste",
}: MarketingShellProps) {
  return (
    <div className={cn("marketing-site", landing && "marketing-site--landing")}>
      <header className={cn("marketing-nav", landing && "marketing-nav--landing")}>
        <div
          className={cn(
            "marketing-nav__inner",
            landing && "marketing-nav__inner--landing"
          )}
        >
          {landing ? (
            <>
              <Link href="/" className="memoora-nav-logo-left">
                MEMOORA
              </Link>

              <nav
                className="marketing-nav__center marketing-nav__center--landing"
                aria-label="Ana menü"
              >
                <Link href="/">Ana Sayfa</Link>
                <Link href="/pricing">Paketler</Link>
                <Link href="/#how-it-works">Nasıl Çalışır</Link>
                <Link href="/#demo">Demo</Link>
                <Link href="/#contact">İletişim</Link>
              </nav>

              <div className="memoora-nav-landing-actions">
                <button
                  type="button"
                  className="memoora-nav-hamburger"
                  aria-label="Menü"
                  onClick={() => {
                    document.getElementById("how-it-works")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <span />
                  <span />
                  <span />
                </button>

                <Link href="/" className="memoora-nav-logo-center">
                  <span className="memoora-nav-logo-center__star" aria-hidden>
                    ✦
                  </span>
                  <span>MEMOORA</span>
                </Link>

                <div className="memoora-nav-mobile-icons">
                  <Link href="/order" className="memoora-nav-icon-btn" aria-label="Hesabım">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                      <path
                        d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Link>
                  <Link href="/order" className="memoora-nav-icon-btn memoora-nav-icon-btn--cart" aria-label="Sipariş">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 7h15l-1.5 9h-12L6 7Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                      <path d="M6 7 5 4H3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <circle cx="9" cy="19" r="1.2" fill="currentColor" />
                      <circle cx="17" cy="19" r="1.2" fill="currentColor" />
                    </svg>
                  </Link>
                </div>

                <Link
                  href="/order"
                  className="marketing-nav__order marketing-nav__order--landing"
                >
                  Başlat
                </Link>

                <Link
                  href="/order"
                  className="memoora-nav-leaf-ring"
                  aria-label="Sipariş ver"
                >
                  <NavLeafIcon />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/" className="marketing-nav__brand">
                <span className="marketing-nav__leaf" aria-hidden>
                  ✦
                </span>
                Memoora
              </Link>
              <nav className="marketing-nav__links">
                <Link href="/pricing">Paketler</Link>
                <Link href="/order">Sipariş</Link>
                <Link href="/admin" className="marketing-nav__muted">
                  Yönetim
                </Link>
              </nav>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer className="marketing-footer">
        <p className="marketing-footer__brand font-serif">Memoora Wedding Tree</p>
        <p className="marketing-footer__tagline">
          Misafirlerinizin anıları dijital bir ağaca dönüşsün.
        </p>
        <div className="marketing-footer__links">
          <Link href="/pricing">Paketler</Link>
          <Link href="/order">Sipariş Oluştur</Link>
          <Link href="/admin">Super Admin</Link>
        </div>
        <p className="marketing-footer__copy">
          © {new Date().getFullYear()} Memoora · Kalıcı dijital hatıra
        </p>
      </footer>
    </div>
  );
}
