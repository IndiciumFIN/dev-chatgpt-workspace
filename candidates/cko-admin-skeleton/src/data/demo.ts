import type { DependencyEdge } from '../lib/impact-engine.ts';
import type { Row } from '../lib/local-db.ts';

/** DADOS SINTÉTICOS de demonstração (todas as linhas levam synthetic:true e aparecem rotuladas).
 *  Não representam fornecedores, normas, páginas, revisores ou conteúdo clínico reais. */
const t = '2026-11-01T00:00:00.000Z';
const r = (id: string, v: Record<string, unknown>): Row => ({ id, synthetic: true, updatedAt: t, ...v });

export const demoCollections: Record<string, Row[]> = {
  apis: [
    r('API-001', { name: 'API de exemplo A', supplier: 'Fornecedor fictício 1', sourceType: 'api', method: 'GET', status: 'sombra', rights: 'licenciada', license: 'Termos fictícios', quotaMonthly: 1000, quotaUsed: 850, credentialLabel: 'chave-demo-A', credentialExpiresAt: '2026-11-20', schemaRef: 'schema://demo/a@1', dossierReviewedAt: '2026-10-15', owner: 'Equipe de conteúdo', dataClassification: 'public' }),
    r('API-002', { name: 'API de exemplo B', supplier: 'Fornecedor fictício 2', sourceType: 'api', method: 'GET', status: 'quarentena', rights: 'desconhecido', quotaMonthly: 500, quotaUsed: 40, credentialLabel: 'chave-demo-B', credentialExpiresAt: '2026-10-25', owner: 'Equipe de conteúdo' }),
  ],
  sources: [
    r('FONTE-001', { title: 'Norma de exemplo 1', issuer: 'Órgão fictício', kind: 'resolucao', jurisdiction: 'BR', edition: '2024', effectiveFrom: '2024-01-01', rights: 'livre', status: 'vigente' }),
    r('FONTE-002', { title: 'Norma de exemplo 2', issuer: 'Órgão fictício', kind: 'norma_tecnica', jurisdiction: 'BR', edition: '2019', effectiveFrom: '2019-01-01', rights: 'licenciada', status: 'revogada' }),
  ],
  pages: [
    r('PAG-001', { slug: 'exemplo-ferramenta-a', title: 'Ferramenta de exemplo A', lead: 'Página sintética para demonstrar o fluxo de publicação.', template: 'template.tool.http.v1', sourceIds: 'FONTE-001', status: 'homologada', include: true }),
    r('PAG-002', { slug: 'exemplo-ferramenta-b', title: 'Ferramenta de exemplo B', lead: 'Página sintética candidata, citando fonte revogada.', template: 'template.tool.http.v1', sourceIds: 'FONTE-002', status: 'candidata', include: true }),
  ],
  seo: [
    r('SEO-001', { route: '/ferramentas/exemplo-ferramenta-a', title: 'Ferramenta de exemplo A — demonstração', description: 'Descrição sintética com tamanho suficiente para passar na validação de metadados do console.', status: 'homologada', jsonldType: 'WebPage', noindex: false }),
    r('SEO-002', { route: '/ferramentas/exemplo-ferramenta-b', title: 'Ferramenta de exemplo B — candidata', description: 'Descrição sintética de página candidata, mantida fora do índice até a homologação humana.', status: 'candidata', jsonldType: 'WebPage', noindex: true }),
  ],
  media: [r('MID-001', { name: 'exemplo-hero.avif', format: 'avif', alt: 'Ilustração sintética de demonstração', license: 'Própria (fictícia)', usedIn: '/ferramentas/exemplo-ferramenta-a' })],
  redirects: [r('RED-001', { from: '/antiga-a', to: '/ferramentas/exemplo-ferramenta-a', code: '301', reason: 'Slug renomeado (demonstração)' })],
  controls: [
    r('CTL-001', { framework: 'ISO9001', ref: 'Cláusula a confirmar', title: 'Avaliação de fornecedores externos', owner: 'Governança', consulted: 'metadados_apenas', status: 'sem_prova' }),
    r('CTL-002', { framework: 'COSO', ref: 'Edição a confirmar', title: 'Segregação Maker/Checker/Auditor', owner: 'Governança', consulted: 'nao_consultado', status: 'lacuna' }),
  ],
  reviews: [r('REV-001', { objectRef: 'exemplo-ferramenta-a', author: 'Autor fictício', reviewer: 'Revisor fictício', competence: 'Competência fictícia (demo)', outcome: 'aprovado', decidedAt: '2026-09-01', validUntil: '2026-10-01', notes: 'Revisão sintética já vencida.' })],
  reftests: [
    r('TST-001', { formulaId: 'SINT-MG-PARA-G', description: '500 mg → 0,5 g', inputsJson: '{"mg": 500}', expected: 0.5, tolerance: 0.0001, unit: 'g' }),
    r('TST-002', { formulaId: 'SINT-REGRA-DE-TRES', description: 'Caso com valor esperado errado (demonstra falha)', inputsJson: '{"a": 2, "b": 3, "c": 4}', expected: 15, tolerance: 0.01, unit: 'un' }),
  ],
  atoms: [
    r('ATM-001', { sourceId: 'FONTE-001', locator: 'Art. 1º (sintético)', original: 'Texto original sintético do dispositivo.', extracted: 'Átomo sintético extraído do dispositivo.', status: 'pendente' }),
    r('ATM-002', { sourceId: 'FONTE-001', locator: 'Art. 2º (sintético)', original: 'Outro texto original sintético.', extracted: 'Outro átomo sintético.', status: 'pendente' }),
  ],
};

const n = (kind: DependencyEdge['source']['kind'], id: string, version: string) => ({ kind, id, version });
const e = (source: DependencyEdge['source'], dependent: DependencyEdge['source'], relation: DependencyEdge['relation'], extra: Partial<DependencyEdge> = {}): DependencyEdge =>
  ({ source, dependent, relation, status: 'validada', validatedBy: 'curador (demo)', validatedAt: '2026-10-01T00:00:00Z', ...extra });

export const demoEdges: DependencyEdge[] = [
  e(n('dispositivo', 'DISP-1', '1'), n('atomo_normativo', 'ATOMO-A', '1'), 'derivado_de'),
  e(n('dispositivo', 'DISP-1', '1'), n('atomo_normativo', 'ATOMO-B', '1'), 'derivado_de'),
  e(n('atomo_normativo', 'ATOMO-A', '1'), n('atomo_editorial', 'EDIT-1', '1'), 'explica'),
  e(n('atomo_editorial', 'EDIT-1', '1'), n('pagina', 'exemplo-ferramenta-a', '1'), 'compoe', { locale: 'pt-BR' }),
  e(n('atomo_editorial', 'EDIT-1', '1'), n('pagina', 'exemplo-ferramenta-a-en', '1'), 'compoe', { locale: 'en' }),
  e(n('atomo_normativo', 'ATOMO-B', '1'), n('formula', 'SINT-MG-PARA-G', '1'), 'usa_como_dado'),
  e(n('formula', 'SINT-MG-PARA-G', '1'), n('pagina', 'exemplo-ferramenta-b', '1'), 'usa_formula'),
  { ...e(n('dispositivo', 'DISP-1', '1'), n('pagina', 'pagina-sugerida', '1'), 'resume'), status: 'sugerida', validatedAt: undefined, validatedBy: undefined },
];

