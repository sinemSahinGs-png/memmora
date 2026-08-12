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
          <Link href="/iletisim">{"\u0130leti\u015fim"}</Link>
          <Link href="/teslimat-ve-kargo">Teslimat</Link>
          <Link href="/mesafeli-satis-sozlesmesi">
            {"Sat\u0131\u015f s\u00f6zle\u015fmesi"}
          </Link>
          <Link href="/iptal-ve-iade">{"\u0130ptal & iade"}</Link>
        </nav>
      </header>

      <main className="legal-page__main">
        <p className="legal-page__eyebrow">Yasal bilgilendirme</p>
        <h1 className="legal-page__title">{title}</h1>
        {description ? (
          <p className="legal-page__lead">{description}</p>
        ) : null}
        <p className="legal-page__updated">
          {"Son g\u00fcncelleme: "}
          {LEGAL_COMPANY.lastUpdated}
        </p>
        <div className="legal-page__body">{children}</div>
      </main>

      <footer className="legal-page__footer">
        <p>
          {LEGAL_COMPANY.email}
          {LEGAL_COMPANY.phone ? ` \u00b7 ${LEGAL_COMPANY.phone}` : ""}
        </p>
        <Link href="/satinal">{"Sat\u0131n almaya d\u00f6n"}</Link>
      </footer>
    </div>
  );
}
