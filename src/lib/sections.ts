export type Dest =
  | { kind: "home" }
  | { kind: "section"; slug: string; hash?: string }
  | { kind: "tool"; slug: string }
  | {
      kind: "page";
      to:
        | "/sistema"
        | "/pacote"
        | "/login"
        | "/conta"
        | "/blog/mary-eliza-mahoney"
        | "/estudo"
        | "/ferramentas-pesquisa"
        | "/concurso"
        | "/sbar"
        | "/album"
        | "/forum"
        | "/curiosidades"
        | "/exames-laboratoriais"
        | "/doencas-compulsorias"
        | "/calculadoras-trabalhistas"
        | "/viladocuidado"
        | "/bibliotecas";
    }
  | { kind: "model"; id: "biblioteca" | "slides" | "guia" | "laudo"; hash?: string };

export type CatalogItem = {
  id: string;
  title: string;
  text: string;
  dest?: Dest;
  live?: boolean;
};

export type SectionBlock = {
  id: string;
  title: string;
  text?: string;
  items: CatalogItem[];
};

export type Section = {
  slug: string;
  kicker: string;
  title: string;
  lead: string;
  kind: "pages" | "contact" | "enter" | "subscribe";
  blocks: SectionBlock[];
};
