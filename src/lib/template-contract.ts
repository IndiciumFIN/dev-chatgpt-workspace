export const pageToolIds = ["favorite", "print", "pdf", "readingTime", "listen", "docx", "clear", "report"] as const;

export type PageToolId = (typeof pageToolIds)[number];
export type TemplateResource = "formulario" | "laudo";

export type TemplateKind = "home" | "secao" | "artigo" | "guia" | "biblioteca" | "norma" | "ferramenta" | "editorial" | "area" | "aviso" | "entrada";

export type TemplateContract = {
  hero: "home" | "page" | "none";
  crumbs: boolean;
  tools: readonly PageToolId[];
  toc: "sidebar" | "none";
  related: boolean;
  stickyTools: boolean;
  resources: readonly TemplateResource[];
};

// Frame and note describe a page (templateCatalog/templateExamples), not this shared contract.
export const templateContracts: Record<TemplateKind, TemplateContract> = {
  home: { hero: "home", crumbs: false, tools: [], toc: "none", related: false, stickyTools: false, resources: [] },
  secao: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "none", related: false, stickyTools: false, resources: [] },
  artigo: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  guia: { hero: "page", crumbs: true, tools: ["favorite", "pdf", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  biblioteca: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  norma: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: false, stickyTools: false, resources: [] },
  ferramenta: { hero: "page", crumbs: true, tools: ["print", "docx", "clear", "report"], toc: "none", related: true, stickyTools: true, resources: ["formulario", "laudo"] },
  editorial: { hero: "page", crumbs: true, tools: ["print", "readingTime"], toc: "none", related: true, stickyTools: false, resources: [] },
  area: { hero: "page", crumbs: true, tools: [], toc: "none", related: false, stickyTools: false, resources: [] },
  aviso: { hero: "page", crumbs: true, tools: [], toc: "none", related: false, stickyTools: false, resources: [] },
  entrada: { hero: "none", crumbs: false, tools: [], toc: "none", related: false, stickyTools: false, resources: [] },
};

export function contractOf(kind: TemplateKind) {
  return templateContracts[kind];
}
