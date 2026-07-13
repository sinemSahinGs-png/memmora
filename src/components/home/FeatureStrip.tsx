import { HOME_FEATURE_STRIP } from "@/lib/home-content";
import { FeatureStripIcon } from "./home-icons";

export function FeatureStrip() {
  return (
    <section className="mh-features-section" aria-label="Öne çıkan özellikler">
      <div className="mh-features__strip">
        {HOME_FEATURE_STRIP.map((item) => (
          <div key={item.title} className="mh-features__item">
            <div className="mh-features__icon">
              <FeatureStripIcon name={item.icon} />
            </div>
            <h3 className="mh-features__title">{item.title}</h3>
            <p className="mh-features__text">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
