import type { DeskModule } from "./normative-desk";

/** Catálogo da branch de auditoria, ligado só à mesa que esta área já lê. Sem mesa, não há registro. */

export type AdminGroupId = "G01" | "G02" | "G03" | "G04" | "G05" | "G06" | "G07";
export type AdminModuleId =
  | "M01" | "M02" | "M03" | "M04" | "M05" | "M06" | "M07" | "M08" | "M09" | "M10" | "M11"
  | "M12" | "M13" | "M14" | "M15" | "M16" | "M17" | "M18" | "M19" | "M20" | "M21" | "M22";

export type AdminFocus = "paginas" | "idiomas" | "visual" | "agentes";

export type AdminModule = {
  id: AdminModuleId;
  group: AdminGroupId;
  title: string;
  purpose: string;
  submodules: readonly string[];
  receives: readonly AdminModuleId[];
  sends: readonly AdminModuleId[];
  desk: DeskModule | null;
  focus?: AdminFocus;
  ops?: { kinds: readonly string[]; statuses: readonly string[] };
  orders?: boolean;
  screen: string;
};

export const adminGroups: readonly { id: AdminGroupId; title: string; description: string }[] = [
  { id: "G01", title: "Estratégia e governança", description: "Diretrizes, políticas e normas que esta mesa já consegue abrir." },
  { id: "G02", title: "Gestão e execução", description: "Ordem de trabalho gravada na mesa. Não há quadro kanban." },
  { id: "G03", title: "Dados e conhecimento", description: "Tabelas, dicionário, fila de origem e especificações." },
  { id: "G04", title: "Produtos e experiência", description: "Instrumento, página, idioma e token que já estão no banco." },
  { id: "G05", title: "Relacionamento", description: "Pessoa, papel e campanha gravada nesta mesa." },
  { id: "G06", title: "Tecnologia e operações", description: "Central de comando e agentes. Deploy não sai daqui." },
  { id: "G07", title: "Qualidade e auditoria", description: "Teste, portão e achado gravados como registro. Não roda a suíte." },
];

