/**
 * Motor determinístico de detecção de impacto (biblioteca pura, sem IO).
 *
 * Contrato (docs/PLANO-ADMINISTRACAO-GOVERNADA.md, "Detecção automática de impacto"):
 * - a fonte de verdade é o grafo de dependências EXPLÍCITO e versionado; busca textual/IA
 *   só gera sugestões, que NUNCA são percorridas aqui;
 * - nada é reescrito, publicado ou suspenso: o motor devolve candidatos com motivo e caminho;
 * - propagação idempotente: mesma chave (evento + versão + ativo) gera um único candidato;
 * - decisão de impacto é humana: `validateDecision` só valida o registro da decisão.
 *
 * Não é uma implantação do Kernel nem do OPA, e não há persistência/serviço de eventos
 * conectado. A matriz de severidade abaixo é PROPOSTA e precisa de aprovação dos donos.
 */

export type NodeKind =
  | 'normativo' | 'dispositivo' | 'atomo_normativo' | 'atomo_editorial'
  | 'formula' | 'template' | 'composicao' | 'pagina' | 'publicacao';

export type NodeRef = { kind: NodeKind; id: string; version: string };

export type RelationType =
  | 'derivado_de' | 'explica' | 'resume' | 'contrapoe' | 'usa_como_dado'
  | 'usa_template' | 'usa_formula' | 'compoe' | 'publica';

/** Aresta origem → dependente: `dependent` consome `source` na versão fixada em `source.version`. */
export type DependencyEdge = {
  source: NodeRef;
  dependent: NodeRef;
  relation: RelationType;
  /** Ausente = vale para todos os locales. */
  locale?: string;
  /** Só arestas validadas por humano entram na propagação. */
  status: 'validada' | 'sugerida';
  validatedBy?: string;
  validatedAt?: string;
  /** ISO. Fora da janela, a aresta não propaga. */
  validFrom?: string;
  validTo?: string;
};

export type ChangeClass =
  | 'metadados' | 'estrutura_apresentacao' | 'redacao_editorial' | 'requisito'
  | 'valor_dado' | 'formula' | 'aplicabilidade' | 'validade' | 'direitos_uso'
  | 'revogacao' | 'indeterminada';

export type Severity = 'baixa' | 'media' | 'alta' | 'critica';
export type ContentRisk = 'low' | 'medium' | 'high' | 'critical';

export type ChangeEvent = {
  eventId: string;
  /** Objeto alterado, já na NOVA versão. */
  object: NodeRef;
  previousVersion: string;
  changeClass: ChangeClass;
  /** Quem confirmou a classificação (obrigatório para classes de alto risco). */
  classifiedBy?: string;
  changedBy: string;
  changedAt: string;
};

export type ImpactCandidate = {
  idempotencyKey: string;
  eventId: string;
  asset: NodeRef;
  /** Do objeto alterado até o ativo, com a relação de cada salto. */
  path: { node: NodeRef; via: RelationType | null }[];
  severity: Severity;
  reason: string;
  locale?: string;
  state: 'impacto_em_analise';
  /** Bloqueia nova publicação dependente até decisão — não suspende conteúdo vigente. */
  blocksPublication: boolean;
  requiresHumanClassification: boolean;
};

const FIELD_CLASS: Record<string, ChangeClass> = {
  title: 'metadados', description: 'metadados', tags: 'metadados', slug_alias: 'metadados',
  layout: 'estrutura_apresentacao', slots: 'estrutura_apresentacao', template_fields: 'estrutura_apresentacao',
  text: 'redacao_editorial', summary: 'redacao_editorial', wording: 'redacao_editorial',
  requirement: 'requisito', obligation: 'requisito', contraindication: 'requisito',
  value: 'valor_dado', unit: 'valor_dado', range: 'valor_dado', threshold: 'valor_dado', table: 'valor_dado',
  formula: 'formula', rounding: 'formula', calc_logic: 'formula',
  population: 'aplicabilidade', applicability: 'aplicabilidade',
  effective_from: 'validade', effective_to: 'validade', status: 'validade',
  license: 'direitos_uso', usage_rights: 'direitos_uso',
  revoked: 'revogacao',
};
const CLASS_RANK: Record<ChangeClass, number> = {
  metadados: 0, estrutura_apresentacao: 1, redacao_editorial: 2, aplicabilidade: 3, validade: 3,
  direitos_uso: 3, requisito: 4, valor_dado: 5, formula: 5, revogacao: 6, indeterminada: 7,
};
const HIGH_RISK: ReadonlySet<ChangeClass> = new Set(['requisito', 'valor_dado', 'formula', 'aplicabilidade', 'validade', 'direitos_uso', 'revogacao', 'indeterminada']);

