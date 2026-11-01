export const pageToolIds = ["favorite", "print", "pdf", "readingTime", "listen", "docx", "clear", "report"] as const;

export type PageToolId = (typeof pageToolIds)[number];
export type TemplateResource = "formulario" | "laudo";

export type TemplateKind = "home" | "secao" | "artigo" | "guia" | "biblioteca" | "norma" | "ferramenta" | "editorial" | "area" | "aviso" | "entrada";

/**
 * O contrato do FRAME de template.
 *
 * `frame` e `note` sao dimensao da PAGINA, nao do frame:
 *   - `frame` (shell/area/login/home) e decidido pelo proprio frame que a
 *     pagina usa — `AreaFrame`, a tela de login, a home. O frame nao consulta
 *     o contrato, e o contrato nao governa o frame.
 *   - `note` (callout/inline) e estilo do CONTEUDO. O corpo do artigo decide
 *     a nota; o frame nao a imposede.
 *
 * Por isso os dois foram movidos para `src/lib/template-examples.ts`, onde
 * descrevem uma pagina CONCRETA e podem ser conferidos no navegador. Aqui
 * ficam so as dimensoes que o frame realmente obedece — todas consumidas.
 */
export type TemplateContract = {
  hero: "home" | "page" | "none";
  crumbs: boolean;
  tools: readonly PageToolId[];
  toc: "sidebar" | "none";
  related: boolean;
  stickyTools: boolean;
  resources: readonly TemplateResource[];
};

export const templateContracts: Record<TemplateKind, TemplateContract> = {
  home: { hero: "home", crumbs: false, tools: [], toc: "none", related: false, stickyTools: false, resources: [] },
  secao: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "none", related: false, stickyTools: false, resources: [] },
  // A nota do artigo e INLINE (`.tpl-note` dentro do corpo), nao um callout.
  // O contrato dizia "callout" desde antes de o corpo existir — e a dimensao
  // `note` nunca foi consumida por nenhum componente. Reconciliado com o que
  // a pagina faz, sem mudar um pixel.
  artigo: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  guia: { hero: "page", crumbs: true, tools: ["favorite", "pdf", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  biblioteca: { hero: "page", crumbs: true, tools: ["favorite", "print", "readingTime", "listen"], toc: "sidebar", related: true, stickyTools: false, resources: [] },
  // A pagina da norma nao tem nota. O contrato pedia "inline" — dimensao que
  // nunca foi implementada. Reconciliado com a realidade.
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
