import Link from "next/link";
import { HOME_PRODUCTS } from "@/lib/home-content";

export function ProductCollections() {
  return (
    <section className="mh-products" aria-labelledby="home-products-heading">
      <div className="mh-container">
        <p className="mh-eyebrow">Ürünler</p>
        <h2 id="home-products-heading" className="mh-section-title">
          Düğününüze özel NFC deneyimi
        </h2>
        <p className="mh-section-lead">
          Magnet, anahtarlık veya dijital davetiye — misafirleriniz tek
          dokunuşla anılarınıza katılır.
        </p>
        <div className="mh-divider" />

        <div className="mh-products__grid">
          {HOME_PRODUCTS.map((product) => (
            <Link
              key={product.title}
              href={product.href}
              className="mh-product-card"
            >
              <div
                className="mh-product-card__media"
                style={{ background: product.gradient }}
                aria-hidden
              />
              <div className="mh-product-card__footer">
                <span>{product.title}</span>
                <span className="mh-product-card__arrow" aria-hidden>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
