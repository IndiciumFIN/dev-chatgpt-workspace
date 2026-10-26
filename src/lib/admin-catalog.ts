import type { DeskModule } from "./normative-desk";

/** Catálogo da branch de auditoria, ligado só à mesa que esta área já lê. Sem mesa, não há registro. */

export type AdminGroupId = "G01" | "G02" | "G03" | "G04" | "G05" | "G06" | "G07";
export type AdminModuleId =
  | "M02" | "M03" | "M04" | "M05" | "M06" | "M07" | "M08" | "M09" | "M10" | "M11"
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
  screen: string;
};

export const adminGroups: readonly { id: AdminGroupId; title: string; description: string }[] = [
  { id: "G01", title: "Estratégia e governança", description: "Diretrizes, políticas e normas que esta mesa já consegue abrir." },
  { id: "G02", title: "Gestão e execução", description: "Fila e ordens. Não há kanban nem executor." },
  { id: "G03", title: "Dados e conhecimento", description: "Tabelas, dicionário, fila de origem e especificações." },
  { id: "G04", title: "Produtos e experiência", description: "Instrumento, página, idioma e token que já estão no banco." },
  { id: "G05", title: "Relacionamento", description: "Pessoa e papel. Campanha não tem mesa." },
  { id: "G06", title: "Tecnologia e operações", description: "Central de comando e agentes. Deploy não sai daqui." },
  { id: "G07", title: "Qualidade e auditoria", description: "Ainda sem mesa própria. O achado fica no catálogo." },
];

