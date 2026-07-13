import Link from "next/link";

export function PremiumHomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <p className="home-footer__brand">MEMOORA</p>
        <p className="home-footer__tagline">
          NFC ile açılan premium düğün anı deneyimi
        </p>
        <nav className="home-footer__links" aria-label="Alt menü">
          <a href="#deneyim">Deneyim</a>
          <a href="#ani-agaci">Anı Ağacı</a>
          <Link href="/order">Sipariş Ver</Link>
        </nav>
        <p className="home-footer__copy">© {year} Memoora</p>
      </div>
    </footer>
  );
}
