import { HOME_STEPS } from "@/lib/home-content";
import { StepIcon } from "./home-icons";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mh-steps"
      aria-labelledby="home-steps-heading"
    >
      <div className="mh-container">
        <p className="mh-eyebrow">Nasıl çalışır</p>
        <h2 id="home-steps-heading" className="mh-section-title">
          Beş adımda hazır
        </h2>
        <p className="mh-section-lead">
          Kurulumdan misafir deneyimine kadar her şey sizin için hazırlanır.
        </p>
        <div className="mh-divider" />

        <div className="mh-steps__grid">
          {HOME_STEPS.map((step, index) => (
            <article key={step.title} className="mh-step-card mh-card">
              <span className="mh-step-card__badge">{index + 1}</span>
              <div className="mh-step-card__icon">
                <StepIcon name={step.icon} />
              </div>
              <div className="mh-step-card__body">
                <h3 className="mh-step-card__title">{step.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