export const adminModules: readonly AdminModule[] = [
  { id: "M02", group: "G01", title: "Estratégia e planejamento", purpose: "Objetivos, metas e roadmap.", submodules: ["Objetivos e metas", "Portfólio", "Roadmap"], receives: ["M04", "M17"], sends: ["M03", "M22"], desk: null, screen: "Sem mesa. Não há meta gravada para listar." },
  { id: "M03", group: "G02", title: "PMO e projetos", purpose: "Trabalhos autorizados e dependências.", submodules: ["Work orders", "Backlog", "Dependências"], receives: ["M02", "M04", "M21"], sends: ["M05", "M08", "M16"], desk: null, screen: "A ordem executável está na Central. Esta entrada não finge um quadro de projeto." },
  { id: "M04", group: "G01", title: "Governança, riscos e compliance", purpose: "Política, risco e decisão com versão.", submodules: ["Políticas", "Riscos", "Decisões"], receives: ["M17", "M21"], sends: ["M03", "M05"], desk: "politicas", screen: "Abre o texto da política, o ciclo e a aprovação. Não certifica ISO." },
  { id: "M05", group: "G03", title: "Arquitetura e metamodelo", purpose: "Entidade, chave e dicionário desta mesa.", submodules: ["Entidades", "Dicionário", "Relações"], receives: ["M04"], sends: ["M06", "M07", "M08"], desk: "modelo", screen: "Lista a tabela que o metamodelo declara e a coluna do dicionário. Aprovar o parecer não cria tabela." },
  { id: "M06", group: "G03", title: "Fontes e ingestão", purpose: "Origem, extração e linhagem locais.", submodules: ["Extração", "Linhagem", "Átomos"], receives: ["M05", "M17"], sends: ["M07"], desk: "fila", screen: "Mostra a fila local de extração, linhagem e átomo. Não baixa PDF." },
  { id: "M07", group: "G03", title: "Kernel e conhecimento", purpose: "Especificação de dado que espera aprovação.", submodules: ["Características", "Estados", "Aprovação"], receives: ["M05", "M06"], sends: ["M08"], desk: "dados", screen: "Característica em rascunho ou aprovada. Não admite átomo de norma." },
  { id: "M08", group: "G04", title: "Produtos e ferramentas", purpose: "Capa e publicação do instrumento.", submodules: ["Calculadoras", "Escalas"], receives: ["M07", "M10"], sends: ["M14", "M15"], desk: "instrumentos", screen: "Edita título, resumo e se aparece no ar. A fórmula não muda aqui." },
  { id: "M09", group: "G04", title: "Conteúdo e editorial", purpose: "Página e peça que a fonte já publicou.", submodules: ["Páginas", "Peças"], receives: ["M10"], sends: ["M11", "M08"], desk: "conteudo", focus: "paginas", screen: "Página de seção e instrumento com rota. Não é um editor de artigo." },
  { id: "M10", group: "G04", title: "Design system e interfaces", purpose: "Contrato de template e token de cor.", submodules: ["Contratos", "Tokens", "Arquivos"], receives: ["M05"], sends: ["M08", "M09"], desk: "sistema", focus: "visual", screen: "Contrato e token lidos do banco. Não cria componente novo." },
  { id: "M11", group: "G04", title: "Idioma e acessibilidade", purpose: "Rótulo por idioma já guardado.", submodules: ["Idiomas", "Rótulos"], receives: ["M09"], sends: ["M08"], desk: "conteudo", focus: "idiomas", screen: "Abre a mesa de idiomas. Não traduz o texto clínico que ainda está em português." },
  { id: "M12", group: "G05", title: "Usuários e papéis", purpose: "Pessoa e papel nesta mesa.", submodules: ["Pessoas", "Papéis"], receives: [], sends: [], desk: "pessoas", screen: "Troca o papel de quem já entrou. Não cobra assinatura." },
  { id: "M13", group: "G05", title: "Marketing e inteligência", purpose: "Campanha, funil e audiência.", submodules: ["Campanhas", "SEO"], receives: ["M12", "M15"], sends: ["M02"], desk: null, screen: "Sem mesa. Não há número de visita nesta área." },
  { id: "M14", group: "G07", title: "Qualidade e homologação", purpose: "Teste e portão de saída.", submodules: ["Testes", "Gates"], receives: ["M08", "M04"], sends: ["M15", "M21"], desk: null, screen: "Sem mesa. O teste não aparece como registro daqui." },
  { id: "M15", group: "G06", title: "Publicação e distribuição", purpose: "Release e ambiente.", submodules: ["Releases", "Ambientes"], receives: ["M14", "M08"], sends: ["M16"], desk: null, screen: "Sem mesa. Publicar o instrumento continua no próprio instrumento." },
  { id: "M16", group: "G06", title: "Infraestrutura e automações", purpose: "Ordem, corrida e canal da central.", submodules: ["Ordens", "Corridas", "Kernel"], receives: ["M15"], sends: ["M03"], desk: "inicio", screen: "Consulta não publica. Executar só habilita com a ordem pronta e o portão aberto." },
  { id: "M17", group: "G01", title: "Gestão normativa", purpose: "Metadado da norma, sem a cláusula.", submodules: ["Normas", "Domínio", "Direito"], receives: ["M21"], sends: ["M04", "M06"], desk: "normas", screen: "Nome, domínio e direito. O texto da cláusula não está nesta mesa." },
  { id: "M18", group: "G03", title: "Governança clínica", purpose: "Validação de fórmula e população.", submodules: ["Fórmulas", "População"], receives: ["M06", "M17"], sends: ["M08"], desk: null, screen: "Sem mesa. A fórmula continua no código da ferramenta." },
  { id: "M19", group: "G06", title: "Governança de IA e agentes", purpose: "Agente desbloqueado para a tarefa, fora do menu público.", submodules: ["Agentes", "Escopo"], receives: ["M04"], sends: ["M16"], desk: "sistema", focus: "agentes", screen: "Lista o agente e o estado. Não dispara modelo." },
  { id: "M20", group: "G06", title: "Segurança e continuidade", purpose: "Acesso, incidente e recuperação.", submodules: ["Acesso", "Incidentes", "Continuidade"], receives: ["M04", "M16"], sends: ["M12"], desk: null, screen: "Sem mesa. O papel da pessoa não substitui o controle de segurança." },
  { id: "M21", group: "G07", title: "Auditoria independente", purpose: "Achado e evidência separados de quem executa.", submodules: ["Achados", "Evidências"], receives: ["M14"], sends: ["M04", "M17"], desk: null, screen: "Sem mesa. O catálogo não grava parecer." },
  { id: "M22", group: "G01", title: "Gestão corporativa e terceiros", purpose: "Fornecedor, contrato e competência.", submodules: ["Fornecedores", "Contratos"], receives: ["M02"], sends: ["M12"], desk: null, screen: "Sem mesa. Não há contrato de terceiro gravado." },
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
