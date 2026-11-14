export type Mode = 'derivado' | 'leitura' | 'local' | 'planejado';
export type Group = 'OPERAÇÃO' | 'GOVERNANÇA' | 'CONHECIMENTO' | 'PUBLICAÇÃO' | 'RISCO E EVIDÊNCIA' | 'SISTEMA';
export type ModuleDef = {
  id: string; label: string; hint: string; group: Group; icon: string; mode: Mode;
  /** De onde vem o dado exibido. */ source: string;
  /** O que NÃO está conectado (exibido ao usuário). */ limits: string;
};
export const MODE_LABEL: Record<Mode, string> = {
  derivado: 'Derivado de registros', leitura: 'Somente leitura · registro versionado', local: 'Local · neste navegador', planejado: 'Planejado · não conectado',
};
const NEEDS_BACKEND = 'Exige backend, identidade e autorização no servidor antes de qualquer mutação remota.';

export const modules: ModuleDef[] = [
  { id: 'overview', label: 'Painel', hint: 'O que exige atenção hoje', group: 'OPERAÇÃO', icon: 'LayoutDashboard', mode: 'derivado', source: 'PMO versionado + coleções locais', limits: 'Sem SLAs nem percentuais presumidos.' },
  { id: 'alerts', label: 'Alertas', hint: 'Pendências derivadas de registros', group: 'OPERAÇÃO', icon: 'Bell', mode: 'derivado', source: 'Regras sobre registros existentes', limits: 'Sem leitura/adiamento/resolução: exige eventos, prazos e persistência reais.' },
  { id: 'pmo', label: 'Ordens e PMO', hint: 'Fila versionada', group: 'OPERAÇÃO', icon: 'ListTodo', mode: 'leitura', source: 'registers/pmo/queue.v1.json', limits: 'Não cria nem atribui OS. ' + NEEDS_BACKEND },
  { id: 'agenda', label: 'Agenda', hint: 'Marcos e eventos registrados', group: 'OPERAÇÃO', icon: 'CalendarDays', mode: 'derivado', source: 'Eventos do PMO e datas cadastradas', limits: 'Prazos ausentes aparecem como “não definido”; sem SLAs aprovados.' },
  { id: 'playbooks', label: 'Playbooks', hint: 'Roteiros guiados', group: 'OPERAÇÃO', icon: 'BookMarked', mode: 'local', source: 'Texto de processo + progresso local', limits: 'Roteiro de apoio; não é política aprovada nem executa ações.' },
  { id: 'controls', label: 'Políticas e controles', hint: 'Referenciais e evidências', group: 'GOVERNANÇA', icon: 'ShieldCheck', mode: 'local', source: 'Coleção local', limits: 'Não declara conformidade; OPA/Kernel não conectados.' },
  { id: 'commander', label: 'Commander', hint: 'Preparação local, sem execução', group: 'GOVERNANÇA', icon: 'Bot', mode: 'local', source: 'Memória da página', limits: 'Não chama LLM, Kernel nem agentes; não cria OS; nada é salvo ou enviado.' },
  { id: 'reviews', label: 'Revisão clínica', hint: 'Homologação com validade', group: 'GOVERNANÇA', icon: 'Stethoscope', mode: 'local', source: 'Coleção local', limits: 'Registro declaratório sem verificação de identidade/competência.' },
  { id: 'reftests', label: 'Testes de referência', hint: 'Casos esperados por fórmula', group: 'GOVERNANÇA', icon: 'FlaskConical', mode: 'local', source: 'Coleção local + fórmulas sintéticas', limits: 'Fórmulas reais ainda não registradas; só mecanismo.' },
  { id: 'sources', label: 'Fontes e normas', hint: 'Proveniência e vigência', group: 'CONHECIMENTO', icon: 'BookOpenCheck', mode: 'local', source: 'Coleção local', limits: 'Sem ingestão, diff automático nem monitor de fontes.' },
  { id: 'apis', label: 'APIs e fornecedores', hint: 'Dossiê, cota e quarentena', group: 'CONHECIMENTO', icon: 'PlugZap', mode: 'local', source: 'Coleção local', limits: 'Não chama APIs; credenciais não são aceitas aqui (cofre do ambiente).' },
  { id: 'atoms', label: 'Extração e átomos', hint: 'Revisão original × extraído', group: 'CONHECIMENTO', icon: 'FileInput', mode: 'local', source: 'Coleção local', limits: 'Sem pipeline de extração conectado.' },
  { id: 'templates', label: 'Templates canônicos', hint: 'Inventário', group: 'CONHECIMENTO', icon: 'Layers3', mode: 'leitura', source: 'templateCatalog (catalog.ts)', limits: 'Não altera contratos.' },
  { id: 'media', label: 'Mídia', hint: 'Metadados e alt', group: 'CONHECIMENTO', icon: 'Image', mode: 'local', source: 'Coleção local', limits: 'Não envia nem processa arquivos.' },
  { id: 'pages', label: 'Conteúdos', hint: 'Rascunho editorial', group: 'PUBLICAÇÃO', icon: 'BookOpenText', mode: 'local', source: 'Coleção local', limits: 'Rascunho local.' },
  { id: 'publication', label: 'Revisão e publicação', hint: 'Dry-run, diff, rollback', group: 'PUBLICAÇÃO', icon: 'Rocket', mode: 'local', source: 'Projeção local versionada', limits: 'Projeção no navegador; não publica em produção. md_gate permanece fechado.' },
  { id: 'site', label: 'Configuração do site', hint: 'SEO, redirecionamentos, locales', group: 'PUBLICAÇÃO', icon: 'Globe2', mode: 'local', source: 'Coleções locais', limits: 'Não altera rotas reais nem sitemap de produção.' },
  { id: 'impact', label: 'Impacto e cobertura', hint: 'Grafo, simulador e decisão', group: 'RISCO E EVIDÊNCIA', icon: 'Network', mode: 'local', source: 'Motor determinístico + grafo local', limits: 'Grafo e eventos locais; sem fila durável nem OS criadas.' },
  { id: 'audit', label: 'Auditoria', hint: 'Trilha encadeada por hash', group: 'RISCO E EVIDÊNCIA', icon: 'GitBranch', mode: 'local', source: 'Trilha local (SHA-256 encadeado)', limits: 'Detecta adulteração local; não é auditoria imutável de servidor.' },
  { id: 'auditor', label: 'Modo auditor', hint: 'Pacote de evidência', group: 'RISCO E EVIDÊNCIA', icon: 'FileSearch', mode: 'derivado', source: 'Todos os registros locais', limits: 'Pacote não assinado; sem identidade.' },
  { id: 'ds', label: 'Design System', hint: '37 componentes e 21 templates canônicos', group: 'SISTEMA', icon: 'Layers3', mode: 'leitura', source: 'CKO Digital Schema Recovery v2.1 (candidato de reconciliação)', limits: 'Mapeamento candidato; 142 bindings não recuperados e não inferidos; runtime/release não verificados.' },
  { id: 'settings', label: 'Configurações e limites', hint: 'Flags, backup, ambiente', group: 'SISTEMA', icon: 'Settings', mode: 'local', source: 'Preferências locais', limits: 'Autenticação e banco travados em “desligado” por política.' },
  { id: 'profile', label: 'Perfil e sessão', hint: 'Sem identidade neste ambiente', group: 'SISTEMA', icon: 'UserRound', mode: 'planejado', source: '—', limits: NEEDS_BACKEND },
];
/** Rotas citadas pela documentação máster. null = não existe neste console e não deve ser inventada. */
export const DOC_ROUTE: Record<string, string | null> = {
  commander: 'commander',
  pmo: 'pmo',
  agents: null,
  rag: null,
  users: null,
  finops: null,
  webhooks: null,
  sources: 'sources',
  templates: 'templates',
};

export const groups: Group[] = ['OPERAÇÃO', 'GOVERNANÇA', 'CONHECIMENTO', 'PUBLICAÇÃO', 'RISCO E EVIDÊNCIA', 'SISTEMA'];


