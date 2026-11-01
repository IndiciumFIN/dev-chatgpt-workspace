/**
 * Motor de quiz/simulado.
 *
 * Implementa:
 *  - shuffle de questões e opções (com política SHUFFLE_ALL / SHUFFLE_KEEP_LAST / NO_SHUFFLE)
 *  - cronômetro (com limite opcional)
 *  - scoring (acertos, erros, em branco)
 *  - política de exposição da resposta (IMMEDIATE / ON_SUBMIT / ON_REVIEW / NEVER)
 *  - repetição espaçada para flashcards (sistema Leitner 7 caixas)
 *
 * Não tem estado React — é pura lógica reutilizável. A UI consome `QuizSession`
 * e `QuizResult`.
 */

import type {
  AnswerExposurePolicy,
  AssessmentItem,
  Flashcard,
  ShufflePolicy,
  SpacedRepetitionState,
} from "./types";

// ============================================================
// Shuffle helpers
// ============================================================

/**
 * Embaralha um array (Fisher-Yates). Devolve novo array sem mutar o original.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Aplica a política de shuffle às opções de uma questão.
 *
 *  - SHUFFLE_ALL: embaralha todas
 *  - SHUFFLE_KEEP_LAST: embaralha mantendo a última opção na última posição
 *  - NO_SHUFFLE: mantém ordem original
 *
 * Devolve um novo array com as opções embaralhadas E um mapa de índices
 * (originalIndex -> novoIndex) para rastrear qual alternativa é a correta.
 */
export function applyShufflePolicy(
  options: string[],
  policy: ShufflePolicy = "SHUFFLE_ALL",
  correctAnswerIndex: number,
): { options: string[]; correctNewIndex: number } {
  if (policy === "NO_SHUFFLE" || options.length <= 2) {
    return { options: [...options], correctNewIndex: correctAnswerIndex };
  }
  if (policy === "SHUFFLE_KEEP_LAST") {
    // Mantém a última no lugar
    const allButLast = options.slice(0, -1);
    const originalIdxCorrect = correctAnswerIndex < options.length - 1 ? correctAnswerIndex : -1;
    const shuffled = shuffle(allButLast);
    // Encontra a posição da opção correta no array embaralhado
    let correctNewIndex = -1;
    if (originalIdxCorrect >= 0) {
      correctNewIndex = shuffled.indexOf(options[originalIdxCorrect]);
    } else {
      // A correta era a última — permanece última
      correctNewIndex = options.length - 1;
    }
    return { options: [...shuffled, options[options.length - 1]], correctNewIndex };
  }
  // SHUFFLE_ALL
  const shuffled = shuffle(options);
  const correctNewIndex = shuffled.indexOf(options[correctAnswerIndex]);
  return { options: shuffled, correctNewIndex };
}

// ============================================================
// QuizSession — estado da execução
// ============================================================

export interface PreparedQuestion {
  /** ID canônico do item */
  id: string;
  /** Ordem apresentada ao usuário (0-based) */
  order: number;
  /** Texto do enunciado */
  prompt: string;
  /** Opções embaralhadas ou não */
  options: string[];
  /** Índice da alternativa correta no array `options` já embaralhado */
  correctIndex: number;
  /** Justificativa exibida na revisão */
  rationale: string;
  /** Política de exposição */
  exposure: AnswerExposurePolicy;
  /** Tempo estimado em segundos */
  estimatedSeconds?: number;
  /** Tópico */
  topic?: string;
  /** Slug da ferramenta vinculada */
  linkedToolSlug?: string;
}

export interface QuizSession {
  /** ID da sessão (gerado a cada início) */
  sessionId: string;
  /** ID do QuizDeck */
  deckId: string;
  /** Questões preparadas (já embaralhadas se aplicável) */
  questions: PreparedQuestion[];
  /** Respostas do usuário: questionId -> índice selecionado */
  answers: Record<string, number>;
  /** Momento de início (ms epoch) */
  startedAt: number;
  /** Tempo limite em segundos (0 = sem limite) */
  timeLimitSeconds: number;
  /** Indica se a sessão foi finalizada */
  finished: boolean;
  /** Motivo do fim: 'submit' | 'timeout' | 'manual' */
  finishedReason?: "submit" | "timeout" | "manual";
}

