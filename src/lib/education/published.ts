import type { AssessmentItem, Flashcard, Simulado } from "./types";

/** Banco publicado neste repositório. As provas de 50 questões não estão na fonte. */

const base = {
  schema_version: "0.1.0" as const,
  version: "1.0.0",
  status: "CANDIDATE" as const,
  updated_at: "2026-11-01",
  provenance_refs: ["secao:simulados"],
};

export const visitQuestions: { prompt: string; options: string[]; answer: number }[] = [
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

export const visitCards: { front: string; back: string }[] = [
  { front: "Braden", back: "De 6 a 23. Quanto menor o escore, maior o risco de lesão por pressão." },
  { front: "Morse", back: "Até 24 é risco baixo. De 25 a 44, médio. A partir de 45, alto." },
  { front: "Apgar", back: "O minuto da avaliação não entra na soma. De 7 a 10 é boa vitalidade neste template." },
  { front: "Gotejamento", back: "Gotas por minuto = (volume em mL × fator do equipo) ÷ tempo em minutos." },
  { front: "Equipo", back: "Macrogotas usa fator 20. Microgotas usa fator 60. Trocar o equipo exige novo cálculo." },
  { front: "IMC adulto", back: "Peso em kg dividido pela altura em metros ao quadrado. Não use a faixa adulta em criança." },
];

export const publishedItems: AssessmentItem[] = visitQuestions.map((question, index) => ({
  ...base,
  canonical_id: `SIM-PUB-${index + 1}`,
  learning_objective_ref: "secao:simulados",
  prompt_key: question.prompt,
  answer_key_ref: question.options[question.answer],
  rationale_claim_refs: [],
  evidence_refs: [],
  scoring_rule_ref: "one-correct",
  difficulty_source_ref: "template",
  item_type: "MULTIPLE_CHOICE",
  prompt_options: question.options,
  correct_answer_index: question.answer,
  rationale_text: question.options[question.answer],
  topic: "instrumentos",
  subject: "enfermagem",
}));

export const publishedCards: Flashcard[] = visitCards.map((card, index) => ({
  ...base,
  canonical_id: `FC-PUB-${index + 1}`,
  learning_objective_ref: "secao:simulados",
  front_text: card.front,
  back_text: card.back,
  rationale_claim_refs: [],
  evidence_refs: [],
  topic: "instrumentos",
  subject: "enfermagem",
}));

export const publishedSimulado: Simulado = {
  ...base,
  canonical_id: "SIM-PUB-TREINO",
  title: "Treino dos instrumentos no ar",
  description: "As cinco questões publicadas na seção Simulados. As provas de 50 questões não estão neste repositório.",
  item_refs: publishedItems.map((item) => item.canonical_id),
  time_limit_seconds: 4 * 60,
  shuffle_items: false,
  shuffle_options: false,
  default_answer_exposure: "ON_SUBMIT",
  passing_score: 60,
  banca: "Calculadoras de Enfermagem",
  cargo: "Enfermagem",
};
