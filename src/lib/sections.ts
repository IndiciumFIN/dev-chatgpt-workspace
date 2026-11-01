import { extraSections } from "@/lib/institutional-sections";

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

const coreSections: Section[] = [
  ["concurso", "Guia de estudos", "Concurso Público de Santos 74/2026", "Entrada do guia de estudos para enfermeiro.", "pages"],
  ["sobre", "Institucional", "Sobre nós", "Missão, objetivo e equipe.", "pages"],
  ["calculadoras", "Calculadoras", "Calculadoras de enfermagem", "O mesmo grupo do menu.", "pages"],
  ["escalas", "Escalas", "Escalas para avaliação", "Escalas do menu e da home.", "pages"],
  ["conteudos", "Conteúdos", "Conteúdos de enfermagem", "Os grupos do menu Conteúdos.", "pages"],
  ["emprego", "Sites de emprego", "Sites de vagas de trabalho", "Instituições de saúde e quadros de vagas.", "pages"],
  ["simulados", "Simulados", "Simulados de enfermagem", "Cinco questões e cartões dos instrumentos no ar.", "pages"],
  ["biblioteca", "Biblioteca", "Biblioteca de enfermagem", "Formulários, acervo clínico, imagens, PDF, slides e infográfico.", "pages"],
  ["contato", "Fale conosco", "Contate-nos", "O menu Fale Conosco abre esta página.", "contact"],
  ["entrar", "Conta", "Entrar", "A entrada é uma tela própria.", "enter"],
  ["assinatura", "Assinatura", "Assine já", "Pedido sem cobrança.", "subscribe"],
  ["politicas", "Institucional", "Políticas do site", "Privacidade, cookies, retenção e LGPD.", "pages"],
  ["termos", "Institucional", "Termos e condições de uso", "As calculadoras e escalas são consultivas.", "pages"],
  ["acessibilidade", "Institucional", "Política de acessibilidade", "A barra segue a WCAG 2.1 nível AA no que este preview cobre.", "pages"],
  ["compromisso", "Sustentabilidade digital", "Nosso compromisso", "Acessibilidade digital, sustentabilidade digital e proteção de dados.", "pages"],
  ["mapa", "Institucional", "Mapa do site", "Os mesmos destinos do menu e do rodapé.", "pages"],
  ["glossario", "Conteúdos", "Glossário clínico", "Os termos dos instrumentos que já calculam aqui.", "pages"],
  ["nanda", "Conteúdos", "Índice NANDA", "Somente as sugestões que Braden, Morse e Apgar já mostram na faixa.", "pages"],
].map(([slug, kicker, title, lead, kind]) => ({
  slug,
  kicker,
  title,
  lead,
  kind: kind as Section["kind"],
  blocks: [],
}));

export function listSections(): Section[] {
  const seen = new Set<string>();
  const out: Section[] = [];
  for (const section of [...coreSections, ...extraSections()]) {
    if (seen.has(section.slug)) continue;
    seen.add(section.slug);
    out.push(section);
  }
  return out;
}