export interface QuizResult {
  sessionId: string;
  total: number;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  /** Nota 0-100 */
  score: number;
  /** Aprovado se score >= passingScore */
  passed: boolean;
  /** Tempo total gasto em segundos */
  timeSpentSeconds: number;
  /** Detalhe por questão */
  details: Array<{
    questionId: string;
    prompt: string;
    userAnswer: number | null;
    correctAnswer: number;
    options: string[];
    isCorrect: boolean;
    rationale: string;
    topic?: string;
  }>;
}

// ============================================================
// Preparação da sessão
// ============================================================

/**
 * Prepara uma sessão de quiz a partir de uma lista de AssessmentItems.
 * Aplica shuffle de questões (se `shuffleItems=true`) e shuffle de opções
 * (conforme `shuffleOptions` e a `shuffle_policy` de cada item).
 */
export function prepareQuizSession(
  deckId: string,
  items: AssessmentItem[],
  options: {
    shuffleItems?: boolean;
    shuffleOptions?: boolean;
    timeLimitSeconds?: number;
    defaultExposure?: AnswerExposurePolicy;
  } = {},
): QuizSession {
  const { shuffleItems = true, shuffleOptions = true, timeLimitSeconds = 0, defaultExposure = "ON_SUBMIT" } = options;

  // 1. Embaralha questões (mantém IDs canônicos para rastreio)
  const orderedItems = shuffleItems ? shuffle(items) : [...items];

  // 2. Prepara cada questão
  const questions: PreparedQuestion[] = orderedItems.map((item, order) => {
    const shouldShuffleOptions = shuffleOptions && (item.shuffle_policy || "SHUFFLE_ALL") !== "NO_SHUFFLE";
    const policy: ShufflePolicy = shouldShuffleOptions ? (item.shuffle_policy || "SHUFFLE_ALL") : "NO_SHUFFLE";
    const { options: preparedOptions, correctNewIndex } = applyShufflePolicy(
      item.prompt_options,
      policy,
      item.correct_answer_index,
    );

    return {
      id: item.canonical_id,
      order,
      prompt: item.prompt_key,
      options: preparedOptions,
      correctIndex: correctNewIndex,
      rationale: item.rationale_text,
      exposure: item.answer_exposure_policy || defaultExposure,
      estimatedSeconds: item.estimated_time_seconds,
      topic: item.topic,
      linkedToolSlug: item.linked_tool_slug,
    };
  });

  return {
    sessionId: `QS-${Date.now().toString(36).toUpperCase()}`,
    deckId,
    questions,
    answers: {},
    startedAt: Date.now(),
    timeLimitSeconds,
    finished: false,
  };
}

// ============================================================
// Interação com a sessão
// ============================================================

/** Registra a resposta do usuário a uma questão. */
export function answerQuestion(session: QuizSession, questionId: string, optionIndex: number): QuizSession {
  if (session.finished) return session;
  return { ...session, answers: { ...session.answers, [questionId]: optionIndex } };
}

/** Limpa a resposta de uma questão. */
export function clearAnswer(session: QuizSession, questionId: string): QuizSession {
  if (session.finished) return session;
  const next = { ...session.answers };
  delete next[questionId];
  return { ...session, answers: next };
}

/** Finaliza a sessão (manualmente ou por timeout). */
export function finishSession(session: QuizSession, reason: "submit" | "timeout" | "manual" = "submit"): QuizSession {
  return { ...session, finished: true, finishedReason: reason };
}

