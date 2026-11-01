import { useEffect, useState } from "react";

const questions = [
  {
    prompt: "Na Escala de Braden, um escore menor indica",
    options: ["Menor risco de lesão por pressão", "Maior risco de lesão por pressão", "A idade do paciente em anos"],
    answer: 1,
  },
  {
    prompt: "Na Morse, 50 pontos indicam",
    options: ["Risco baixo", "Risco médio", "Risco alto"],
    answer: 2,
  },
  {
    prompt: "Um Apgar 8, neste template, cai em",
    options: ["Depressão grave", "Depressão moderada", "Boa vitalidade"],
    answer: 2,
  },
  {
    prompt: "500 mL em 2 horas, equipo de macrogotas (fator 20), ficam em cerca de",
    options: ["83 gotas por minuto", "250 gotas por minuto", "20 gotas por minuto"],
    answer: 0,
  },
  {
    prompt: "IMC 24 kg/m² no adulto, neste template, é",
    options: ["Baixo peso", "Adequado", "Obesidade I"],
    answer: 1,
  },
];

const cards = [
  { front: "Braden", back: "De 6 a 23. Quanto menor o escore, maior o risco de lesão por pressão." },
  { front: "Morse", back: "Até 24 é risco baixo. De 25 a 44, médio. A partir de 45, alto." },
  { front: "Apgar", back: "O minuto da avaliação não entra na soma. De 7 a 10 é boa vitalidade neste template." },
  { front: "Gotejamento", back: "Gotas por minuto = (volume em mL × fator do equipo) ÷ tempo em minutos." },
  { front: "Equipo", back: "Macrogotas usa fator 20. Microgotas usa fator 60. Trocar o equipo exige novo cálculo." },
  { front: "IMC adulto", back: "Peso em kg dividido pela altura em metros ao quadrado. Não use a faixa adulta em criança." },
];

const LIMIT = 4 * 60;

export function StudyDesk() {
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
          Cinco questões dos instrumentos que já estão no ar. A nota não é gravada. Os cadernos longos do menu continuam no site homologado.
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
    </div>
  );
}
