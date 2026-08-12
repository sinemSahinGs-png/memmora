import Link from "next/link";
import { LEGAL_COMPANY } from "@/lib/legal/company";

const EXPERIENCE_LINKS = [
  { href: "#deneyim-ozet", label: "Deneyim" },
  { href: "#davetiye", label: "Dijital Davetiye" },
  { href: "#quiz", label: "Quiz" },
  { href: "#shared-memories", label: "Hat\u0131ralar" },
  { href: "#memoora-after", label: "Memoora After" },
] as const;

const META_LINKS = [
  { href: "/iletisim", label: "\u0130leti\u015fim" },
  { href: "/teslimat-ve-kargo", label: "Teslimat & kargo" },
  {
    href: "/mesafeli-satis-sozlesmesi",
    label: "Sat\u0131\u015f s\u00f6zle\u015fmesi",
  },
  { href: "/iptal-ve-iade", label: "\u0130ptal & iade" },
  { href: "/gizlilik", label: "Gizlilik" },
  { href: "/cerezler", label: "\u00c7erezler" },
] as const;

export function PremiumHomeFooter() {
  const phoneHref = LEGAL_COMPANY.phone.replace(/\s/g, "");

  return (
    <footer id="site-footer" className="home-footer">
      <div className="home-footer__rule" aria-hidden />
      <div className="home-footer__inner cine-container">
        <div className="home-footer__brand-block">
          <p className="home-footer__brand">MEMOORA</p>
          <p className="home-footer__tagline">
            {"Bir gece i\u00e7in de\u011fil."}
            <br />
            {"Hat\u0131rlamak i\u00e7in."}
          </p>

          <div className="home-footer__contact">
            <Link href="/iletisim" className="home-footer__contact-label">
              {"\u0130leti\u015fim"}
            </Link>
            <a
              className="home-footer__contact-link"
              href={`mailto:${LEGAL_COMPANY.email}`}
            >
              {LEGAL_COMPANY.email}
            </a>
            {LEGAL_COMPANY.phone ? (
              <a
                className="home-footer__contact-link"
                href={`tel:${phoneHref}`}
              >
                {LEGAL_COMPANY.phone}
              </a>
            ) : null}
          </div>
        </div>

        <nav className="home-footer__nav" aria-label="Deneyim">
          {EXPERIENCE_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <nav className="home-footer__meta" aria-label="Kurumsal">
          {META_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="home-footer__copy">{"\u00a9 2026 Memoora"}</p>
      </div>
    </footer>
  );
}
