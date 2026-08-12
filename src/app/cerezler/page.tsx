import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Çerez Politikası | Memoora",
  description: "Memoora çerez (cookie) kullanım politikası.",
};

export default function CerezlerPage() {
  return (
    <LegalPageShell
      title="Çerez politikası"
      description="Sitemizde kullanılan çerezler ve benzeri teknolojiler."
    >
      <section>
        <h2>Neden çerez kullanıyoruz?</h2>
        <p>
          Oturum yönetimi, güvenlik, temel site işlevleri ve performans ölçümü
          için çerezler kullanılabilir.
        </p>
      </section>

      <section>
        <h2>Çerez türleri</h2>
        <ul>
          <li>
            <strong>Zorunlu çerezler:</strong> Sitenin çalışması ve güvenliği için
            gereklidir.
          </li>
          <li>
            <strong>İşlevsel / analitik çerezler:</strong> Deneyimi iyileştirmek ve
            kullanım istatistikleri için kullanılabilir.
          </li>
        </ul>
      </section>

      <section>
        <h2>Yönetim</h2>
        <p>
          Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz.
          Zorunlu çerezler engellenirse bazı özellikler çalışmayabilir.
        </p>
      </section>

      <section>
        <h2>İletişim</h2>
        <p>{LEGAL_COMPANY.email}</p>
      </section>
    </LegalPageShell>
  );
}
