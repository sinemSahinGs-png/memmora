"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SplitTextReveal } from "@/components/animation/SplitTextReveal";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const ANSWERS = [
  "Gelin",
  "Damat",
  "İkisi aynı anda",
  "Hâlâ söylemediler",
] as const;

const LEADERBOARD = [
  { rank: 1, name: "Ece", score: "4.850" },
  { rank: 2, name: "Kerem", score: "4.420" },
  { rank: 3, name: "Burak", score: "4.180" },
  { rank: 4, name: "Selin", score: "3.940" },
] as const;

export function InteractiveQuizSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const fireworksRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    () => {
      const section = sectionRef.current;
      if (!section || reduced) return;

      const question = section.querySelector(".cine-quiz__question");
      const answers = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-quiz__answer"),
      );
      const result = section.querySelector(".cine-quiz__result");
      const board = section.querySelector(".cine-quiz__board");
      const first = section.querySelector(".cine-quiz__row--first");
      const rows = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".cine-quiz__row"),
      );
      const boardTitle = section.querySelector(".cine-quiz__board-title");
      const fireworks = fireworksRef.current;

      gsap.set(question, { opacity: 0.88, y: 10 });
      gsap.set(answers, { opacity: 0.82, y: 8 });
      if (result) gsap.set(result, { opacity: 0, y: 10, scale: 0.96 });
      if (board) gsap.set(board, { opacity: 0.85, y: 12 });
      if (boardTitle) gsap.set(boardTitle, { opacity: 0.6, y: 8 });
      gsap.set(rows, { opacity: 0.55, x: 18 });
      answers.forEach((el) => {
        el.classList.remove(
          "cine-quiz__answer--selected",
          "cine-quiz__answer--gold",
          "cine-quiz__answer--correct",
        );
      });

      let fired = false;

      const burstFireworks = () => {
        if (!fireworks || fired) return;
        fired = true;
        fireworks.innerHTML = "";
        fireworks.classList.add("is-active");
        const colors = ["#e1c467", "#cfa83d", "#7bbf8a", "#f5f1e8", "#d4af37"];
        for (let i = 0; i < 28; i += 1) {
          const spark = document.createElement("span");
          spark.className = "cine-quiz__spark";
          const angle = (Math.PI * 2 * i) / 28;
          const dist = 60 + Math.random() * 90;
          spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
          spark.style.setProperty("--dy", `${Math.sin(angle) * dist - 40}px`);
          spark.style.setProperty(
            "--hue",
            colors[i % colors.length] ?? "#e1c467",
          );
          spark.style.animationDelay = `${Math.random() * 0.12}s`;
          fireworks.appendChild(spark);
        }
        window.setTimeout(() => {
          fireworks.classList.remove("is-active");
          fireworks.innerHTML = "";
        }, 1400);
      };

      const mm = gsap.matchMedia();

      const finalize = () => {
        gsap.set(
          [question, ...answers, result, board, boardTitle, ...rows].filter(
            Boolean,
          ),
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            clearProps: "filter",
          },
        );
        answers.forEach((el, i) => {
          el.classList.remove("cine-quiz__answer--gold");
          if (i === 0) el.classList.add("cine-quiz__answer--correct");
        });
      };

      const animateAnswers = (tl: gsap.core.Timeline) => {
        tl.to(question, { opacity: 1, y: 0, duration: 0.8, ease: "none" });
        tl.to(
          answers,
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "none" },
          0.2,
        );
        // Yellow flash across answers
        answers.forEach((el, i) => {
          tl.call(
            () => {
              el.classList.add("cine-quiz__answer--gold");
            },
            undefined,
            0.55 + i * 0.12,
          );
          tl.call(
            () => {
              el.classList.remove("cine-quiz__answer--gold");
            },
            undefined,
            0.85 + i * 0.12,
          );
        });
        // Correct answer turns green + fireworks
        tl.call(
          () => {
            answers[0]?.classList.add("cine-quiz__answer--correct");
            burstFireworks();
          },
          undefined,
          1.35,
        );
        tl.to(
          result,
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.6)" },
          1.4,
        );
      };

      const animateBoard = (tl: gsap.core.Timeline, at: number) => {
        tl.to(board, { opacity: 1, y: 0, duration: 0.7 }, at);
        tl.to(boardTitle, { opacity: 1, y: 0, duration: 0.5 }, at + 0.05);
        tl.to(
          rows,
          {
            opacity: 1,
            x: 0,
            stagger: 0.12,
            duration: 0.55,
            ease: "power2.out",
          },
          at + 0.15,
        );
        tl.to(
          first,
          {
            boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.55)",
            duration: 0.45,
          },
          at + 0.55,
        );
      };

      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "bottom 28%",
            scrub: 0.55,
            onLeave: finalize,
            onLeaveBack: () => {
              fired = false;
              answers.forEach((el) => {
                el.classList.remove(
                  "cine-quiz__answer--gold",
                  "cine-quiz__answer--correct",
                );
              });
            },
          },
        });
        animateAnswers(tl);
        animateBoard(tl, 1.7);
      });

      mm.add("(min-width: 1024px)", () => {
        const desktop = section.querySelector(".cine-quiz__stage");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: desktop,
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            onLeave: finalize,
            onLeaveBack: () => {
              fired = false;
            },
          },
        });
        animateAnswers(tl);
        animateBoard(tl, 1.65);
      });

      return () => mm.revert();
    },
    [reduced],
    sectionRef,
  );

  return (
    <section
      ref={sectionRef}
      id="quiz"
      className="cine-quiz"
      aria-label="İnteraktif düğün quiz"
    >
      <div className="cine-container cine-quiz__intro">
        <p className="cine-eyebrow">İNTERAKTİF DÜĞÜN AKTİVİTESİ</p>
        <SplitTextReveal as="h2" className="cine-heading">
          Çifti en iyi
          <br />
          kim tanıyor?
        </SplitTextReveal>
        <ScrollReveal>
          <p className="cine-body">
            Düğüne özel sorular ve canlı sıralamayla misafirlerinizi gecenin
            aktif bir parçası yapın.
          </p>
          <p className="cine-body cine-quiz__support">
            Cevabını seç, puanını kazan ve sıralamadaki yerini gör.
          </p>
        </ScrollReveal>
      </div>

      <div className="cine-quiz__stage">
        <div className="cine-quiz__interface">
          <div
            ref={fireworksRef}
            className="cine-quiz__fireworks"
            aria-hidden
          />
          <p className="cine-quiz__question">
            İlk “Seni seviyorum” diyen kimdi?
          </p>
          <div className="cine-quiz__answers">
            {ANSWERS.map((answer) => (
              <button key={answer} type="button" className="cine-quiz__answer">
                {answer}
              </button>
            ))}
          </div>
          <div className="cine-quiz__result">
            <span>Doğru cevap!</span>
            <strong>+850 puan</strong>
          </div>
        </div>

        <div className="cine-quiz__board">
          <div className="cine-quiz__board-title">
            <span className="cine-quiz__board-kicker">Quiz Lideri</span>
            <span className="cine-quiz__board-live">Canlı sıra</span>
          </div>
          <ol className="cine-quiz__board-list">
            {LEADERBOARD.map((row) => (
              <li
                key={row.name}
                className={`cine-quiz__row${row.rank === 1 ? " cine-quiz__row--first" : ""}`}
              >
                <span className="cine-quiz__rank">{row.rank}</span>
                <span className="cine-quiz__player">{row.name}</span>
                <span className="cine-quiz__score">{row.score}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
