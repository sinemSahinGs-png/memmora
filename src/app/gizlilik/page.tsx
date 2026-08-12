import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Memoora",
  description: "Memoora gizlilik ve kişisel verilerin korunması politikası.",
};

export default function GizlilikPage() {
  return (
    <LegalPageShell
      title="Gizlilik politikası"
      description="Kişisel verilerinizin işlenmesi hakkında bilgilendirme."
    >
      <section>
        <h2>Veri sorumlusu</h2>
        <p>
          {LEGAL_COMPANY.legalName} — {LEGAL_COMPANY.address}
          <br />
          İletişim: {LEGAL_COMPANY.email}
        </p>
      </section>

      <section>
        <h2>İşlenen veriler</h2>
        <ul>
          <li>Sipariş ve iletişim için ad-soyad, e-posta, telefon</li>
          <li>Ödeme işlemi için ödeme kuruluşunun (PayTR) işlediği kart/ödeme verileri (kart bilgileri Memoora sunucularında saklanmaz)</li>
          <li>Site kullanımı sırasında teknik log ve çerez verileri</li>
        </ul>
      </section>

      <section>
        <h2>Amaç ve hukuki sebep</h2>
        <p>
          Veriler; sözleşmenin kurulması/ifası, siparişin teslimi, müşteri
          desteği, yasal yükümlülükler ve meşru menfaat kapsamında işlenir.
        </p>
      </section>

      <section>
        <h2>Aktarım</h2>
        <p>
          Ödeme için PayTR, barındırma/altyapı sağlayıcıları ve kargo firmaları
          gibi hizmet sağlayıcılarla, yalnızca gerekli ölçüde veri paylaşılabilir.
        </p>
      </section>

      <section>
        <h2>Haklarınız</h2>
        <p>
          KVKK kapsamındaki talepleriniz için {LEGAL_COMPANY.email} adresine
          yazabilirsiniz.
        </p>
      </section>
    </LegalPageShell>
  );
}
