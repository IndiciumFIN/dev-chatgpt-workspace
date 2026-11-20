/** Vila do Cuidado — catálogo editorial candidato, sem afirmações clínicas. */
export type VilaKind = "mission" | "story" | "emotion";
export type VilaEntry = {
  id: string; kind: VilaKind; title: string; summary: string; symbol: string;
  ageBand: "6-9" | "10-12" | "all"; sourceRef: string;
  state: "CANDIDATE"; templateId: string; steps: readonly string[];
};
export const VILA_TEMPLATE = { id: "VILA.TPL.EDUCATIONAL-CARD", version: "0.1.0", slots: ["title", "summary", "symbol", "steps", "sourceRef"] } as const;
export const vilaCatalog: readonly VilaEntry[] = [
  { id:"VILA.MIS.001", kind:"mission",title:"Missão das mãos limpas",summary:"Uma sequência lúdica para refletir sobre hábitos de higiene.",symbol:"🫧",ageBand:"6-9",sourceRef:"EDITORIAL-CANDIDATE",state:"CANDIDATE",templateId:VILA_TEMPLATE.id,steps:["Observe suas mãos antes das atividades.","Conte quais momentos do dia pedem higienização.","Converse com um adulto sobre o que descobriu."] },
  { id:"VILA.MIS.002",kind:"mission",title:"Exploradores do cuidado",summary:"Reconheça pessoas e atitudes que ajudam a cuidar.",symbol:"🔎",ageBand:"all",sourceRef:"EDITORIAL-CANDIDATE",state:"CANDIDATE",templateId:VILA_TEMPLATE.id,steps:["Pense em alguém que cuida de você.","Identifique um gesto de gentileza.","Compartilhe sua descoberta com alguém de confiança."] },
  { id:"VILA.HIS.001",kind:"story",title:"O dia em que a coragem apareceu",summary:"Uma história interativa sobre pedir ajuda.",symbol:"📖",ageBand:"all",sourceRef:"EDITORIAL-CANDIDATE",state:"CANDIDATE",templateId:VILA_TEMPLATE.id,steps:["Cauê ficou preocupado com uma novidade.","Ele conversou com uma pessoa de confiança.","Juntos, escolheram um próximo passo com calma."] },
  { id:"VILA.EMO.001",kind:"emotion",title:"Como estou me sentindo?",summary:"Explore palavras para expressar sentimentos sem julgamento.",symbol:"💛",ageBand:"all",sourceRef:"EDITORIAL-CANDIDATE",state:"CANDIDATE",templateId:VILA_TEMPLATE.id,steps:["Escolha uma palavra para o que está sentindo.","Perceba que sentimentos podem mudar.","Se precisar, converse com alguém de confiança."] },
];
export const vilaKinds: Readonly<Record<VilaKind, string>> = {mission:"Missões",story:"Histórias",emotion:"Emoções"};
export function byVilaKind(kind: VilaKind | "all") { return kind === "all" ? vilaCatalog : vilaCatalog.filter(item => item.kind === kind); }
