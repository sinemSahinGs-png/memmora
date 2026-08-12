import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "\u0130leti\u015fim | Memoora",
  description: "Memoora ileti\u015fim ve adres bilgileri.",
};

export default function IletisimPage() {
  return (
    <LegalPageShell
      title={"\u0130leti\u015fim"}
      description={
        "Sipari\u015f, teslimat ve destek talepleriniz i\u00e7in bize ula\u015fabilirsiniz."
      }
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
          {
            "Hafta i\u00e7i 10:00\u201318:00 (T\u00fcrkiye saati). Mesajlar\u0131n\u0131za en ge\u00e7 2 i\u015f g\u00fcn\u00fc i\u00e7inde d\u00f6n\u00fc\u015f yap\u0131l\u0131r."
          }
        </p>
      </section>
    </LegalPageShell>
  );
}
