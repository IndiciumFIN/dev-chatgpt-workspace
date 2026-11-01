import { useEffect, useMemo, useState } from "react";
import { CheckIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, FlagIcon, RefreshCwIcon, ClockIcon } from "lucide-react";
import type { AssessmentItem, QuizDeck } from "@/lib/education/types";
import {
  prepareQuizSession,
  answerQuestion,
  finishSession,
  computeResult,
  canExposeAnswer,
  remainingSeconds,
  formatTime,
  type QuizSession,
  type QuizResult,
} from "@/lib/education/quiz-engine";
import { useSessionHistory } from "@/lib/education/store";

export function QuizRunner({
  deck,
  items,
  onClose,
}: {
  deck: QuizDeck;
  items: AssessmentItem[];
  onClose: () => void;
}) {
  const [session, setSession] = useState<QuizSession>(() =>
    prepareQuizSession(deck.canonical_id, items, {
      shuffleItems: deck.shuffle_items,
      shuffleOptions: deck.shuffle_options,
      timeLimitSeconds: deck.time_limit_seconds || 0,
      defaultExposure: deck.default_answer_exposure,
    }),
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const { addEntry } = useSessionHistory();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Cronômetro
  useEffect(() => {
    if (session.finished || session.timeLimitSeconds === 0) return;
    const interval = setInterval(() => {
      const left = remainingSeconds(session);
      if (left <= 0) {
        const finished = finishSession(session, "timeout");
        setSession(finished);
        const r = computeResult(finished, deck.passing_score || 70);
        setResult(r);
        addEntry({
          sessionId: r.sessionId,
          deckId: deck.canonical_id,
          deckTitle: deck.title,
          date: new Date().toISOString(),
          score: r.score,
          total: r.total,
          correct: r.correct,
          wrong: r.wrong,
          blank: r.blank,
          passed: r.passed,
          timeSpentSeconds: r.timeSpentSeconds,
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session, deck, addEntry]);

  const current = session.questions[currentIdx];
  const remaining = remainingSeconds(session);

  function handleAnswer(optionIdx: number) {
    if (session.finished) return;
    setSession((s) => answerQuestion(s, current.id, optionIdx));
  }

  function handleFinish() {
    const finished = finishSession(session, "submit");
    setSession(finished);
    const r = computeResult(finished, deck.passing_score || 70);
    setResult(r);
    addEntry({
      sessionId: r.sessionId,
      deckId: deck.canonical_id,
      deckTitle: deck.title,
      date: new Date().toISOString(),
      score: r.score,
      total: r.total,
      correct: r.correct,
      wrong: r.wrong,
      blank: r.blank,
      passed: r.passed,
      timeSpentSeconds: r.timeSpentSeconds,
    });
  }

  function handleRestart() {
    setSession(
      prepareQuizSession(deck.canonical_id, items, {
        shuffleItems: deck.shuffle_items,
        shuffleOptions: deck.shuffle_options,
        timeLimitSeconds: deck.time_limit_seconds || 0,
        defaultExposure: deck.default_answer_exposure,
      }),
    );
    setResult(null);
    setCurrentIdx(0);
  }

  // Tela de resultado
  if (result) {
    return <ResultView result={result} deck={deck} onRestart={handleRestart} onClose={onClose} />;
  }

  // Tela de questão
  const userAnswer = session.answers[current.id];
  const exposeAnswer = canExposeAnswer(current, session);
  const answeredCount = Object.keys(session.answers).length;
  const progressPct = Math.round((answeredCount / session.questions.length) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{deck.title}</h3>
          <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)" }}>
            Questão {currentIdx + 1} de {session.questions.length} · {answeredCount} respondida(s)
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {session.timeLimitSeconds > 0 && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.4rem 0.7rem",
              background: remaining < 30 ? "var(--danger-soft, #fde8e8)" : "var(--accent-soft, #e8f0fe)",
              color: remaining < 30 ? "var(--danger, #c0392b)" : "var(--accent, #0a66c2)",
              borderRadius: "0.3rem",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}>
              <ClockIcon size={14} /> {formatTime(remaining)}
            </span>
          )}
          <button onClick={() => { if (confirm("Finalizar agora? As respostas em branco contam como erro.")) handleFinish(); }} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <FlagIcon size={14} /> Finalizar
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ background: "var(--accent-soft, #e8f0fe)", borderRadius: "0.3rem", height: "0.4rem", marginBottom: "1.25rem", overflow: "hidden" }}>
        <div style={{ background: "var(--accent, #0a66c2)", height: "100%", width: `${progressPct}%`, transition: "width 0.2s" }} />
      </div>

      {/* Questão */}
      <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "1.25rem", background: "var(--surface, #fff)" }}>
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", padding: 0 }}>
            {current.prompt}
          </legend>
          {current.options.map((opt, idx) => {
            const isSelected = userAnswer === idx;
            const isCorrect = idx === current.correctIndex;
            const showCorrect = exposeAnswer && isCorrect;
            const showWrong = exposeAnswer && isSelected && !isCorrect;
            return (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  marginBottom: "0.4rem",
                  border: "1px solid " + (showCorrect ? "var(--success, #2e7d32)" : showWrong ? "var(--danger, #c0392b)" : isSelected ? "var(--accent, #0a66c2)" : "var(--border, #ccc)"),
                  borderRadius: "0.3rem",
                  cursor: session.finished ? "default" : "pointer",
                  background: showCorrect ? "var(--success-soft, #e8f5e8)" : showWrong ? "var(--danger-soft, #fde8e8)" : isSelected ? "var(--accent-soft, #e8f0fe)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name={`q-${current.id}`}
                  checked={isSelected}
                  onChange={() => handleAnswer(idx)}
                  disabled={session.finished}
                />
                <span style={{ flex: 1, fontSize: "0.95rem" }}>{String.fromCharCode(65 + idx)}) {opt}</span>
                {showCorrect && <CheckIcon size={16} style={{ color: "var(--success, #2e7d32)" }} />}
                {showWrong && <XIcon size={16} style={{ color: "var(--danger, #c0392b)" }} />}
              </label>
            );
          })}
        </fieldset>

        {/* Justificativa (se exposição imediata ou on_submit) */}
        {exposeAnswer && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--surface-2, #fafafa)", borderLeft: "3px solid var(--accent, #0a66c2)", borderRadius: "0.3rem", fontSize: "0.9rem" }}>
            <strong>Justificativa:</strong> {current.rationale}
            {current.linkedToolSlug && (
              <div style={{ marginTop: "0.4rem" }}>
                <a href={`/ferramentas/${current.linkedToolSlug}`} style={{ color: "var(--accent, #0a66c2)" }}>Ver ferramenta vinculada →</a>
              </div>
            )}
          </div>
        )}

        {/* Navegação */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.25rem", gap: "0.5rem" }}>
          <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0} className="ce-btn ce-btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <ChevronLeftIcon size={14} /> Anterior
          </button>
          {currentIdx < session.questions.length - 1 ? (
            <button onClick={() => setCurrentIdx((i) => Math.min(session.questions.length - 1, i + 1))} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              Próxima <ChevronRightIcon size={14} />
            </button>
          ) : (
            <button onClick={handleFinish} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FlagIcon size={14} /> Ver nota
            </button>
          )}
        </div>
      </div>

      {/* Navegação por questões */}
      <div style={{ display: "flex", gap: "0.25rem", marginTop: "1rem", flexWrap: "wrap" }}>
        {session.questions.map((q, i) => {
          const isAnswered = session.answers[q.id] !== undefined;
          const isCurrent = i === currentIdx;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              style={{
                width: "2rem",
                height: "2rem",
                padding: 0,
                border: "1px solid " + (isCurrent ? "var(--accent, #0a66c2)" : "var(--border, #ccc)"),
                background: isCurrent ? "var(--accent, #0a66c2)" : isAnswered ? "var(--accent-soft, #e8f0fe)" : "transparent",
                color: isCurrent ? "white" : isAnswered ? "var(--accent, #0a66c2)" : "inherit",
                borderRadius: "0.2rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
              title={`Questão ${i + 1}${isAnswered ? " (respondida)" : ""}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Tela de resultado
// ============================================================

function ResultView({ result, deck, onRestart, onClose }: { result: QuizResult; deck: QuizDeck; onRestart: () => void; onClose: () => void }) {
  const passTone = result.passed ? "ok" : "danger";
  const passColor = result.passed ? "var(--success, #2e7d32)" : "var(--danger, #c0392b)";
  const passBg = result.passed ? "var(--success-soft, #e8f5e8)" : "var(--danger-soft, #fde8e8)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{deck.title}</h3>
        <button onClick={onClose} className="ce-btn ce-btn-ghost">Voltar</button>
      </div>

      {/* Card de nota */}
      <div style={{ border: `2px solid ${passColor}`, borderRadius: "0.5rem", padding: "1.25rem", background: passBg, marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", fontWeight: 700, color: passColor, lineHeight: 1 }}>
          {result.score}<span style={{ fontSize: "1.25rem", opacity: 0.6 }}>/100</span>
        </div>
        <div style={{ marginTop: "0.25rem", color: passColor, fontWeight: 600 }}>
          {result.passed ? "✓ APROVADO" : "✗ REPROVADO"} (corte: {deck.passing_score || 70}%)
        </div>
      </div>

      {/* Estatísticas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total" value={result.total} />
        <StatCard label="Acertos" value={result.correct} color="var(--success, #2e7d32)" />
        <StatCard label="Erros" value={result.wrong} color="var(--danger, #c0392b)" />
        <StatCard label="Em branco" value={result.blank} color="var(--muted, #888)" />
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--muted, #666)", marginBottom: "1.5rem" }}>
        Tempo gasto: {formatTime(result.timeSpentSeconds)}
      </div>

      {/* Revisão questão a questão */}
      <h4 style={{ marginTop: 0, fontSize: "1rem", marginBottom: "0.75rem" }}>Revisão</h4>
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
        {result.details.map((d, i) => (
          <li key={d.questionId} style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.4rem", padding: "0.75rem 1rem", background: "var(--surface, #fff)" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <span style={{ fontWeight: 600, color: d.isCorrect ? "var(--success, #2e7d32)" : d.userAnswer === null ? "var(--muted, #888)" : "var(--danger, #c0392b)", flexShrink: 0 }}>
                {i + 1}. {d.isCorrect ? "✓" : d.userAnswer === null ? "○" : "✗"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: "0.4rem" }}>{d.prompt}</div>
                <div style={{ fontSize: "0.85rem", display: "grid", gap: "0.2rem" }}>
                  {d.options.map((opt, idx) => {
                    const isCorrect = idx === d.correctAnswer;
                    const isUser = idx === d.userAnswer;
                    return (
                      <div key={idx} style={{
                        padding: "0.2rem 0.4rem",
                        borderRadius: "0.2rem",
                        background: isCorrect ? "var(--success-soft, #e8f5e8)" : isUser ? "var(--danger-soft, #fde8e8)" : "transparent",
                        color: isCorrect ? "var(--success, #2e7d32)" : isUser ? "var(--danger, #c0392b)" : "inherit",
                        fontWeight: isCorrect || isUser ? 600 : 400,
                      }}>
                        {String.fromCharCode(65 + idx)}) {opt}
                        {isCorrect && " ✓"}
                        {isUser && !isCorrect && " ✗ (sua resposta)"}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--muted, #555)", fontStyle: "italic" }}>
                  <strong>Justificativa:</strong> {d.rationale}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.5rem" }}>
        <button onClick={onRestart} className="ce-btn ce-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <RefreshCwIcon size={14} /> Refazer quiz
        </button>
        <button onClick={onClose} className="ce-btn ce-btn-ghost">Voltar para a lista</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ border: "1px solid var(--border, #e0e0e0)", borderRadius: "0.3rem", padding: "0.6rem", textAlign: "center", background: "var(--surface, #fff)" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: color || "inherit" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--muted, #666)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}