/**
 * Regra determinística: a classe mais grave entre os campos alterados vence. Campo desconhecido
 * vira `indeterminada` (exige classificação humana) — nunca é presumido "só metadados".
 */
export function classifyChange(changedFields: readonly string[]): ChangeClass {
  if (changedFields.length === 0) return 'indeterminada';
  let worst: ChangeClass = 'metadados';
  for (const field of changedFields) {
    const cls = FIELD_CLASS[field] ?? 'indeterminada';
    if (CLASS_RANK[cls] > CLASS_RANK[worst]) worst = cls;
  }
  return worst;
}

export type SeverityMatrix = { approved: boolean; version: string; rule: (input: SeverityInput) => Severity };
export type SeverityInput = { changeClass: ChangeClass; contentRisk: ContentRisk; touchesCalculation: boolean };

/** PROPOSTA inicial (`approved:false`); os donos de conteúdo/risco devem aprovar ou substituir. */
export const DEFAULT_SEVERITY_MATRIX: SeverityMatrix = {
  approved: false,
  version: 'proposta-0.1',
  rule({ changeClass, contentRisk, touchesCalculation }) {
    if (changeClass === 'revogacao') return 'critica';
    if (touchesCalculation && (changeClass === 'formula' || changeClass === 'valor_dado')) return 'critica';
    if (changeClass === 'indeterminada') return contentRisk === 'low' ? 'media' : 'alta';
    if (HIGH_RISK.has(changeClass)) return contentRisk === 'critical' ? 'critica' : 'alta';
    if (changeClass === 'redacao_editorial') return contentRisk === 'low' ? 'baixa' : 'media';
    return 'baixa';
  },
};

export type AnalyzeOptions = {
  matrix?: SeverityMatrix;
  /** Restringe a propagação a locales; ausente = todos. */
  locales?: readonly string[];
  /** Risco do conteúdo por ativo; padrão 'medium' quando desconhecido. */
  contentRiskOf?: (asset: NodeRef) => ContentRisk;
  maxDepth?: number;
};

const key = (n: NodeRef) => `${n.kind}:${n.id}@${n.version}`;
const idOnly = (n: NodeRef) => `${n.kind}:${n.id}`;

function edgeActive(edge: DependencyEdge, at: string): boolean {
  if (edge.status !== 'validada' || !edge.validatedAt) return false;
  const t = Date.parse(at);
  if (edge.validFrom && Date.parse(edge.validFrom) > t) return false;
  if (edge.validTo && Date.parse(edge.validTo) < t) return false;
  return true;
}

/** Sugestões não validadas que tocam o objeto alterado: expostas ao curador, não propagadas. */
export function pendingSuggestions(edges: readonly DependencyEdge[], event: ChangeEvent): DependencyEdge[] {
  return edges.filter(e => e.status === 'sugerida' && idOnly(e.source) === idOnly(event.object));
}

/**
 * Percorre o grafo validado a partir do objeto alterado. Um dependente só é candidato se ainda
 * consome uma versão diferente da nova (`source.version !== object.version`): quem já fixou a
 * versão nova não é afetado. Nos saltos seguintes, a aresta precisa partir da versão fixada
 * pelo dependente anterior. Ciclos são cortados pelo conjunto de visitados.
 */
