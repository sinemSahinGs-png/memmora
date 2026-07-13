import Link from "next/link";
import { HOME_PACKAGES } from "@/lib/home-content";

export function PricingCards() {
  return (
    <section
      id="packages"
      className="mh-pricing"
      aria-labelledby="home-pricing-heading"
    >
      <div className="mh-container">
        <p className="mh-eyebrow">Paketler</p>
        <h2 id="home-pricing-heading" className="mh-section-title">
          Size uygun paketi seçin
        </h2>
        <p className="mh-section-lead">
          Her pakette dijital davetiye ve NFC deneyimi dahil — ihtiyacınıza göre
          özelleştirin.
        </p>
        <div className="mh-divider" />

        <div className="mh-pricing__grid">
          {HOME_PACKAGES.map((pkg) => (
            <article
              key={pkg.id}
              className={`mh-pricing-card mh-card${pkg.featured ? " mh-pricing-card--featured" : ""}`}
            >
              {"badge" in pkg && pkg.badge && (
                <span className="mh-pricing-card__badge">{pkg.badge}</span>
              )}
              <h3 className="mh-pricing-card__name">{pkg.name}</h3>
              <p className="mh-pricing-card__price">{pkg.price}</p>
              <ul className="mh-pricing-card__features">
                {pkg.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link
                href={`/order?package=${pkg.id}`}
                className="mh-btn mh-btn--primary"
              >
                Paketi Seç
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
