import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL_COMPANY } from "@/lib/legal/company";
import "./legal.css";

interface LegalPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <Link href="/" className="legal-page__logo">
          MEMOORA
        </Link>
        <nav className="legal-page__topnav" aria-label="Yasal sayfalar">
          <Link href="/iletisim">İletişim</Link>
          <Link href="/teslimat-ve-kargo">Teslimat</Link>
          <Link href="/mesafeli-satis-sozlesmesi">Satış sözleşmesi</Link>
          <Link href="/iptal-ve-iade">İptal &amp; iade</Link>
        </nav>
      </header>

      <main className="legal-page__main">
        <p className="legal-page__eyebrow">Yasal bilgilendirme</p>
        <h1 className="legal-page__title">{title}</h1>
        {description ? (
          <p className="legal-page__lead">{description}</p>
        ) : null}
        <p className="legal-page__updated">
          Son güncelleme: {LEGAL_COMPANY.lastUpdated}
        </p>
        <div className="legal-page__body">{children}</div>
      </main>

      <footer className="legal-page__footer">
        <p>
          {LEGAL_COMPANY.legalName} · {LEGAL_COMPANY.email}
          {LEGAL_COMPANY.phone ? ` · ${LEGAL_COMPANY.phone}` : ""}
        </p>
        <Link href="/satinal">Satın almaya dön</Link>
      </footer>
    </div>
  );
}
