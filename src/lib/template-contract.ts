export const pageToolIds = ["favorite", "print", "pdf", "readingTime", "listen", "docx", "clear", "report"] as const;

export type PageToolId = (typeof pageToolIds)[number];
export type TemplateResource = "formulario" | "laudo";

export type TemplateKind = "home" | "secao" | "artigo" | "guia" | "biblioteca" | "norma" | "ferramenta" | "editorial" | "area" | "aviso" | "entrada";

export type TemplateContract = {
  frame: "shell" | "area" | "login" | "home";
  hero: "home" | "page" | "none";
  crumbs: boolean;
  tools: readonly PageToolId[];
  toc: "sidebar" | "none";
  related: boolean;
  note: "callout" | "inline" | "none";
  stickyTools: boolean;
  resources: readonly TemplateResource[];
};

export const templateContracts: Record<TemplateKind, TemplateContract> = {
  home: { frame: "home", hero: "home", crumbs: false, tools: [], toc: "none", related: false, note: "none", stickyTools: false, resources: [] },
  secao: { frame: "shell", hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "none", related: false, note: "none", stickyTools: false, resources: [] },
  artigo: { frame: "shell", hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, note: "callout", stickyTools: false, resources: [] },
  guia: { frame: "shell", hero: "page", crumbs: true, tools: ["favorite", "pdf", "readingTime", "listen"], toc: "sidebar", related: true, note: "callout", stickyTools: false, resources: [] },
  biblioteca: { frame: "shell", hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, note: "inline", stickyTools: false, resources: [] },
  norma: { frame: "shell", hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: false, note: "inline", stickyTools: false, resources: [] },
  ferramenta: { frame: "shell", hero: "page", crumbs: true, tools: ["print", "docx", "clear", "report"], toc: "none", related: true, note: "none", stickyTools: true, resources: ["formulario", "laudo"] },
  editorial: { frame: "shell", hero: "page", crumbs: true, tools: ["print", "readingTime"], toc: "none", related: true, note: "inline", stickyTools: false, resources: [] },
  area: { frame: "area", hero: "page", crumbs: true, tools: [], toc: "none", related: false, note: "none", stickyTools: false, resources: [] },
  aviso: { frame: "shell", hero: "page", crumbs: true, tools: [], toc: "none", related: false, note: "none", stickyTools: false, resources: [] },
  entrada: { frame: "login", hero: "none", crumbs: false, tools: [], toc: "none", related: false, note: "none", stickyTools: false, resources: [] },
};

export function contractOf(kind: TemplateKind) {
  return templateContracts[kind];
}