export const adminModules: readonly AdminModule[] = [
  { id: "M01", group: "G01", title: "Painel executivo e visão integrada", purpose: "Consolidar indicadores verificáveis, riscos e decisões pendentes sem estimar conclusão.", submodules: ["Visão institucional", "Indicadores derivados", "Gates e bloqueios", "Painel de decisões", "Cobertura por módulo", "Relatórios executivos"], receives: ["M03", "M14", "M20", "M21"], sends: ["M02", "M04"], desk: null, screen: "A visão geral lista os módulos. Não é telemetria ao vivo nem autorização de mudança." },
  { id: "M02", group: "G01", title: "Estratégia e planejamento", purpose: "Definir objetivos, prioridades, metas e planejamento.", submodules: ["Objetivos e metas", "Portfólio estratégico", "Roadmap", "Orçamento e indicadores", "Desempenho"], receives: ["M04", "M17"], sends: ["M03", "M22"], desk: null, ops: { kinds: ["Objetivo", "Meta", "Marco"], statuses: ["Rascunho", "Ativo", "Cumprido"] }, screen: "Cria, filtra e grava objetivo, meta e marco. Não mede indicador externo." },
  { id: "M03", group: "G02", title: "PMO e projetos", purpose: "Controlar trabalhos autorizados, fila, dependências e ordens.", submodules: ["Portfólio de projetos", "Programas e waves", "Backlog e tarefas", "Work Orders", "Kanban e calendário", "Dependências e checkpoints", "Handoffs"], receives: ["M02", "M04", "M14", "M21"], sends: ["M05", "M06", "M08", "M15", "M16", "M19"], desk: null, orders: true, screen: "Grava a ordem na mesma tabela da Central. Não há quadro kanban e o portão nasce fechado." },
  { id: "M04", group: "G01", title: "Governança, riscos e compliance", purpose: "Administrar política, risco, controle e decisão com versão.", submodules: ["Governança corporativa", "Processos e políticas", "Riscos e controles", "Matriz RCM", "Decisões e exceções", "COSO/COBIT"], receives: ["M02", "M17", "M21"], sends: ["M03", "M05", "M14", "M19", "M20"], desk: "politicas", screen: "Abre o texto da política, o ciclo e a aprovação registrada. Não certifica ISO." },
  { id: "M05", group: "G03", title: "Arquitetura e metamodelo", purpose: "Prover entidade, contrato, schema e dicionário desta mesa.", submodules: ["Entidades e relacionamentos", "Schemas e contratos", "Dicionário de dados", "Tipos e taxonomias", "Master data", "Revisões de arquitetura"], receives: ["M04", "M03"], sends: ["M06", "M07", "M08", "M09", "M10"], desk: "modelo", screen: "Lista a tabela que o metamodelo declara e a coluna do dicionário. Aprovar o parecer não cria tabela." },
  { id: "M06", group: "G03", title: "Fontes e ingestão", purpose: "Controlar origem, aquisição e tratamento locais.", submodules: ["Fontes e licenças", "Importação em lote", "Conectores", "Extração e normalização", "Lineage", "Quarentena e duplicidade", "Reconciliação"], receives: ["M05", "M17"], sends: ["M07", "M18"], desk: "fila", screen: "Mostra a fila local de extração, linhagem e átomo. Não baixa PDF." },
  { id: "M07", group: "G03", title: "Kernel e conhecimento", purpose: "Gerenciar especificação que espera aprovação. Não admite átomo de norma.", submodules: ["Átomos e evidências", "Claims e regras", "Ontologias", "Proveniência", "Versionamento", "Gates de admissão"], receives: ["M05", "M06", "M04"], sends: ["M18", "M08", "M09"], desk: "dados", screen: "Característica em rascunho ou aprovada por quem clicou. Não admite átomo de norma." },
  { id: "M08", group: "G04", title: "Produtos e ferramentas", purpose: "Administrar a capa do instrumento já catalogado.", submodules: ["Catálogo de produtos", "Calculadoras", "Simulados", "Pesquisa acadêmica", "Carreiras e educação", "Bibliotecas"], receives: ["M07", "M18", "M10"], sends: ["M14", "M15"], desk: "instrumentos", screen: "Edita título, resumo e se aparece no ar. A fórmula não muda aqui." },
  { id: "M09", group: "G04", title: "Conteúdo e editorial", purpose: "Abrir página e peça que a fonte já publicou.", submodules: ["Artigos e guias", "Protocolos e publicações", "Revisão editorial", "Citações e direitos", "Dossiês de conteúdo"], receives: ["M07", "M18", "M10"], sends: ["M11", "M08", "M14"], desk: "conteudo", focus: "paginas", screen: "Página de seção e instrumento com rota. Não é um editor de artigo." },
  { id: "M10", group: "G04", title: "Design system e interfaces", purpose: "Ler contrato de template e token já guardados.", submodules: ["Design tokens", "Componentes e versões", "Templates e slots", "Iconografia e ativos", "Builder e páginas", "Pré-visualização"], receives: ["M05", "M04"], sends: ["M08", "M09", "M11"], desk: "sistema", focus: "visual", screen: "Contrato e token lidos do banco. Não cria componente novo." },
  { id: "M11", group: "G04", title: "Internacionalização e acessibilidade", purpose: "Abrir rótulo por idioma já guardado.", submodules: ["Idiomas e tradução", "Traduções de conteúdos", "Localização por país", "WCAG e eMAG", "Tecnologias assistivas", "Revisão por idioma"], receives: ["M09", "M10"], sends: ["M08", "M14"], desk: "conteudo", focus: "idiomas", screen: "Abre a mesa de idiomas. Não traduz o texto clínico que ainda está em português." },
  { id: "M12", group: "G05", title: "Usuários e assinaturas", purpose: "Governar pessoa e papel já gravados nesta mesa.", submodules: ["Perfis e papéis", "Permissões", "Planos e assinaturas", "Direitos de acesso", "Preferências", "Consentimentos"], receives: ["M20", "M22"], sends: ["M13"], desk: "pessoas", screen: "Troca o papel de quem já entrou. Não cobra assinatura nem verifica sessão externa." },
  { id: "M13", group: "G05", title: "Marketing e inteligência", purpose: "Registrar campanha e página. Não mede audiência.", submodules: ["SEO", "Campanhas", "Analytics", "Funis e conversão", "Retenção", "Satisfação e feedback"], receives: ["M12", "M15"], sends: ["M02", "M03"], desk: null, ops: { kinds: ["Campanha", "Página"], statuses: ["Rascunho", "No ar", "Encerrada"] }, screen: "Grava campanha e página. Não lê visita nem funil externo." },
  { id: "M14", group: "G07", title: "Qualidade, testes e homologação", purpose: "Registrar teste e portão informados. Não executa a suíte.", submodules: ["Testes unitários", "Integração e E2E", "Acessibilidade", "Testes clínicos", "Validação técnica", "Homologações e gates"], receives: ["M04", "M08", "M11", "M18", "M20"], sends: ["M15", "M03", "M21"], desk: null, ops: { kinds: ["Teste", "Portão"], statuses: ["Aberto", "Passou", "Falhou"] }, screen: "Grava o resultado que você informar. Não executa a suíte." },
  { id: "M15", group: "G06", title: "Publicação e distribuição", purpose: "Registrar release e ambiente. Não publica fora deste banco.", submodules: ["Releases", "Ambientes", "Promoções", "Publicação", "Deploy e rollback", "Canais"], receives: ["M14", "M08", "M20"], sends: ["M16", "M13"], desk: null, ops: { kinds: ["Release", "Ambiente"], statuses: ["Candidato", "Publicado", "Revertido"] }, screen: "Grava release e ambiente. Não faz deploy." },
  { id: "M16", group: "G06", title: "Infraestrutura e automações", purpose: "Consultar ordem, corrida e canal da central.", submodules: ["Integrações e APIs", "Pipelines", "Filas e execuções", "Telemetria", "Backups e restauração", "Disponibilidade"], receives: ["M15", "M19", "M20"], sends: ["M03", "M20"], desk: "inicio", screen: "Consulta não publica. Executar só habilita com a ordem pronta e o portão aberto." },
  { id: "M17", group: "G01", title: "Gestão normativa e obrigações", purpose: "Manter metadado da norma, sem a cláusula.", submodules: ["Normativos e versões", "Jurisdição e vigência", "Requisitos", "Aplicabilidade", "Obrigações", "Análise de lacunas"], receives: ["M21"], sends: ["M04", "M06", "M18"], desk: "normas", screen: "Nome, domínio e direito. O texto da cláusula não está nesta mesa." },
  { id: "M18", group: "G03", title: "Governança clínica e segurança", purpose: "Registrar revisão de fórmula e população. Não altera a conta.", submodules: ["Validação de fórmulas", "Populações-alvo", "Testes clínicos de referência", "Revisões especializadas", "Alertas de segurança", "Regulação de software"], receives: ["M06", "M07", "M17"], sends: ["M08", "M09", "M14"], desk: null, ops: { kinds: ["Revisão", "População"], statuses: ["Pendente", "Conferida", "Bloqueada"] }, screen: "Mostra a fórmula já gravada e guarda a revisão. Não altera a conta." },
  { id: "M19", group: "G06", title: "Governança de IA e agentes", purpose: "Listar agente desbloqueado para a tarefa, fora do menu público.", submodules: ["Modelos e provedores", "Catálogo de agentes", "Prompts versionados", "Ferramentas autorizadas", "Avaliações", "Limites e supervisão"], receives: ["M03", "M04", "M20"], sends: ["M16", "M14"], desk: "sistema", focus: "agentes", screen: "Lista o agente e o estado. Não dispara modelo." },
  { id: "M20", group: "G06", title: "Segurança, privacidade e continuidade", purpose: "Registrar acesso, incidente e recuperação.", submodules: ["RBAC/RLS", "LGPD e retenção", "Incidentes", "Riscos cibernéticos", "Continuidade e recuperação", "Revisão de acessos"], receives: ["M04", "M16", "M21"], sends: ["M12", "M14", "M15", "M19"], desk: null, ops: { kinds: ["Incidente", "Acesso", "Continuidade"], statuses: ["Aberto", "Contido", "Encerrado"] }, screen: "Grava incidente, acesso e continuidade. Não varre vulnerabilidade." },
  { id: "M21", group: "G07", title: "Auditoria independente e assurance", purpose: "Registrar achado e evidência separados de quem executa.", submodules: ["Planos de auditoria", "Amostragem e testes", "Evidências", "Achados e pareceres", "Follow-up", "Avaliação de controles"], receives: ["M14", "M20"], sends: ["M04", "M17", "M03"], desk: null, ops: { kinds: ["Achado", "Evidência"], statuses: ["Aberto", "Em análise", "Fechado"] }, screen: "Grava achado e evidência. Não emite parecer de certificação." },
  { id: "M22", group: "G01", title: "Gestão corporativa e terceiros", purpose: "Registrar fornecedor, contrato e competência.", submodules: ["Financeiro", "Fornecedores", "Contratos", "Competências", "RH", "Aquisições"], receives: ["M02"], sends: ["M12", "M20"], desk: null, ops: { kinds: ["Fornecedor", "Contrato"], statuses: ["Ativo", "Suspenso", "Encerrado"] }, screen: "Grava fornecedor e contrato. Não integra financeiro." },
];

export type AdminPick = "overview" | AdminModuleId;

export function adminModule(id: AdminModuleId) {
  const module = adminModules.find((item) => item.id === id);
  if (!module) throw new Error(`Módulo fora do catálogo: ${id}`);
  return module;
}

export function adminGroup(id: AdminGroupId) {
  const group = adminGroups.find((item) => item.id === id);
  if (!group) throw new Error(`Grupo fora do catálogo: ${id}`);
  return group;
}
