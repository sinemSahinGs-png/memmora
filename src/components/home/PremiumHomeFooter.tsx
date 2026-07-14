import Link from "next/link";

export function PremiumHomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className="home-footer">
      <div className="home-footer__inner">
        <p className="home-footer__brand">MEMOORA</p>
        <p className="home-footer__tagline">
          Ücretsiz dijital davetiye, quiz ve kişiye özel NFC hatıralar
        </p>
        <nav className="home-footer__links" aria-label="Alt menü">
          <a href="#davetiye">Davetiye</a>
          <a href="#quiz">Quiz</a>
          <a href="#nfc-urunler">NFC Ürünler</a>
          <Link href="/order">Sipariş Ver</Link>
        </nav>
        <p className="home-footer__copy">© {year} Memoora</p>
      </div>
    </footer>
  );
}
