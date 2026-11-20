/** Inventário canônico recuperado: “CKO Digital Schema Recovery & DesignOS Integration v2.1”
 *  (status RECOVERED_RECONCILIATION_CANDIDATE; validação estática dos schemas ≠ runtime/release PASS).
 *  Os 142 bindings ObjectFactory↔Component/TemplateMaster NÃO foram recuperados linha a linha e NÃO são
 *  reconstruídos aqui por inferência: o mapeamento abaixo é CANDIDATO e vale só para o console. */
export const canonicalComponents = [
  'component.global_shell', 'component.accessibility_bar', 'component.global_header', 'component.language_selector', 'component.global_footer', 'component.skip_link',
  'component.breadcrumbs', 'component.hero', 'component.page_index', 'component.local_discovery', 'component.filter_sidebar', 'component.results_toolbar',
  'component.result_collection', 'component.object_card', 'component.content_section', 'component.callout', 'component.data_table', 'component.sequence',
  'component.clinical_input_form', 'component.action_bar', 'component.result_panel', 'component.interpretation', 'component.progress', 'component.assessment_item',
  'component.evidence_panel', 'component.related_resources', 'component.visual_stage', 'component.deck_navigation', 'component.object_metadata', 'component.faq',
  'component.user_feedback', 'component.export_actions', 'component.print_profile', 'component.consent_gate', 'component.signoff', 'component.toast', 'component.offline_state',
] as const;

export const canonicalTemplates = [
  'template.home', 'template.hub', 'template.library_catalog', 'template.object', 'template.calculator', 'template.scale', 'template.document_tool', 'template.article',
  'template.training', 'template.institutional', 'template.printable_document', 'template.protocol', 'template.mock_exam', 'template.clinical_simulator', 'template.pocket_guide',
  'template.flashcards', 'template.mind_map', 'template.support_checklist', 'template.slide_presentation', 'template.clinical_case', 'template.infographic',
] as const;

export const digitalSchemas = ['component-master', 'template-master', 'object-factory-contract', 'digital-schema', 'visual-evidence', 'visual-asset', 'design-token-binding', 'ui-component', 'ui-pattern', 'ui-screen', 'responsive-layout', 'interaction-state', 'visual-validation', 'frontend-render-contract'] as const;

export type CanonicalId = (typeof canonicalComponents)[number];
export type Coverage = 'oficial' | 'candidato' | 'sem_equivalente';

/** Como cada peça do console se relaciona com os 37 componentes canônicos.
 *  oficial = cópia/uso do componente real do site; candidato = equivalente local a confirmar; sem_equivalente = lacuna. */
