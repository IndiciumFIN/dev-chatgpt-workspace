/** Catálogo funcional planejado. Não representa tabelas, rotas ou capacidades já homologadas.
 * Interface consumidora: src/components/admin/admin-module-workspace.tsx
 */
export type AdminGroupId = 'G01'|'G02'|'G03'|'G04'|'G05'|'G06'|'G07';
export type AdminModuleId = 'M02'|'M03'|'M04'|'M05'|'M06'|'M07'|'M08'|'M09'|'M10'|'M11'|'M12'|'M13'|'M14'|'M15'|'M16'|'M17'|'M18'|'M19'|'M20'|'M21'|'M22';
export type AdminSurface = 'overview'|'pmo'|'governance'|'content'|'templates'|'sources'|'publication'|'command';
export interface AdminGroup {id:AdminGroupId; title:string; description:string}
export interface AdminModule {
  id:AdminModuleId;
  group:AdminGroupId;
  title:string;
  purpose:string;
  submodules:readonly string[];
  receives:readonly AdminModuleId[];
  sends:readonly AdminModuleId[];
  surface?:AdminSurface;
  /** Apenas projeção/ação parcial de UI, não implantação do módulo. */
  previewScope?:string;
}
export const adminGroups:readonly AdminGroup[] = [
  {id:'G01',title:'Estratégia e Governança',description:'Diretrizes, objetivos, normativos, riscos, controles e recursos'},
  {id:'G02',title:'Gestão e Execução',description:'PMO, tarefas, dependências e WOs'},
  {id:'G03',title:'Dados e Conhecimento',description:'Metamodelo, ingestão, Kernel, evidências e segurança clínica'},
  {id:'G04',title:'Produtos e Experiência',description:'Ferramentas, editorial, Design System, idiomas e acessibilidade'},
  {id:'G05',title:'Relacionamento e Negócios',description:'Usuários, assinaturas, marketing e indicadores de relacionamento'},
  {id:'G06',title:'Tecnologia e Operações',description:'Releases, infraestrutura, IA, agentes, segurança e continuidade'},
  {id:'G07',title:'Qualidade e Auditoria',description:'Testes, validação, homologação, avaliações e auditoria independente'},
];
export const adminModules:readonly AdminModule[] = [
  {id:'M02',group:'G01',title:'Estratégia e Planejamento',purpose:'Definir objetivos, prioridades, metas e planejamento estratégico.',submodules:['Objetivos e metas','Portfólio estratégico','Roadmap','Orçamento e indicadores','Desempenho'],receives:['M04','M17'],sends:['M03','M22']},
  {id:'M03',group:'G02',title:'PMO e Projetos',purpose:'Controlar trabalhos autorizados, ordem da fila, dependências, WOs e progresso.',submodules:['Portfólio de projetos','Programas e waves','Backlog e tarefas','Work Orders','Kanban e calendário','Dependências e checkpoints','Handoffs'],receives:['M02','M04','M14','M21'],sends:['M05','M06','M08','M15','M16','M19'],surface:'pmo',previewScope:'Fila registrada no GitHub em leitura; não é orquestrador vivo nem executor.'},
  {id:'M04',group:'G01',title:'Governança, Riscos e Compliance',purpose:'Administrar políticas, riscos, RCM, controles e decisões formais.',submodules:['Governança corporativa','Processos e políticas','Riscos e controles','Matriz RCM','Decisões e exceções','COSO/COBIT'],receives:['M02','M17','M21'],sends:['M03','M05','M14','M19','M20'],surface:'governance',previewScope:'Leitura do registro FIND versionado; não aprova política ou controle.'},
  {id:'M05',group:'G03',title:'Arquitetura e Metamodelo',purpose:'Prover identidade, contratos, schemas e relacionamentos canônicos.',submodules:['Entidades e relacionamentos','Schemas e contratos','Dicionário de dados','Tipos e taxonomias','Master data','Revisões de arquitetura'],receives:['M04','M03'],sends:['M06','M07','M08','M09','M10']},
  {id:'M06',group:'G03',title:'Fontes e Ingestão',purpose:'Controlar origem, aquisição e tratamento de documentos e dados.',submodules:['Fontes e licenças','Importação em lote','Conectores','Extração e normalização','Lineage','Quarentena e duplicidade','Reconciliação'],receives:['M05','M17'],sends:['M07','M18'],surface:'sources',previewScope:'Exibe somente IDs de fonte do catálogo local; não executa ingestão.'},
  {id:'M07',group:'G03',title:'Kernel e Conhecimento',purpose:'Gerenciar evidências, átomos, claims, regras e admissão sob validadores.',submodules:['Átomos e evidências','Claims e regras','Ontologias','Proveniência','Versionamento','Gates de admissão'],receives:['M05','M06','M04'],sends:['M18','M08','M09']},
  {id:'M08',group:'G04',title:'Produtos e Ferramentas',purpose:'Planejar e administrar calculadoras e produtos educacionais.',submodules:['Catálogo de produtos','Calculadoras','Simulados','Pesquisa acadêmica','Carreiras e educação','Bibliotecas'],receives:['M07','M18','M10'],sends:['M14','M15'],surface:'content',previewScope:'Editor local de metadados, sem alteração de cálculo, ferramenta ou Kernel.'},
  {id:'M09',group:'G04',title:'Conteúdo e Editorial',purpose:'Criar e revisar artigos, guias, protocolos e derivados com referências.',submodules:['Artigos e guias','Protocolos e publicações','Revisão editorial','Citações e direitos','Dossiês de conteúdo'],receives:['M07','M18','M10'],sends:['M11','M08','M14'],surface:'content',previewScope:'Editor demonstrativo de metadados de ferramentas; não é um CMS editorial completo.'},
  {id:'M10',group:'G04',title:'Design System e Interfaces',purpose:'Administrar tokens, componentes e templates de apresentação canônicos.',submodules:['Design tokens','Componentes e versões','Templates e slots','Iconografia e ativos','Builder e páginas','Pré-visualização'],receives:['M05','M04'],sends:['M08','M09','M11'],surface:'templates',previewScope:'Inventário de templates do código, sem edição ou promoção de componentes.'},
  {id:'M11',group:'G04',title:'Internacionalização e Acessibilidade',purpose:'Aplicar idiomas, localização e critérios de acessibilidade.',submodules:['Idiomas e tradução','Traduções de conteúdos','Localização por país','WCAG e eMAG','Tecnologias assistivas','Revisão por idioma'],receives:['M09','M10'],sends:['M08','M14']},
  {id:'M12',group:'G05',title:'Usuários e Assinaturas',purpose:'Governar identidade, papéis, preferências, consentimentos e benefícios.',submodules:['Perfis e papéis','Permissões','Planos e assinaturas','Direitos de acesso','Preferências','Consentimentos'],receives:['M20','M22'],sends:['M13']},
  {id:'M13',group:'G05',title:'Marketing e Inteligência',purpose:'Medir audiência, desempenho, campanhas e percepções de usuários.',submodules:['SEO','Campanhas','Analytics','Funis e conversão','Retenção','Satisfação e feedback'],receives:['M12','M15'],sends:['M02','M03']},
  {id:'M14',group:'G07',title:'Qualidade, Testes e Homologação',purpose:'Testar qualidade técnica e clínica aplicável e emitir resultados de gates.',submodules:['Testes unitários','Integração e E2E','Acessibilidade','Testes clínicos','Validação técnica','Homologações e gates'],receives:['M04','M08','M11','M18','M20'],sends:['M15','M03','M21']},
  {id:'M15',group:'G06',title:'Publicação e Distribuição',purpose:'Gerir versões candidatas, aprovações, releases e rollback.',submodules:['Releases','Ambientes','Promoções','Publicação','Deploy e rollback','Canais'],receives:['M14','M08','M20'],sends:['M16','M13'],surface:'publication',previewScope:'Publicação somente no navegador; não modifica produção, Git ou Supabase.'},
  {id:'M16',group:'G06',title:'Infraestrutura e Automações',purpose:'Administrar observabilidade, filas, serviços e integrações técnicas.',submodules:['Integrações e APIs','Pipelines','Filas e execuções','Telemetria','Backups e restauração','Disponibilidade'],receives:['M15','M19','M20'],sends:['M03','M20'],surface:'command',previewScope:'Central de Comando exibe PMO versionado, sem telemetria nem runner conectado.'},
  {id:'M17',group:'G01',title:'Gestão Normativa e Obrigações',purpose:'Manter catálogo normativo, vigência, requisitos e critérios de aplicabilidade.',submodules:['Normativos e versões','Jurisdição e vigência','Requisitos','Aplicabilidade','Obrigações','Análise de lacunas'],receives:['M21'],sends:['M04','M06','M18'],surface:'governance',previewScope:'Metadados de normas candidatas no registro Git, sem requisitos normativos admitidos.'},
  {id:'M18',group:'G03',title:'Governança Clínica e Segurança',purpose:'Assegurar a validação clínica e a avaliação de riscos de ferramentas.',submodules:['Validação de fórmulas','Populações-alvo','Testes clínicos de referência','Revisões especializadas','Alertas de segurança','Regulação de software'],receives:['M06','M07','M17'],sends:['M08','M09','M14']},
  {id:'M19',group:'G06',title:'Governança de IA e Agentes',purpose:'Controlar modelos, agentes, escopos, avaliações e supervisão humana.',submodules:['Modelos e provedores','Catálogo de agentes','Prompts versionados','Ferramentas autorizadas','Avaliações','Limites e supervisão'],receives:['M03','M04','M20'],sends:['M16','M14']},
  {id:'M20',group:'G06',title:'Segurança, Privacidade e Continuidade',purpose:'Proteger identidades, dados, sistemas e continuidade operacional.',submodules:['RBAC/RLS','LGPD e retenção','Incidentes','Riscos cibernéticos','Continuidade e recuperação','Revisão de acessos'],receives:['M04','M16','M21'],sends:['M12','M14','M15','M19']},
  {id:'M21',group:'G07',title:'Auditoria Independente e Assurance',purpose:'Avaliar controles e evidências com independência de execução.',submodules:['Planos de auditoria','Amostragem e testes','Evidências','Achados e pareceres','Follow-up','Avaliação de controles'],receives:['M14','M20'],sends:['M04','M17','M03']},
  {id:'M22',group:'G01',title:'Gestão Corporativa e Terceiros',purpose:'Administrar recursos, contratações, competências e fornecedores.',submodules:['Financeiro','Fornecedores','Contratos','Competências','RH','Aquisições'],receives:['M02'],sends:['M12','M20']},
];
export function getAdminModule(id:AdminModuleId):AdminModule {
  const item=adminModules.find(module=>module.id===id);
  if(!item) throw new Error('Módulo não registrado: '+id);
  return item;
}
export function isAdminModulePreview(module:AdminModule):boolean {
  return module.surface!==undefined;
}
