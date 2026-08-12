import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Teslimat ve Kargo | Memoora",
  description: "Memoora ürünlerinde teslimat ve kargo koşulları.",
};

export default function TeslimatPage() {
  return (
    <LegalPageShell
      title="Teslimat ve kargo koşulları"
      description="Kişiye özel NFC magnet ve anahtarlık siparişlerinin üretim ve gönderim süreci."
    >
      <section>
        <h2>Üretim süresi</h2>
        <p>
          Memoora ürünleri siparişe özel üretilir (isim/baş harf, tarih ve NFC
          yönlendirme). Ödeme onayından sonra tahmini üretim + kargo süresi{" "}
          <strong>{LEGAL_COMPANY.shippingBusinessDays}</strong>’dür. Yoğun
          dönemlerde bu süre uzayabilir; gecikme halinde e-posta ile bilgilendirme
          yapılır.
        </p>
      </section>

      <section>
        <h2>Kargo ve teslimat</h2>
        <ul>
          <li>Teslimat, sipariş sırasında paylaştığınız iletişim bilgilerine göre planlanır.</li>
          <li>Türkiye içi kargo ile gönderim yapılır.</li>
          <li>Kargo ücreti sipariş özetinde ayrıca belirtilmedikçe ürün fiyatına dahildir veya onay öncesi bildirilir.</li>
          <li>Kargo firmasının teslimat denemeleri ve alıcıya ulaşılamaması durumunda oluşacak ek ücretler alıcıya aittir.</li>
        </ul>
      </section>

      <section>
        <h2>Hasarlı / eksik teslimat</h2>
        <p>
          Paketi teslim alırken kontrol ediniz. Hasar veya eksiklik halinde kargo
          yetkilisine tutanak tutturunuz ve {LEGAL_COMPANY.shippingBusinessDays}{" "}
          beklemeden, en geç 3 iş günü içinde {LEGAL_COMPANY.email} adresine
          bildirimde bulununuz.
        </p>
      </section>

      <section>
        <h2>İletişim</h2>
        <p>
          Teslimat soruları için: {LEGAL_COMPANY.email}
          {LEGAL_COMPANY.phone ? ` · ${LEGAL_COMPANY.phone}` : ""}
        </p>
      </section>
    </LegalPageShell>
  );
}
