import type { FieldDef, Values } from '../lib/validate.ts';
import { master } from './master.ts';

export type Schema = {
  name: string; prefix: string; title: string; subtitle: string; fields: FieldDef[];
  /** Regras entre campos. */ rules?: (v: Values) => Record<string, string>;
  statusKey?: string; emptyHint: string;
};
type Errs = Record<string, string>;
const str = (v: Values, k: string) => (v[k] === undefined || v[k] === null ? '' : String(v[k]));

export const schemas: Record<string, Schema> = {
  apis: {
    name: 'apis', prefix: 'API', title: 'APIs e fornecedores de conteúdo', statusKey: 'status',
    subtitle: 'Dossiê do fornecedor, direitos de uso, cota e modo de entrada. Credenciais nunca são guardadas aqui.',
    emptyHint: 'Nenhuma API cadastrada. Todo conteúdo vindo de API entra em quarentena até revisão humana.',
    fields: [
      { key: 'name', label: 'Nome da API', type: 'text', required: true, minLen: 3, maxLen: 80, listColumn: true },
      { key: 'supplier', label: 'Fornecedor', type: 'text', required: true, listColumn: true },
      { key: 'sourceType', label: 'Tipo de fonte', type: 'select', required: true, options: master.sourceType },
      { key: 'method', label: 'Método principal', type: 'select', required: true, options: master.apiMethod },
      { key: 'status', label: 'Modo / situação', type: 'select', required: true, options: ['em_avaliacao', 'sombra', 'quarentena', 'ativa', 'suspensa'], listColumn: true, help: 'Sombra: roda em paralelo sem publicar. Quarentena: dados entram como candidatos.' },
      { key: 'rights', label: 'Direitos de uso', type: 'select', required: true, options: ['desconhecido', 'licenciada', 'livre', 'restrita'], listColumn: true },
      { key: 'license', label: 'Licença / termos (resumo)', type: 'text' },
      { key: 'termsUrl', label: 'Endereço dos termos', type: 'url' },
      { key: 'dataClassification', label: 'Classificação dos dados', type: 'select', options: master.dataClassification },
      { key: 'quotaMonthly', label: 'Cota mensal (chamadas)', type: 'number', min: 0 },
      { key: 'quotaUsed', label: 'Consumo no mês', type: 'number', min: 0 },
      { key: 'credentialLabel', label: 'Rótulo da credencial', type: 'text', noSecret: true, help: 'Só um rótulo (ex.: “chave-2026-A”). O valor fica no cofre do ambiente, nunca aqui.' },
      { key: 'credentialExpiresAt', label: 'Credencial expira em', type: 'date' },
      { key: 'schemaRef', label: 'Contrato de dados (referência)', type: 'text', help: 'Schema esperado; mudança de formato do fornecedor deve ser detectada antes de usar o dado.' },
      { key: 'dossierReviewedAt', label: 'Dossiê revisado em', type: 'date' },
      { key: 'owner', label: 'Responsável', type: 'text' },
      { key: 'notes', label: 'Observações', type: 'textarea', maxLen: 800 },
    ],
    rules: (v): Errs => {
      const e: Errs = {};
      if (str(v, 'status') === 'ativa') {
        if (str(v, 'rights') === 'desconhecido') e.rights = 'API ativa exige direitos de uso conhecidos.';
        if (!str(v, 'dossierReviewedAt')) e.dossierReviewedAt = 'API ativa exige dossiê revisado.';
      }
      if (Number(v.quotaUsed) > Number(v.quotaMonthly) && v.quotaMonthly !== undefined && v.quotaMonthly !== '') e.quotaUsed = 'Consumo acima da cota mensal.';
      return e;
    },
  },
  sources: {
    name: 'sources', prefix: 'FONTE', title: 'Fontes e normas', statusKey: 'status',
    subtitle: 'Identidade, edição, vigência e direitos. Registrar o que foi realmente consultado; não inferir cláusulas de metadados.',
    emptyHint: 'Nenhuma fonte cadastrada.',
    fields: [
      { key: 'title', label: 'Título', type: 'text', required: true, minLen: 3, listColumn: true },
      { key: 'issuer', label: 'Emissor', type: 'text', required: true, listColumn: true },
      { key: 'kind', label: 'Natureza', type: 'select', required: true, options: ['lei', 'resolucao', 'portaria', 'norma_tecnica', 'parecer', 'diretriz', 'outro'] },
      { key: 'jurisdiction', label: 'Jurisdição', type: 'text' },
      { key: 'edition', label: 'Edição / versão', type: 'text', required: true, listColumn: true },
      { key: 'effectiveFrom', label: 'Vigência início', type: 'date' },
      { key: 'effectiveTo', label: 'Vigência fim', type: 'date' },
      { key: 'rights', label: 'Direitos de uso', type: 'select', required: true, options: ['desconhecido', 'licenciada', 'livre', 'restrita'] },
      { key: 'status', label: 'Situação', type: 'select', required: true, options: ['candidata', 'em_revisao', 'vigente', 'revogada'], listColumn: true },
      { key: 'contentHash', label: 'SHA-256 do arquivo', type: 'text', pattern: /^[0-9a-f]{64}$/, patternMessage: '64 caracteres hexadecimais.' },
      { key: 'notes', label: 'Observações', type: 'textarea', maxLen: 800 },
    ],
    rules: (v): Errs => {
      const e: Errs = {};
      if (str(v, 'effectiveFrom') && str(v, 'effectiveTo') && str(v, 'effectiveTo') < str(v, 'effectiveFrom')) e.effectiveTo = 'Fim anterior ao início.';
      if (str(v, 'status') === 'vigente' && str(v, 'rights') === 'desconhecido') e.rights = 'Fonte vigente exige direitos de uso conhecidos.';
      return e;
    },
  },
  media: {
    name: 'media', prefix: 'MID', title: 'Biblioteca de mídia',
    subtitle: 'Metadados, texto alternativo e licença. Os arquivos em si ficam no repositório (AVIF).',
    emptyHint: 'Nenhuma mídia cadastrada.',
    fields: [
      { key: 'name', label: 'Arquivo', type: 'text', required: true, listColumn: true },
      { key: 'format', label: 'Formato', type: 'select', required: true, options: ['avif', 'webp', 'png', 'svg', 'pdf'] },
      { key: 'alt', label: 'Texto alternativo', type: 'textarea', required: true, minLen: 10, maxLen: 200, help: 'Obrigatório: descreve a imagem para leitor de tela.' },
      { key: 'license', label: 'Licença / autoria', type: 'text', required: true, listColumn: true },
      { key: 'usedIn', label: 'Usado em (rotas)', type: 'text', listColumn: true },
    ],
  },
  redirects: {
    name: 'redirects', prefix: 'RED', title: 'Redirecionamentos e slugs',
    subtitle: 'Evita link quebrado quando uma rota muda. Ciclos e redirecionamentos para si mesmo são bloqueados.',
    emptyHint: 'Nenhum redirecionamento.',
    fields: [
      { key: 'from', label: 'De', type: 'text', required: true, pattern: /^\/[\w\-/]*$/, patternMessage: 'Caminho começando com /.', listColumn: true },
      { key: 'to', label: 'Para', type: 'text', required: true, pattern: /^(\/[\w\-/]*|https:\/\/\S+)$/, patternMessage: 'Caminho (/…) ou https://…', listColumn: true },
      { key: 'code', label: 'Código', type: 'select', required: true, options: ['301', '302'], listColumn: true },
      { key: 'reason', label: 'Motivo', type: 'text', required: true, minLen: 5 },
    ],
    rules: (v): Errs => (str(v, 'from') && str(v, 'from') === str(v, 'to') ? { to: 'Destino igual à origem.' } : {}),
  },
  seo: {
    name: 'seo', prefix: 'SEO', title: 'SEO e JSON-LD por página', statusKey: 'status',
    subtitle: 'Metadados por rota, com validação de tamanho. Conteúdo candidato fica fora do índice (noindex).',
    emptyHint: 'Nenhuma página com metadados.',
    fields: [
      { key: 'route', label: 'Rota', type: 'text', required: true, pattern: /^\/[\w\-/]*$/, patternMessage: 'Caminho começando com /.', listColumn: true },
      { key: 'title', label: 'Título', type: 'text', required: true, minLen: 10, maxLen: 60, listColumn: true },
      { key: 'description', label: 'Descrição', type: 'textarea', required: true, minLen: 50, maxLen: 160 },
      { key: 'canonical', label: 'Canonical', type: 'url' },
      { key: 'jsonldType', label: 'Tipo JSON-LD', type: 'select', options: ['WebPage', 'Article', 'MedicalWebPage', 'SoftwareApplication', 'FAQPage'] },
      { key: 'status', label: 'Situação', type: 'select', required: true, options: ['candidata', 'homologada'], listColumn: true },
      { key: 'noindex', label: 'noindex', type: 'bool', help: 'Obrigatório para candidatas.' },
    ],
    rules: (v): Errs => (str(v, 'status') === 'candidata' && v.noindex !== true ? { noindex: 'Conteúdo candidato deve ficar noindex.' } : {}),
  },
  controls: {
    name: 'controls', prefix: 'CTL', title: 'Políticas, referenciais e controles', statusKey: 'status',
    subtitle: 'Mapa de controles internos a referenciais. Nunca declara “conforme” sem prova e avaliação.',
    emptyHint: 'Nenhum controle mapeado. Os rótulos de referencial, por si, não demonstram implementação.',
    fields: [
      { key: 'framework', label: 'Referencial', type: 'select', required: true, options: master.framework, listColumn: true },
      { key: 'ref', label: 'Edição / cláusula declarada', type: 'text', required: true, listColumn: true },
      { key: 'title', label: 'Controle interno', type: 'text', required: true, minLen: 5, listColumn: true },
      { key: 'owner', label: 'Responsável', type: 'text' },
      { key: 'consulted', label: 'Material consultado', type: 'select', required: true, options: ['nao_consultado', 'metadados_apenas', 'consultado_licenciado'] },
      { key: 'evidence', label: 'Evidência (referência)', type: 'text' },
      { key: 'status', label: 'Situação', type: 'select', required: true, options: ['sem_prova', 'em_avaliacao', 'evidenciado', 'lacuna'], listColumn: true },
    ],
    rules: (v): Errs => (str(v, 'status') === 'evidenciado' && (!str(v, 'evidence') || str(v, 'consulted') !== 'consultado_licenciado') ? { status: '“Evidenciado” exige evidência e material efetivamente consultado (licenciado).' } : {}),
  },
  reviews: {
    name: 'reviews', prefix: 'REV', title: 'Revisão clínica / técnica', statusKey: 'outcome',
    subtitle: 'Quem homologou, competência, validade. Maker ≠ Checker. Nenhuma revisão é inferida por IA.',
    emptyHint: 'Nenhuma revisão registrada: nada aqui está homologado.',
    fields: [
      { key: 'objectRef', label: 'Objeto revisado', type: 'text', required: true, listColumn: true, help: 'Ex.: slug da página, ID do átomo ou da fórmula.' },
      { key: 'author', label: 'Autor da mudança (Maker)', type: 'text', required: true },
      { key: 'reviewer', label: 'Revisor (Checker)', type: 'text', required: true, listColumn: true },
      { key: 'competence', label: 'Competência / registro profissional', type: 'text', required: true },
      { key: 'outcome', label: 'Resultado', type: 'select', required: true, options: ['pendente', 'aprovado', 'aprovado_com_ressalva', 'reprovado'], listColumn: true },
      { key: 'decidedAt', label: 'Decidido em', type: 'date' },
      { key: 'validUntil', label: 'Válido até', type: 'date', listColumn: true },
      { key: 'notes', label: 'Parecer', type: 'textarea', maxLen: 800 },
    ],
    rules: (v): Errs => {
      const e: Errs = {};
      if (str(v, 'author') && str(v, 'author').toLowerCase() === str(v, 'reviewer').toLowerCase()) e.reviewer = 'Maker não pode revisar a própria mudança.';
      if (['aprovado', 'aprovado_com_ressalva', 'reprovado'].includes(str(v, 'outcome')) && !str(v, 'decidedAt')) e.decidedAt = 'Informe a data da decisão.';
      if (str(v, 'decidedAt') && str(v, 'validUntil') && str(v, 'validUntil') < str(v, 'decidedAt')) e.validUntil = 'Validade anterior à decisão.';
      return e;
    },
  },
  reftests: {
    name: 'reftests', prefix: 'TST', title: 'Testes de referência de fórmulas', statusKey: 'lastResult',
    subtitle: 'Casos esperados por fórmula, executados antes de publicar. Fórmulas sintéticas validam o gate, não conteúdo clínico.',
    emptyHint: 'Nenhum caso de teste.',
    fields: [
      { key: 'formulaId', label: 'Fórmula', type: 'select', required: true, options: ['SINT-MG-PARA-G', 'SINT-REGRA-DE-TRES'], listColumn: true },
      { key: 'description', label: 'Descrição do caso', type: 'text', required: true, listColumn: true },
      { key: 'inputsJson', label: 'Entradas (JSON)', type: 'textarea', required: true, help: 'Ex.: {"mg": 500} ou {"a": 2, "b": 3, "c": 4}' },
      { key: 'expected', label: 'Valor esperado', type: 'number', required: true },
      { key: 'tolerance', label: 'Tolerância', type: 'number', required: true, min: 0 },
      { key: 'unit', label: 'Unidade', type: 'text', required: true },
    ],
    rules: (v): Errs => {
      try { const o = JSON.parse(str(v, 'inputsJson')); return o && typeof o === 'object' && !Array.isArray(o) ? {} : { inputsJson: 'Deve ser um objeto JSON.' }; }
      catch { return { inputsJson: 'JSON inválido.' }; }
    },
  },
  pages: {
    name: 'pages', prefix: 'PAG', title: 'Conteúdos (rascunho)', statusKey: 'status',
    subtitle: 'Rascunho editorial local. A publicação (projeção) é feita em “Revisão e publicação”.',
    emptyHint: 'Nenhuma página.',
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true, pattern: /^[a-z0-9][a-z0-9-]*$/, patternMessage: 'Minúsculas, números e hífen.', listColumn: true },
      { key: 'title', label: 'Título', type: 'text', required: true, minLen: 3, maxLen: 80, listColumn: true },
      { key: 'lead', label: 'Descrição curta', type: 'textarea', required: true, minLen: 10, maxLen: 400 },
      { key: 'template', label: 'Template', type: 'select', required: true, options: ['template.tool.http.v1', 'template.directory.v1', 'template.template.contract.v1'] },
      { key: 'sourceIds', label: 'Fontes declaradas (IDs, separados por vírgula)', type: 'text', help: 'Ex.: FONTE-001, FONTE-002' },
      { key: 'status', label: 'Situação', type: 'select', required: true, options: ['candidata', 'homologada'], listColumn: true },
      { key: 'include', label: 'Incluir na próxima publicação', type: 'bool' },
    ],
  },
};

