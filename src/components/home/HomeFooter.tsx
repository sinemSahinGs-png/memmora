import Link from "next/link";

export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mh-footer">
      <p className="mh-footer__brand">Memoora</p>
      <p className="mh-footer__tagline">
        NFC ile açılan premium dijital hatıra ağacı
      </p>
      <nav className="mh-footer__links" aria-label="Alt menü">
        <Link href="/pricing">Fiyatlandırma</Link>
        <Link href="/order">Sipariş Ver</Link>
        <Link href="#how-it-works">Nasıl Çalışır</Link>
        <Link href="#packages">Paketler</Link>
      </nav>
      <p className="mh-footer__copy">© {year} Memoora. Tüm hakları saklıdır.</p>
    </footer>
  );
}
