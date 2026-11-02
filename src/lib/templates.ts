import catalog from "@/content/editorial-catalog.json";

export type EditorialTemplate = {
  id: string;
  type: string;
  name: string;
  category: string;
  description: string;
  data: Record<string, unknown>;
};

const templates = catalog.templates as EditorialTemplate[];

export function listTemplates() {
  return templates;
}

export function getTemplate(id: string) {
  return templates.find((item) => item.id.toLowerCase() === id.toLowerCase());
}

export const templateFamilies = [
  {
    id: "guia",
    name: "Guia",
    text: "Página longa do site homologado: hero, barra de ações, artigo e índice lateral.",
  },
  {
    id: "biblioteca",
    name: "Biblioteca",
    text: "Página institucional em módulos, mais as prateleiras de anatomia, seringas, imagem, thumbnail, PDF, slide e infográfico.",
  },
  {
    id: "norma",
    name: "Norma",
    text: "Leitura contínua, com índice do texto e uma barra de utilidade.",
  },
  {
    id: "editorial",
    name: "Peças editoriais",
    text: "Vinte e uma peças do hub canônico: post, carrossel, protocolo, checklist, documento e ficha.",
  },
  {
    id: "formulario",
    name: "Formulário",
    text: "Checklist preenchível. O que for digitado fica só nesta tela.",
  },
  {
    id: "laudo",
    name: "Laudo",
    text: "Folha de resultado da escala, visível na tela e na impressão.",
  },
  {
    id: "institucional",
    name: "Institucional",
    text: "Página longa no mesmo frame do artigo: trilha, seções e relacionados.",
  },
  {
    id: "slides",
    name: "Slides",
    text: "Dez lâminas 16:9 no token do site: capa, sumário, seção, cartões, números, tabela, aviso e fecho.",
  },
  {
    id: "ferramenta",
    name: "Ferramenta",
    text: "Escala e calculadora publicadas. A folha A4 acompanha a ferramenta.",
  },
] as const;
