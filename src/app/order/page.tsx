import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { OrderForm } from "@/components/marketing/OrderForm";

export default function OrderPage() {
  return (
    <MarketingShell>
      <section className="marketing-section marketing-section--hero-pad">
        <div className="marketing-section__inner marketing-section__inner--narrow">
          <Suspense fallback={<p className="text-white/40">Yükleniyor…</p>}>
            <OrderForm />
          </Suspense>
        </div>
      </section>
    </MarketingShell>
  );
}
