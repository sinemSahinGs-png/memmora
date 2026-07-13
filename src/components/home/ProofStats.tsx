import { HOME_PROOF_STATS } from "@/lib/home-content";

export function ProofStats() {
  return (
    <section className="mh-proof" aria-labelledby="home-proof-heading">
      <div className="mh-container">
        <p className="mh-eyebrow">Rakamlarla</p>
        <h2 id="home-proof-heading" className="mh-section-title">
          Anılar bir arada büyür
        </h2>
        <p className="mh-section-lead">
          Memoora deneyimiyle toplanan anılar, her düğünde benzersiz bir hikâye
          yazar.
        </p>
        <div className="mh-divider" />

        <div className="mh-proof__grid">
          {HOME_PROOF_STATS.map((stat) => (
            <div key={stat.label} className="mh-proof__stat mh-card">
              <span className="mh-proof__value">{stat.value}</span>
              <span className="mh-proof__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
