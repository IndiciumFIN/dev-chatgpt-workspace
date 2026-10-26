export const componentStatus = ["pronto", "parcial", "fora"] as const;

export type ComponentStatus = (typeof componentStatus)[number];

export type ComponentContract = {
  id: string;
  papel: string;
  status: ComponentStatus;
  variavel?: string;
};

/** Uma função, um componente. Status é o que o template já monta. */
export const components: readonly ComponentContract[] = [
  { id: "casca", papel: "Cabeçalho, acessibilidade, idioma, rodapé e cookies", status: "pronto" },
  { id: "trilha", papel: "Breadcrumb", status: "parcial", variavel: "iconeCasa" },
  { id: "hero", papel: "Hero da página. O da home fica à parte", status: "pronto" },
  { id: "ferramentas", papel: "Barra de ações com ícone", status: "pronto", variavel: "tools" },
  { id: "aviso", papel: "Faixa de erro do cálculo", status: "parcial", variavel: "aviso" },
  { id: "toaster", papel: "Aviso fixo e passageiro", status: "pronto" },
  { id: "tooltip", papel: "Ajuda do campo", status: "pronto", variavel: "title" },
  { id: "paciente", papel: "Dados do paciente, só na escala", status: "parcial" },
  { id: "criterios", papel: "Escolha fechada da escala", status: "pronto", variavel: "escolha" },
  { id: "campos", papel: "Número da calculadora", status: "parcial", variavel: "min-max-step" },
  { id: "progresso", papel: "Barra do topo e barra do item", status: "pronto" },
  { id: "resultado", papel: "Número, unidade e faixa", status: "pronto", variavel: "tone" },
  { id: "pilula", papel: "Faixa colorida do escore", status: "pronto", variavel: "tone" },
  { id: "memoria", papel: "Tabela do que foi marcado", status: "pronto" },
  { id: "memoria-calculo", papel: "Fórmula, substituição e arredondamento", status: "pronto" },
  { id: "nanda", papel: "Sugestão só no laudo, quando a escala permite. Não entra na tela.", status: "parcial", variavel: "nandaMode" },
  { id: "observacao", papel: "Texto livre só no laudo da escala. Não entra na tela.", status: "parcial" },
  { id: "versao", papel: "Versão do molde. A versão clínica só aparece se a ficha declarar.", status: "pronto", variavel: "version" },
  { id: "evidencia", papel: "Nível de evidência só se a ficha declarar a fonte. Não se inventa grau.", status: "parcial", variavel: "evidence" },
  { id: "vista", papel: "Padrão, beira-leito ou offline. A vista menor esconde o que não é o cálculo.", status: "pronto", variavel: "vista" },
  { id: "tutorial", papel: "Passos no próprio JavaScript da página, sem biblioteca.", status: "pronto" },
  { id: "feedback", papel: "Útil nesta visita, ou corrigir. Sem dado de paciente.", status: "pronto" },
  { id: "ecossistema", papel: "Biblioteca, formulários e ferramentas relacionadas.", status: "pronto" },
  { id: "menu", papel: "Menu suspenso abre por botão, não por passar o mouse.", status: "pronto" },
  { id: "nic", papel: "Plano de cuidados", status: "fora" },
  { id: "referencia", papel: "Referência da ferramenta e do artigo", status: "pronto" },
  { id: "laudo", papel: "Impressão do resultado, não o formulário da tela", status: "parcial", variavel: "laudo" },
  { id: "pdf", papel: "PDF gerado no navegador", status: "fora" },
  { id: "teclado", papel: "Prova real", status: "fora" },
  { id: "grafico", papel: "Canvas ou Chart.js", status: "fora" },
  { id: "chamada", papel: "Callout de artigo e guia", status: "pronto", variavel: "tone" },
  { id: "sumario", papel: "Índice lateral", status: "pronto" },
];

export const toolMolds = {
  escala: {
    blocos: ["paciente", "criterios", "resultado", "memoria", "referencia"],
    laudo: ["cabecalho", "paciente", "resultado", "memoria", "nanda", "observacao", "assinatura", "rodape"],
    entrada: "escolha",
    aviso: "faixa",
  },
  calculadora: {
    blocos: ["campos", "resultado", "memoria-calculo", "referencia"],
    laudo: ["cabecalho", "resultado", "memoria-calculo", "rodape"],
    entrada: "min-max",
    aviso: "faixa",
  },
} as const;

export const moldVersion = "1";

export const toolViews = {
  padrao: { label: "Padrão", extras: true },
  beira: { label: "Beira-leito", extras: false },
  offline: { label: "Offline", extras: false },
} as const;

export type ToolMold = keyof typeof toolMolds;
export type ToolView = keyof typeof toolViews;

export const patientStorage = "nenhum" as const;

export function moldOf(kind: ToolMold) {
  return toolMolds[kind];
}

export function hasBlock(kind: ToolMold, block: string) {
  return (toolMolds[kind].blocos as readonly string[]).includes(block);
}

export function hasLaudo(kind: ToolMold, block: string) {
  return (toolMolds[kind].laudo as readonly string[]).includes(block);
}
