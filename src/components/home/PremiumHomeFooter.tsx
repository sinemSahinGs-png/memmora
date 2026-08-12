import Link from "next/link";
import { LEGAL_COMPANY } from "@/lib/legal/company";

const EXPERIENCE_LINKS = [
  { href: "#deneyim-ozet", label: "Deneyim" },
  { href: "#davetiye", label: "Dijital Davetiye" },
  { href: "#quiz", label: "Quiz" },
  { href: "#shared-memories", label: "Hatıralar" },
  { href: "#memoora-after", label: "Memoora After" },
] as const;

const META_LINKS = [
  { href: "/iletisim", label: "İletişim" },
  { href: "/teslimat-ve-kargo", label: "Teslimat & kargo" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Satış sözleşmesi" },
  { href: "/iptal-ve-iade", label: "İptal & iade" },
  { href: "/gizlilik", label: "Gizlilik" },
  { href: "/cerezler", label: "Çerezler" },
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
          <div className="home-footer__contact">
            <p>{LEGAL_COMPANY.legalName}</p>
            <p>{LEGAL_COMPANY.address}</p>
            <p>
              <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>
              {LEGAL_COMPANY.phone ? (
                <>
                  {" · "}
                  <a href={`tel:${LEGAL_COMPANY.phone.replace(/\s/g, "")}`}>
                    {LEGAL_COMPANY.phone}
                  </a>
                </>
              ) : null}
            </p>
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

        <p className="home-footer__copy">© 2026 Memoora</p>
      </div>
    </footer>
  );
}