export const mapping: { canonical: CanonicalId; coverage: Coverage; consoleUse: string; note: string }[] = [
  { canonical: 'component.hero', coverage: 'oficial', consoleUse: 'ds/PageHero.tsx (cópia fiel de page-hero.tsx)', note: 'Markup oficial (inst-hero/inst-eyebrow/inst-lead). O CSS de .inst-hero não veio no zip: estilizado com os mesmos tokens do hero da home — confirmar.' },
  { canonical: 'component.skip_link', coverage: 'candidato', consoleUse: 'App: link “Ir para o conteúdo”', note: 'Comportamento equivalente; classe local.' },
  { canonical: 'component.breadcrumbs', coverage: 'candidato', consoleUse: 'ds/ui.tsx Breadcrumbs', note: 'Segue o contrato de itens do Breadcrumb do site (label, to/hash/href); o componente real não veio no zip.' },
  { canonical: 'component.global_shell', coverage: 'candidato', consoleUse: 'App Shell (sidebar + topbar + main)', note: 'Shell administrativo, não o shell público.' },
  { canonical: 'component.global_header', coverage: 'candidato', consoleUse: 'Topbar do console', note: 'Contexto, busca, ajuda, ambiente, alertas, perfil.' },
  { canonical: 'component.global_footer', coverage: 'candidato', consoleUse: 'Rodapé do console', note: 'Declara modo local e limites.' },
  { canonical: 'component.data_table', coverage: 'candidato', consoleUse: 'ds/DataTable.tsx', note: 'Com busca, filtros, ordenação e paginação.' },
  { canonical: 'component.filter_sidebar', coverage: 'candidato', consoleUse: 'Barra de busca/filtros do DataTable', note: 'Filtros visíveis e chips removíveis.' },
  { canonical: 'component.results_toolbar', coverage: 'candidato', consoleUse: 'Contagem com fonte + ordenação', note: '' },
  { canonical: 'component.result_collection', coverage: 'candidato', consoleUse: 'Lista de registros (tabela/cartões)', note: '' },
  { canonical: 'component.content_section', coverage: 'candidato', consoleUse: 'ds/ui.tsx Panel', note: '' },
  { canonical: 'component.callout', coverage: 'candidato', consoleUse: 'Aviso de escopo, resumo de erros, notas', note: '' },
  { canonical: 'component.sequence', coverage: 'candidato', consoleUse: 'Stepper, Timeline, fluxo da jornada', note: '' },
  { canonical: 'component.action_bar', coverage: 'candidato', consoleUse: 'Linhas de ações do Crud/Publicação', note: 'Ações protegidas usam DisabledAction.' },
  { canonical: 'component.object_metadata', coverage: 'candidato', consoleUse: 'KeyValue, SourceStamp', note: '' },
  { canonical: 'component.evidence_panel', coverage: 'candidato', consoleUse: 'Modo auditor / aba de auditoria do registro', note: '' },
  { canonical: 'component.signoff', coverage: 'candidato', consoleUse: 'Decisão de impacto e revisão clínica (Maker≠Checker)', note: '' },
  { canonical: 'component.toast', coverage: 'candidato', consoleUse: 'ds/ui.tsx ToastProvider', note: '' },
  { canonical: 'component.offline_state', coverage: 'candidato', consoleUse: 'Aviso de armazenamento em memória', note: 'Parcial.' },
  { canonical: 'component.export_actions', coverage: 'candidato', consoleUse: 'Exportar JSON (trilha, backup, pacote)', note: '' },
  { canonical: 'component.print_profile', coverage: 'candidato', consoleUse: '@media print do console', note: 'Parcial.' },
  { canonical: 'component.consent_gate', coverage: 'candidato', consoleUse: 'ConfirmDialog e confirmação de projeção local', note: 'Confirmação explícita, não consentimento do usuário final.' },
  { canonical: 'component.progress', coverage: 'candidato', consoleUse: 'Progresso do playbook e cota', note: 'Parcial.' },
  { canonical: 'component.accessibility_bar', coverage: 'sem_equivalente', consoleUse: '—', note: 'Foco colorido/dislexia do site não replicados; só o anel duplo (RFC-001).' },
  { canonical: 'component.language_selector', coverage: 'sem_equivalente', consoleUse: '—', note: 'A aba Idiomas administra locales; não há seletor.' },
  { canonical: 'component.page_index', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.local_discovery', coverage: 'sem_equivalente', consoleUse: '—', note: 'Há busca de módulos na topbar (candidato).' },
  { canonical: 'component.object_card', coverage: 'sem_equivalente', consoleUse: '—', note: 'Console usa tabelas; cartões só no mobile futuro.' },
  { canonical: 'component.clinical_input_form', coverage: 'sem_equivalente', consoleUse: '—', note: 'Escopo de calculadoras, não do console. RecordForm é formulário administrativo.' },
  { canonical: 'component.result_panel', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.interpretation', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.assessment_item', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.related_resources', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.visual_stage', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.deck_navigation', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.faq', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
  { canonical: 'component.user_feedback', coverage: 'sem_equivalente', consoleUse: '—', note: '' },
];
