import Link from "next/link";
import "@/app/satinal/purchase.css";

export const metadata = {
  title: "Ödeme başarısız | Memoora",
  description: "Ödeme tamamlanamadı.",
};

export default function OdemeBasarisizPage() {
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
            <h1>Ödeme tamamlanamadı</h1>
            <p className="purchase-flow__lead">
              Kartınızdan tahsilat yapılmadı veya işlem iptal edildi. Tekrar
              deneyebilirsiniz.
            </p>
            <div className="purchase-confirm">
              <Link href="/satinal" className="purchase-btn purchase-btn--primary">
                Tekrar ödeme yap
              </Link>
              <Link href="/" className="purchase-btn purchase-btn--ghost">
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
