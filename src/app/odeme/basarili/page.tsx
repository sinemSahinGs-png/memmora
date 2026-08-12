import Link from "next/link";
import "@/app/satinal/purchase.css";

export const metadata = {
  title: "Ödeme başarılı | Memoora",
  description: "Ödeme işleminiz alındı.",
};

export default function OdemeBasariliPage() {
  return (
    <div className="purchase-flow">
      <header className="purchase-flow__header">
        <Link href="/" className="purchase-flow__logo">
          MEMOORA
        </Link>
        <p className="purchase-flow__tag">Ödeme</p>
      </header>

      <div className="purchase-flow__layout purchase-flow__layout--single">
        <div className="purchase-flow__main">
          <div className="purchase-flow__panel">
            <h1>Ödemeniz alındı</h1>
            <p className="purchase-flow__lead">
              Banka onayı tamamlandığında siparişiniz otomatik olarak işleme
              alınır. Bu sayfa bilgilendirme amaçlıdır; kesin ödeme sonucu
              PayTR bildiriminden doğrulanır.
            </p>
            <div className="purchase-confirm">
              <p>
                Kısa süre içinde sizinle iletişime geçeceğiz. Sorunuz olursa
                bize yazabilirsiniz.
              </p>
              <Link href="/" className="purchase-btn purchase-btn--primary">
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
