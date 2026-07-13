import { Suspense } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { OrderSuccessView } from "@/components/marketing/OrderSuccessView";

export default function OrderSuccessPage() {
  return (
    <MarketingShell>
      <section className="marketing-section marketing-section--hero-pad">
        <div className="marketing-section__inner marketing-section__inner--narrow">
          <Suspense fallback={<p className="text-white/40">Yükleniyor…</p>}>
            <OrderSuccessView />
          </Suspense>
        </div>
      </section>
    </MarketingShell>
  );
}
