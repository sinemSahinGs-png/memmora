import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "İptal ve İade | Memoora",
  description: "Memoora iptal, cayma ve iade koşulları.",
};

export default function IptalIadePage() {
  return (
    <LegalPageShell
      title="İptal ve iade koşulları"
      description="Kişiye özel üretim ürünlerde iptal, cayma ve iade kuralları."
    >
      <section>
        <h2>Ödeme öncesi iptal</h2>
        <p>
          Ödeme tamamlanmadan sepet/sipariş adımından vazgeçebilirsiniz. Bu
          durumda herhangi bir tahsilat yapılmaz.
        </p>
      </section>

      <section>
        <h2>Ödeme sonrası / kişiye özel ürünler</h2>
        <p>
          Memoora NFC magnet ve anahtarlık ürünleri; isim/baş harf, düğün tarihi
          ve size özel NFC yönlendirme ile kişiselleştirilerek üretilir. 6502
          sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında, alıcının
          taleplerine göre hazırlanan kişiselleştirilmiş mallarda{" "}
          <strong>cayma hakkı bulunmamaktadır</strong>.
        </p>
      </section>

      <section>
        <h2>Üretim hatası / hasarlı teslimat</h2>
        <ul>
          <li>
            Üründe üretim kaynaklı hata veya taşıma sırasında oluşmuş hasar
            varsa, teslimattan sonra en geç 3 iş günü içinde{" "}
            {LEGAL_COMPANY.email} adresine fotoğraf ve sipariş bilgisi ile
            bildirin.
          </li>
          <li>
            Uygun görülen taleplerde ücretsiz değişim veya yeniden üretim
            sağlanır.
          </li>
          <li>
            Kullanıcı hatası, yanlış adres bildirimi veya kargo teslim
            alınmamasından kaynaklanan durumlar iade/değişim kapsamı dışındadır.
          </li>
        </ul>
      </section>

      <section>
        <h2>Dijital bileşenler</h2>
        <p>
          Memoora düğün sayfası / dijital davetiye gibi dijital hizmet
          bileşenleri, ifşa edildiği veya kullanılmaya başlandığı ölçüde ilgili
          mevzuattaki dijital içerik istisnalarına tabi olabilir. Detaylı
          talepleriniz için bizimle iletişime geçin.
        </p>
      </section>

      <section>
        <h2>Başvuru</h2>
        <p>
          İptal/iade talepleri: {LEGAL_COMPANY.email}
          {LEGAL_COMPANY.phone ? ` · ${LEGAL_COMPANY.phone}` : ""}
          <br />
          Adres: {LEGAL_COMPANY.address}
        </p>
      </section>
    </LegalPageShell>
  );
}
