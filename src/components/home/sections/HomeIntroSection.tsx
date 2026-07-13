import { Reveal } from "../Reveal";

export function HomeIntroSection() {
  return (
    <section id="deneyim" className="home-section home-intro">
      <div className="home-container home-intro__grid">
        <Reveal className="home-intro__copy">
          <p className="home-eyebrow">Deneyim</p>
          <h2 className="home-display">
            Bir düğün sitesi değil.
            <br />
            Bir galeri de değil.
          </h2>
          <div className="home-rule" />
          <p className="home-body home-intro__lead">
            Memoora, misafirlerinizin dokunduğu anda açılan yaşayan bir dijital
            anı dünyasıdır. Her katılım ağacı büyütür; her mesaj, fotoğraf ve
            video çiftin özel hatıra evrenine eklenir.
          </p>
          <p className="home-body home-intro__secondary">
            Sessiz lüks, sinematik atmosfer ve NFC ile başlayan kusursuz bir
            giriş — düğününüz bittikten sonra da büyümeye devam eden bir miras.
          </p>
        </Reveal>

        <Reveal className="home-intro__aside" delay={0.12}>
          <div className="home-glass-panel home-intro__panel">
            <p className="home-panel__label">Yaşayan bellek</p>
            <p className="home-panel__quote">
              &ldquo;Anılar birikir, ağaç büyür, dünya canlı kalır.&rdquo;
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