export function analyzeImpact(edges: readonly DependencyEdge[], event: ChangeEvent, options: AnalyzeOptions = {}): ImpactCandidate[] {
  const matrix = options.matrix ?? DEFAULT_SEVERITY_MATRIX;
  const maxDepth = options.maxDepth ?? 12;
  const allowed = options.locales ? new Set(options.locales) : null;
  const requiresHuman = HIGH_RISK.has(event.changeClass) && !event.classifiedBy;
  const out = new Map<string, ImpactCandidate>();
  const visited = new Set<string>([key(event.object)]);
  type Frontier = { node: NodeRef; path: ImpactCandidate['path']; isOrigin: boolean };
  let frontier: Frontier[] = [{ node: event.object, path: [{ node: event.object, via: null }], isOrigin: true }];

  for (let depth = 0; depth < maxDepth && frontier.length; depth += 1) {
    const next: Frontier[] = [];
    for (const { node, path, isOrigin } of frontier) {
      for (const edge of edges) {
        if (idOnly(edge.source) !== idOnly(node) || !edgeActive(edge, event.changedAt)) continue;
        if (isOrigin ? edge.source.version === event.object.version : edge.source.version !== node.version) continue;
        if (edge.locale && allowed && !allowed.has(edge.locale)) continue;
        const dep = edge.dependent;
        const depKey = key(dep);
        if (visited.has(depKey)) continue;
        visited.add(depKey);
        const full = [...path, { node: dep, via: edge.relation }];
        const touchesCalculation = full.some(p => p.node.kind === 'formula') || dep.kind === 'formula';
        const severity = matrix.rule({ changeClass: event.changeClass, contentRisk: options.contentRiskOf?.(dep) ?? 'medium', touchesCalculation });
        const idem = `${event.eventId}|${event.object.id}@${event.object.version}|${depKey}`;
        if (dep.kind === 'pagina' || dep.kind === 'publicacao' || dep.kind === 'composicao' || dep.kind === 'formula' || dep.kind.startsWith('atomo') || dep.kind === 'template') {
          out.set(idem, {
            idempotencyKey: idem, eventId: event.eventId, asset: dep, path: full, severity,
            reason: `${event.changeClass}: ${idOnly(event.object)} ${event.previousVersion}→${event.object.version}; ${idOnly(dep)} ainda usa ${edge.source.version}.`,
            locale: edge.locale, state: 'impacto_em_analise', blocksPublication: severity === 'critica', requiresHumanClassification: requiresHuman,
          });
        }
        next.push({ node: dep, path: full, isOrigin: false });
      }
    }
    frontier = next;
  }
  return [...out.values()];
}

/** Mudança cosmética de baixo risco não abre análise por ativo (fica só no histórico). */
export function shouldAnalyze(event: ChangeEvent): boolean {
  return !(event.changeClass === 'metadados' && !!event.classifiedBy);
}

// ---- Eventos: idempotência, retentativa e falhas visíveis --------------------------------------

export type EventRecord = { eventId: string; state: 'processado' | 'falhou' | 'ignorado'; attempts: number; error?: string; candidates: string[] };
export type EventLedger = { events: Record<string, EventRecord>; candidates: Record<string, ImpactCandidate> };
export const emptyLedger = (): EventLedger => ({ events: {}, candidates: {} });

export type ProcessResult = { status: 'processado' | 'duplicado' | 'falhou' | 'ignorado'; created: ImpactCandidate[]; ledger: EventLedger };

/** Retorna um NOVO ledger. Reprocessar evento já `processado` é no-op; `falhou` pode ser retomado. */
export function processChangeEvent(ledger: EventLedger, edges: readonly DependencyEdge[], event: ChangeEvent, options: AnalyzeOptions = {}): ProcessResult {
  const prior = ledger.events[event.eventId];
  if (prior && (prior.state === 'processado' || prior.state === 'ignorado')) return { status: 'duplicado', created: [], ledger };
  const attempts = (prior?.attempts ?? 0) + 1;
  try {
    if (!shouldAnalyze(event)) {
      return { status: 'ignorado', created: [], ledger: { ...ledger, events: { ...ledger.events, [event.eventId]: { eventId: event.eventId, state: 'ignorado', attempts, candidates: [] } } } };
    }
    const found = analyzeImpact(edges, event, options);
    const created = found.filter(c => !(c.idempotencyKey in ledger.candidates));
    const candidates = { ...ledger.candidates };
    for (const c of created) candidates[c.idempotencyKey] = c;
    return { status: 'processado', created, ledger: { events: { ...ledger.events, [event.eventId]: { eventId: event.eventId, state: 'processado', attempts, candidates: found.map(c => c.idempotencyKey) } }, candidates } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 'falhou', created: [], ledger: { ...ledger, events: { ...ledger.events, [event.eventId]: { eventId: event.eventId, state: 'falhou', attempts, error: message, candidates: [] } } } };
  }
}

// ---- OS de triagem (rascunho) --------------------------------------------------------------------

export type TriageOrderDraft = { draftId: string; groupKey: string; owner: string; sourceRef: string; candidateKeys: string[]; severity: Severity; status: 'draft'; note: string };
const SEV_RANK: Record<Severity, number> = { baixa: 0, media: 1, alta: 2, critica: 3 };

