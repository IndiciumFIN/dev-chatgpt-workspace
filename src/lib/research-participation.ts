export type ResearchModuleId = "visao-geral"|"studio"|"instrumentos"|"etica"|"evidencias"|"equipe"|"riscos-impacto"|"analise"|"participacao"|"propostas"|"consenso"|"devolutiva"|"relatorio"|"governanca";
export const researchModules = [
  ["visao-geral","Visão geral","Research Hub"],["studio","Studio de pesquisa","Desenho"],["instrumentos","Instrumentos","Coleta"],
  ["etica","Ética, LGPD e COI","Proteção"],["evidencias","Fontes e evidências","Evidence"],["equipe","Equipe e skills","Capacidade"],
  ["riscos-impacto","Riscos e impacto","Assurance"],["analise","Dados e análise","Insights"],["participacao","Escuta cidadã","Participação"],
  ["propostas","Propostas e cocriação","Cocriação"],["consenso","Consenso","Deliberação"],["devolutiva","Devolutiva","Accountability"],
  ["relatorio","Relatório vivo","Voz da comunidade"],["governanca","Governança","CKO"],
] as const;
export const consensusStatements = [
  {id:"STAT-CIT-001",text:"A identificação da categoria profissional deve ser simples para o cidadão durante o atendimento."},
  {id:"STAT-CIT-002",text:"Quem participa de uma consulta deve conseguir acompanhar como sua contribuição foi utilizada."},
  {id:"STAT-CIT-003",text:"A escuta social deve complementar critérios técnicos e evidências na definição de prioridades."},
] as const;
export type ResearchDraft = {
  projectTitle:string; question:string; objective:string; researchType:string; design:string; population:string; analysisPlan:string;
  instrumentTitle:string; instrumentType:string; instrumentNotes:string;
  ethicsHumanCheck:boolean; consentMapped:boolean; privacyMinimized:boolean; confidentialityMapped:boolean; conflictDeclared:boolean;
  skills:string[]; riskSummary:string; mitigation:string; financialImpact:string; reputationImpact:string;
};
export const emptyResearchDraft:ResearchDraft={projectTitle:"",question:"",objective:"",researchType:"MIXED",design:"",population:"",analysisPlan:"",instrumentTitle:"",instrumentType:"SURVEY",instrumentNotes:"",ethicsHumanCheck:false,consentMapped:false,privacyMinimized:true,confidentialityMapped:false,conflictDeclared:false,skills:[],riskSummary:"",mitigation:"",financialImpact:"",reputationImpact:""};
export function isResearchModule(v:string):v is ResearchModuleId{return researchModules.some(x=>x[0]===v)}
