import Link from "next/link";
import { getDemoHref, type HomeDemoCouple } from "@/lib/home-content";

interface FinalCTAProps {
  demos: HomeDemoCouple[];
}

export function FinalCTA({ demos }: FinalCTAProps) {
  const demoHref = getDemoHref(demos);

  return (
    <section className="mh-final-cta" aria-labelledby="home-final-cta-heading">
      <div className="mh-container">
        <p className="mh-eyebrow">Hazır mısınız?</p>
        <h2 id="home-final-cta-heading" className="mh-section-title">
          Düğün anılarınızı birlikte yaşatın
        </h2>
        <p className="mh-section-lead">
          Demo düğünü inceleyin veya paketlerimizi keşfederek hemen başlayın.
        </p>
        <div className="mh-final-cta__actions">
          <Link href={demoHref} className="mh-btn mh-btn--primary">
            Demo Düğünü Gör
          </Link>
          <Link href="#packages" className="mh-btn mh-btn--secondary">
            Paketleri İncele
          </Link>
        </div>
      </div>
    </section>
  );
}