/** Agrupa candidatos por responsável + origem. Só rascunho: criar a OS exige o fluxo governado. */
export function buildTriageDrafts(candidates: readonly ImpactCandidate[], ownerOf: (asset: NodeRef) => string | undefined): TriageOrderDraft[] {
  const groups = new Map<string, TriageOrderDraft>();
  for (const c of candidates) {
    const owner = ownerOf(c.asset) ?? 'SEM_RESPONSAVEL';
    const origin = c.path[0].node;
    const groupKey = `${c.eventId}|${owner}|${idOnly(origin)}`;
    const existing = groups.get(groupKey);
    if (existing) {
      if (!existing.candidateKeys.includes(c.idempotencyKey)) existing.candidateKeys.push(c.idempotencyKey);
      if (SEV_RANK[c.severity] > SEV_RANK[existing.severity]) existing.severity = c.severity;
    } else {
      groups.set(groupKey, { draftId: `triagem:${groupKey}`, groupKey, owner, sourceRef: key(origin), candidateKeys: [c.idempotencyKey], severity: c.severity, status: 'draft',
        note: owner === 'SEM_RESPONSAVEL' ? 'Ativo sem responsável cadastrado: atribuir antes de criar a OS.' : 'Rascunho; não é OS criada nem aprovação.' });
    }
  }
  return [...groups.values()];
}

// ---- Decisão humana -------------------------------------------------------------------------------

export type ImpactDecision = {
  candidateKey: string;
  outcome: 'impacta' | 'nao_impacta' | 'escalar' | 'incerto';
  reviewerId: string;
  /** Quem fez a mudança original: Maker ≠ Checker. */
  makerId: string;
  justification: string;
  evidenceRefs: string[];
  decidedAt: string;
};

export function validateDecision(candidate: ImpactCandidate, decision: ImpactDecision): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (decision.candidateKey !== candidate.idempotencyKey) errors.push('Decisão não corresponde ao candidato.');
  if (!decision.reviewerId.trim()) errors.push('Revisor obrigatório.');
  if (decision.reviewerId === decision.makerId) errors.push('Maker não pode decidir o próprio impacto (Maker ≠ Checker).');
  if (!Number.isFinite(Date.parse(decision.decidedAt))) errors.push('Data da decisão inválida.');
  const high = candidate.severity === 'alta' || candidate.severity === 'critica';
  const minLen = high ? 30 : 10;
  if (decision.justification.trim().length < minLen) errors.push(`Justificativa com pelo menos ${minLen} caracteres.`);
  if (high && decision.outcome === 'nao_impacta' && decision.evidenceRefs.length === 0) errors.push('"Não impacta" em severidade alta/crítica exige evidência.');
  if (candidate.requiresHumanClassification && decision.outcome === 'nao_impacta') errors.push('Classificação da mudança ainda não confirmada por humano.');
  return { ok: errors.length === 0, errors };
}

// ---- Cobertura (com denominadores explícitos) ------------------------------------------------------

export type CoverageReport = {
  publishedPages: number;
  pagesWithValidatedSource: number;
  pagesWithoutSource: string[];
  edgesTotal: number;
  suggestedEdgesPending: number;
  danglingEdges: number;
  /** Nunca um "100% rastreável" sem denominador: use os pares numerador/denominador acima. */
  note: string;
};

export function computeCoverage(publishedPageIds: readonly string[], edges: readonly DependencyEdge[], knownNodes: readonly NodeRef[]): CoverageReport {
  const known = new Set(knownNodes.map(key));
  const validated = edges.filter(e => e.status === 'validada' && !!e.validatedAt);
  const reach = new Set<string>();
  const byDependent = new Map<string, DependencyEdge[]>();
  for (const e of validated) byDependent.set(idOnly(e.dependent), [...(byDependent.get(idOnly(e.dependent)) ?? []), e]);
  const sourcesOf = (id: string, seen: Set<string>): boolean => {
    if (seen.has(id)) return false; seen.add(id);
    return (byDependent.get(id) ?? []).some(e => e.source.kind === 'normativo' || e.source.kind === 'dispositivo' || sourcesOf(idOnly(e.source), seen));
  };
  const withSource = publishedPageIds.filter(id => sourcesOf(`pagina:${id}`, new Set()));
  withSource.forEach(id => reach.add(id));
  return {
    publishedPages: publishedPageIds.length,
    pagesWithValidatedSource: withSource.length,
    pagesWithoutSource: publishedPageIds.filter(id => !reach.has(id)),
    edgesTotal: edges.length,
    suggestedEdgesPending: edges.filter(e => e.status === 'sugerida').length,
    danglingEdges: validated.filter(e => !known.has(key(e.source)) || !known.has(key(e.dependent))).length,
    note: 'Cobertura = páginas publicadas com cadeia validada até uma norma/dispositivo ÷ páginas publicadas. Páginas sem fonte declarada não contam como cobertas.',
  };
}
