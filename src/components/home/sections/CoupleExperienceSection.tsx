import Image from "next/image";
import { ASSETS } from "@/lib/assets";
import { Reveal } from "../Reveal";

const COUPLE_FEATURES = [
  {
    title: "Çift hikayesi",
    text: "Tanışma anından düğüne uzanan editoryal bir anlatım.",
  },
  {
    title: "Zaman çizelgesi",
    text: "İlişkinizin kilometre taşları, zarif ve kronolojik.",
  },
  {
    title: "Quiz & playlist",
    text: "Misafirlerinizle paylaşılan interaktif eğlence ve müzik.",
  },
  {
    title: "Özel düğün dünyası",
    text: "Yalnızca sizin ve misafirlerinizin gördüğü kapalı bir bellek evreni.",
  },
] as const;

export function CoupleExperienceSection() {
  return (
    <section className="home-section home-couple" aria-labelledby="couple-heading">
      <div className="home-couple__backdrop">
        <Image
          src={ASSETS.quizLeadersBg}
          alt=""
          fill
          sizes="100vw"
          className="home-couple__bg"
          aria-hidden
        />
        <div className="home-couple__veil" aria-hidden />
      </div>

      <div className="home-container home-couple__inner">
        <Reveal className="home-couple__intro">
          <p className="home-eyebrow home-eyebrow--light">Çift Deneyimi</p>
          <h2 id="couple-heading" className="home-display home-display--light">
            Sizin özel
            <br />
            düğün dünyanız
          </h2>
          <p className="home-body home-body--light home-couple__lead">
            Quiz, playlist, çift hikayesi ve zaman çizelgesi — hepsi tek bir
            lüks dijital evrende, özellik listesi gibi değil; editoryal bir
            deneyim olarak sunulur.
          </p>
        </Reveal>

        <div className="home-couple__editorial">
          {COUPLE_FEATURES.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <article className="home-couple__item">
                <span className="home-couple__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="home-couple__item-title">{item.title}</h3>
                <p className="home-couple__item-text">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
