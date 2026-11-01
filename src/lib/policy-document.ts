/** Forma interna da política. Espelha o núcleo público das cláusulas 5.2 e o ciclo do controle 5.1. Não é texto de norma. */

export const policySections = [
  { id: "proposito", label: "Propósito", hint: "Para que serve esta regra neste site." },
  { id: "objetivos", label: "Base dos objetivos", hint: "A frase da qual um objetivo futuro tem de nascer." },
  { id: "requisitos", label: "Requisitos", hint: "Lei, contrato ou regra interna que a política assume." },
  { id: "melhoria", label: "Melhoria", hint: "O que acontece quando a regra falha." },
  { id: "papeis", label: "Papéis", hint: "Quem escreve, quem aprova e quem aplica." },
  { id: "excecao", label: "Exceção", hint: "Quem pode abrir mão, por quanto tempo e onde fica o registro." },
  { id: "consequencia", label: "Consequência", hint: "O que ocorre se a regra não for seguida." },
  { id: "revisao", label: "Revisão", hint: "Prazo e o fato que obriga a rever fora do prazo." },
] as const;

export type PolicySectionId = (typeof policySections)[number]["id"];

export type PolicySections = Record<PolicySectionId, string>;

const empty = Object.fromEntries(policySections.map((section) => [section.id, ""])) as PolicySections;

export function emptyPolicy(): PolicySections {
  return { ...empty };
}

export function parsePolicyBody(body: string): { sections: PolicySections; legacy: string } {
  const sections = emptyPolicy();
  if (!body.includes("[[sec:")) return { sections, legacy: body.trim() };
  let current: PolicySectionId | null = null;
  const buckets: Record<string, string[]> = {};
  for (const line of body.split("\n")) {
    const mark = line.match(/^\[\[sec:([a-z]+)\]\]$/);
    if (mark && mark[1] in sections) {
      current = mark[1] as PolicySectionId;
      buckets[current] = [];
      continue;
    }
    if (current) buckets[current].push(line);
  }
  for (const section of policySections) sections[section.id] = (buckets[section.id] ?? []).join("\n").trim();
  return { sections, legacy: "" };
}

export function writePolicyBody(sections: PolicySections) {
  return policySections.map((section) => `[[sec:${section.id}]]\n${sections[section.id].trim()}`).join("\n");
}

export function policyGaps(sections: PolicySections) {
  return policySections.filter((section) => sections[section.id].trim().length === 0).map((section) => section.label);
}

export const policyCycle = [
  { id: "definida", label: "Definida", done: true },
  { id: "aprovada", label: "Aprovada", done: false },
  { id: "publicada", label: "Publicada", done: false },
  { id: "comunicada", label: "Comunicada", done: false },
  { id: "ciencia", label: "Ciência", done: false },
  { id: "revisao", label: "Revisão no prazo", done: false },
] as const;