/** Calcula o resultado da sessão. */
export function computeResult(session: QuizSession, passingScore = 70): QuizResult {
  const total = session.questions.length;
  let correct = 0;
  let answered = 0;
  const details: QuizResult["details"] = [];

  for (const q of session.questions) {
    const userAnswer = session.answers[q.id] ?? null;
    if (userAnswer !== null) answered++;
    const isCorrect = userAnswer === q.correctIndex;
    if (isCorrect) correct++;
    details.push({
      questionId: q.id,
      prompt: q.prompt,
      userAnswer,
      correctAnswer: q.correctIndex,
      options: q.options,
      isCorrect,
      rationale: q.rationale,
      topic: q.topic,
    });
  }

  const wrong = answered - correct;
  const blank = total - answered;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeSpentSeconds = Math.round((Date.now() - session.startedAt) / 1000);

  return {
    sessionId: session.sessionId,
    total,
    answered,
    correct,
    wrong,
    blank,
    score,
    passed: score >= passingScore,
    timeSpentSeconds,
    details,
  };
}

// ============================================================
// Política de exposição
// ============================================================

/**
 * Indica se a resposta correta de uma questão pode ser exibida no momento atual.
 */
export function canExposeAnswer(
  question: PreparedQuestion,
  session: QuizSession,
): boolean {
  switch (question.exposure) {
    case "IMMEDIATE":
      return session.answers[question.id] !== undefined;
    case "ON_SUBMIT":
      return session.finished;
    case "ON_REVIEW":
      return session.finished && session.finishedReason === "submit";
    case "NEVER":
      return false;
  }
}

// ============================================================
// Cronômetro
// ============================================================

/** Tempo restante em segundos (0 se sem limite). */
export function remainingSeconds(session: QuizSession): number {
  if (session.timeLimitSeconds === 0) return 0;
  const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
  return Math.max(0, session.timeLimitSeconds - elapsed);
}

/** Formata segundos como MM:SS. */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ============================================================
// Repetição espaçada (Leitner 7 caixas)
// ============================================================

/**
 * Intervalos por caixa (em dias) no sistema Leitner.
 * Caixa 1: revisar todo dia
 * Caixa 2: a cada 2 dias
 * Caixa 3: a cada 4 dias
 * Caixa 4: a cada 8 dias
 * Caixa 5: a cada 16 dias
 * Caixa 6: a cada 32 dias
 * Caixa 7: dominado (revisar mensalmente)
 */
export const LEITNER_INTERVALS_DAYS = [1, 2, 4, 8, 16, 32, 30];

/**
 * Atualiza o estado de repetição espaçada após uma revisão.
 *
 * - Acertou: avança 1 caixa (máx 7)
 * - Errou: volta para caixa 1
 */
export function updateSpacedRepetition(
  state: SpacedRepetitionState | undefined,
  success: boolean,
): SpacedRepetitionState {
  const current = state || { box: 1, success_count: 0, fail_count: 0 };
  const today = new Date().toISOString().slice(0, 10);

  if (success) {
    const newBox = Math.min(7, current.box + 1);
    const intervalDays = LEITNER_INTERVALS_DAYS[newBox - 1];
    const next = new Date();
    next.setDate(next.getDate() + intervalDays);
    return {
      box: newBox,
      last_reviewed_at: today,
      next_review_at: next.toISOString().slice(0, 10),
      success_count: current.success_count + 1,
      fail_count: current.fail_count,
    };
  }

  return {
    box: 1,
    last_reviewed_at: today,
    next_review_at: today, // rever amanhã
    success_count: current.success_count,
    fail_count: current.fail_count + 1,
  };
}

/**
 * Verifica se um flashcard está pronto para revisão (next_review_at <= hoje).
 */
export function isDueForReview(card: Flashcard): boolean {
  const next = card.spaced_repetition_state?.next_review_at;
  if (!next) return true; // nunca revisado = pronto
  const today = new Date().toISOString().slice(0, 10);
  return next <= today;
}

/**
 * Ordena flashcards por prioridade de revisão (vencidos primeiro, depois por caixa menor).
 */
export function sortFlashcardsByDue(cards: Flashcard[]): Flashcard[] {
  return [...cards].sort((a, b) => {
    const aDue = isDueForReview(a);
    const bDue = isDueForReview(b);
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    // Ambos vencidos ou ambos não vencidos: ordena por caixa
    const aBox = a.spaced_repetition_state?.box || 1;
    const bBox = b.spaced_repetition_state?.box || 1;
    return aBox - bBox;
  });
}
