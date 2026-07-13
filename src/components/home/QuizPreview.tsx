import { HOME_LEADERBOARD, HOME_QUIZ_OPTIONS } from "@/lib/home-content";

export function QuizPreview() {
  return (
    <section className="mh-quiz" aria-labelledby="home-quiz-heading">
      <div className="mh-container">
        <p className="mh-eyebrow">Quiz</p>
        <h2 id="home-quiz-heading" className="mh-section-title">
          Düğünde interaktif eğlence
        </h2>
        <p className="mh-section-lead">
          Misafirleriniz çift hakkında soruları yanıtlar, skor tablosunda
          yarışır.
        </p>
        <div className="mh-divider" />

        <div className="mh-quiz__layout">
          <div className="mh-quiz__card mh-card">
            <p className="mh-quiz__question">
              Çift nerede tanıştı?
            </p>
            <div className="mh-quiz__options">
              {HOME_QUIZ_OPTIONS.map((option, index) => (
                <div
                  key={option}
                  className={`mh-quiz__option${index === 1 ? " mh-quiz__option--active" : ""}`}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="mh-quiz__card mh-card">
            <p className="mh-quiz__leaderboard-title">Liderlik tablosu</p>
            <ul className="mh-quiz__leaderboard-list">
              {HOME_LEADERBOARD.map((entry) => (
                <li key={entry.rank} className="mh-quiz__leaderboard-item">
                  <span className="mh-quiz__rank">{entry.rank}</span>
                  <span>{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
