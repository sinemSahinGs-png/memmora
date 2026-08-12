import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_COMPANY } from "@/lib/legal/company";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | Memoora",
  description: "Memoora mesafeli satış sözleşmesi ve satış politikası.",
};

export default function MesafeliSatisPage() {
  return (
    <LegalPageShell
      title="Mesafeli satış sözleşmesi"
      description="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında."
    >
      <section>
        <h2>1. Taraflar</h2>
        <p>
          İşbu sözleşme; aşağıda bilgileri yer alan satıcı ile{" "}
          {LEGAL_COMPANY.siteUrl} üzerinden sipariş veren alıcı arasında
          elektronik ortamda kurulmuştur.
        </p>
        <div className="legal-page__card">
          <p>
            <strong>Satıcı:</strong> {LEGAL_COMPANY.legalName}
          </p>
          <p>
            <strong>Adres:</strong> {LEGAL_COMPANY.address}
          </p>
          <p>
            <strong>E-posta:</strong> {LEGAL_COMPANY.email}
          </p>
          {LEGAL_COMPANY.phone ? (
            <p>
              <strong>Telefon:</strong> {LEGAL_COMPANY.phone}
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2>2. Konu</h2>
        <p>
          Sözleşmenin konusu, alıcının satıcıya ait internet sitesinden elektronik
          ortamda siparişini verdiği kişiye özel NFC magnet, NFC anahtarlık ve
          ilişkili Memoora dijital hizmet bileşenlerinin satışı ve teslimidir.
        </p>
      </section>

      <section>
        <h2>3. Ürün ve bedel</h2>
        <p>
          Ürünlerin cinsi, adedi, satış bedeli, KDV ve varsa kargo ücreti sipariş
          özeti ekranında ve ödeme öncesinde alıcıya gösterilir. Bedel, ödeme
          anında geçerli fiyatlardır. Ödeme PayTR altyapısı üzerinden güvenli
          şekilde alınır.
        </p>
      </section>

      <section>
        <h2>4. Sözleşmenin kurulması</h2>
        <p>
          Alıcı; sipariş adımlarını tamamlayıp ödemeyi onayladığında, işbu
          sözleşmenin koşullarını okuyup kabul etmiş sayılır. Sipariş özeti ve
          sözleşme, alıcının bildirdiği e-posta adresine iletilebilir.
        </p>
      </section>

      <section>
        <h2>5. Teslimat</h2>
        <p>
          Ürünler kişiye özel üretildiğinden tahmini teslimat süresi ödeme
          onayından itibaren {LEGAL_COMPANY.shippingBusinessDays}’dür. Detaylar
          Teslimat ve Kargo sayfasında yer alır.
        </p>
      </section>

      <section>
        <h2>6. Cayma hakkı ve istisna</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği’nin ilgili hükümleri uyarınca; alıcının
          istekleri doğrultusunda kişiselleştirilen / özel olarak üretilen
          mallarda cayma hakkı kullanılamaz. Memoora magnet ve anahtarlık ürünleri
          isim, tarih ve NFC yönlendirme ile kişiye özel üretildiğinden bu
          istisna kapsamındadır. Ayrıntılar İptal ve İade sayfasındadır.
        </p>
      </section>

      <section>
        <h2>7. Uyuşmazlık</h2>
        <p>
          Şikâyet ve itirazlar için satıcı iletişim kanalları öncelikli başvuru
          yeridir. Tüketici, bulunduğu yerdeki veya satıcının bulunduğu yerdeki
          Tüketici Hakem Heyetleri ile Tüketici Mahkemelerine başvurabilir.
        </p>
      </section>

      <section>
        <h2>8. Yürürlük</h2>
        <p>
          Alıcı, site üzerinden siparişi tamamlamakla işbu sözleşmenin tüm
          koşullarını kabul etmiş olur. Sözleşme, ödeme işleminin
          gerçekleştirildiği tarihte yürürlüğe girer.
        </p>
      </section>
    </LegalPageShell>
  );
}
