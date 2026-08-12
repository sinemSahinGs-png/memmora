import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "İletişim | Memoora",
  description: "Memoora iletişim ve adres bilgileri.",
};

export default function IletisimPage() {
  return (
    <LegalPageShell
      title="İletişim"
      description="Sipariş, teslimat ve destek talepleriniz için bize ulaşabilirsiniz."
    >
      <div className="legal-page__card">
        <p>
          <strong>Marka:</strong> {LEGAL_COMPANY.brandName}
        </p>
        <p>
          <strong>Ticari unvan:</strong> {LEGAL_COMPANY.legalName}
        </p>
        <p>
          <strong>Adres:</strong> {LEGAL_COMPANY.address}
        </p>
        <p>
          <strong>E-posta:</strong>{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>
        </p>
        {LEGAL_COMPANY.phone ? (
          <p>
            <strong>Telefon:</strong>{" "}
            <a href={`tel:${LEGAL_COMPANY.phone.replace(/\s/g, "")}`}>
              {LEGAL_COMPANY.phone}
            </a>
          </p>
        ) : (
          <p>
            <strong>Telefon:</strong> E-posta üzerinden dönüş sağlanır.
          </p>
        )}
        {LEGAL_COMPANY.taxOffice ? (
          <p>
            <strong>Vergi dairesi:</strong> {LEGAL_COMPANY.taxOffice}
          </p>
        ) : null}
        {LEGAL_COMPANY.taxNumber ? (
          <p>
            <strong>Vergi no:</strong> {LEGAL_COMPANY.taxNumber}
          </p>
        ) : null}
        <p>
          <strong>Web sitesi:</strong> {LEGAL_COMPANY.siteUrl}
        </p>
      </div>

      <section>
        <h2>Destek saatleri</h2>
        <p>
          Hafta içi 10:00–18:00 (Türkiye saati). Mesajlarınıza en geç 2 iş günü
          içinde dönüş yapılır.
        </p>
      </section>
    </LegalPageShell>
  );
}
