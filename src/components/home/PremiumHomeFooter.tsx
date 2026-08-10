import Link from "next/link";

const EXPERIENCE_LINKS = [
  { href: "#deneyim-ozet", label: "Deneyim" },
  { href: "#davetiye", label: "Dijital Davetiye" },
  { href: "#quiz", label: "Quiz" },
  { href: "#shared-memories", label: "Hatıralar" },
  { href: "#memoora-after", label: "Memoora After" },
] as const;

const META_LINKS = [
  { href: "https://instagram.com", label: "Instagram", external: true as const },
  { href: "mailto:hello@memoora.com", label: "İletişim", external: true as const },
  { href: "/gizlilik", label: "Gizlilik", external: false as const },
  { href: "/cerezler", label: "Çerezler", external: false as const },
] as const;

export function PremiumHomeFooter() {
  return (
    <footer id="site-footer" className="home-footer">
      <div className="home-footer__rule" aria-hidden />
      <div className="home-footer__inner cine-container">
        <div className="home-footer__brand-block">
          <p className="home-footer__brand">MEMOORA</p>
          <p className="home-footer__tagline">
            Bir gece için değil.
            <br />
            Hatırlamak için.
          </p>
        </div>

        <nav className="home-footer__nav" aria-label="Deneyim">
          {EXPERIENCE_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="home-footer__meta" aria-label="Kurumsal">
          {META_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <p className="home-footer__copy">© 2026 Memoora</p>
      </div>
    </footer>
  );
}
