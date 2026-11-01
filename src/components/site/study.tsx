import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStored } from "@/lib/stored";
import { visitCards, visitQuestions } from "@/lib/education/published";

const LIMIT = 4 * 60;

export function StudyDesk() {
  const stored = useStored();
  const questions = stored.study.questions.length > 0 ? stored.study.questions : visitQuestions;
  const cards = stored.study.cards.length > 0 ? stored.study.cards : visitCards;
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(LIMIT);
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const [card, setCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!started || done) return;
    const timer = window.setInterval(() => {
      setLeft((current) => {
        if (current <= 1) {
          setDone(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, done]);

  const score = questions.reduce((sum, question, index) => sum + (picks[index] === question.answer ? 1 : 0), 0);
  const minutes = String(Math.floor(left / 60)).padStart(2, "0");
  const seconds = String(left % 60).padStart(2, "0");
  const question = questions[step];

  function choose(option: number) {
    if (done) return;
    setPicks({ ...picks, [step]: option });
  }

  function finish() {
    setDone(true);
  }

  return (
    <div className="study-desk">
      <section className="paper" id="treino">
        <div className="section-row">
          <h2>Treino desta visita</h2>
          <span className="badge badge-info" aria-live="polite">
            {started ? `${minutes}:${seconds}` : "4:00"}
          </span>
        </div>
        <p className="tool-help">
          Cinco questões dos instrumentos que já estão no ar. A nota desta visita não é gravada. O mesmo banco abre no estúdio, onde a prova pode ser montada de novo.
        </p>
        {!started ? (
          <button className="btn-navy" type="button" onClick={() => setStarted(true)}>
            Começar
          </button>
        ) : null}
        {started && !done && question ? (
          <fieldset className="quiz">
            <legend>
              {step + 1} de {questions.length}. {question.prompt}
            </legend>
            {question.options.map((option, index) => (
              <label key={option} className={picks[step] === index ? "is-picked" : ""}>
                <input type="radio" name={`q-${step}`} checked={picks[step] === index} onChange={() => choose(index)} />
                {option}
              </label>
            ))}
            <div className="tool-actions">
              <button className="btn-ghost" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>
                Anterior
              </button>
              {step < questions.length - 1 ? (
                <button className="btn-navy" type="button" onClick={() => setStep(step + 1)}>
                  Próxima
                </button>
              ) : (
                <button className="btn-navy" type="button" onClick={finish}>
                  Ver nota
                </button>
              )}
            </div>
          </fieldset>
        ) : null}
        {done ? (
          <div>
            <p>
              <b>
                {score} de {questions.length}
              </b>{" "}
              nesta visita. Nada foi salvo no navegador.
            </p>
            <ol className="plain-list">
              {questions.map((item, index) => (
                <li key={item.prompt}>
                  {item.prompt} Resposta: {item.options[item.answer]}.
                  {picks[index] === item.answer ? " Você acertou." : " Revise o instrumento."}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="paper" id="cartoes">
        <h2>Cartões</h2>
        <p className="tool-help">Toque para virar. Também ficam só nesta visita.</p>
        <button
          className="flashcard"
          type="button"
          aria-pressed={flipped}
          onClick={() => setFlipped(!flipped)}
        >
          <span>{flipped ? cards[card].back : cards[card].front}</span>
        </button>
        <div className="tool-actions">
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              setCard((card + cards.length - 1) % cards.length);
              setFlipped(false);
            }}
          >
            Cartão anterior
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => {
              setCard((card + 1) % cards.length);
              setFlipped(false);
            }}
          >
            Próximo cartão
          </button>
        </div>
      </section>
      <p className="tool-help">
        <Link to="/estudo">Abrir o estúdio de simulados</Link>
        {" · "}
        <Link to="/viladocuidado">Vila do Cuidado</Link>
        . A Vila é o projeto educativo, separado da prova. Os cadernos de 50 questões não estão neste repositório.
      </p>
    </div>
  );
}