schemas.atoms = {
  name: 'atoms', prefix: 'ATM', title: 'Extração e átomos', statusKey: 'status',
  subtitle: 'Revisão de extrações: texto original ao lado do átomo extraído. Nada é aceito automaticamente.',
  emptyHint: 'Nenhuma extração para revisar.',
  fields: [
    { key: 'sourceId', label: 'Fonte (ID)', type: 'text', required: true, listColumn: true },
    { key: 'locator', label: 'Localizador (artigo/seção/tabela)', type: 'text', required: true, listColumn: true },
    { key: 'original', label: 'Texto original', type: 'textarea', required: true, maxLen: 1200 },
    { key: 'extracted', label: 'Átomo extraído', type: 'textarea', required: true, maxLen: 1200 },
    { key: 'status', label: 'Situação', type: 'select', required: true, options: ['pendente', 'aceito', 'corrigido', 'rejeitado'], listColumn: true },
    { key: 'reviewNote', label: 'Nota de revisão', type: 'textarea', maxLen: 400 },
  ],
  rules: (v): Errs => (['corrigido', 'rejeitado'].includes(str(v, 'status')) && str(v, 'reviewNote').trim().length < 10 ? { reviewNote: 'Corrigir ou rejeitar exige nota (mín. 10 caracteres).' } : {}),
};
