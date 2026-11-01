import type { TemplateKind } from "@/lib/template-contract";

export type CatalogRow = {
  id: string;
  name: string;
  href: string;
  kind: TemplateKind;
  frame: "shell" | "area" | "login" | "home" | "admin";
  note: "callout" | "inline" | "none";
  situacao: "montagem" | "molde";
  source: string;
};

/** Contratos do backup, com o endereço que existe neste repositório. */
export const templateCatalog: CatalogRow[] = [
  { id: "home", name: "Home", href: "/", kind: "home", frame: "home", note: "none", situacao: "montagem", source: "composição do site" },
  { id: "institucional", name: "Institucional", href: "/modelos/institucional", kind: "artigo", frame: "shell", note: "callout", situacao: "montagem", source: "família institucional" },
  { id: "escala-calculadora", name: "Escala e calculadora", href: "/ferramentas/braden", kind: "ferramenta", frame: "shell", note: "none", situacao: "montagem", source: "catálogo de ferramentas" },
  { id: "laudo", name: "Laudo", href: "/modelos/laudo", kind: "editorial", frame: "shell", note: "callout", situacao: "montagem", source: "folha da ferramenta" },
  { id: "formularios", name: "Formulário", href: "/modelos/formulario", kind: "editorial", frame: "shell", note: "callout", situacao: "montagem", source: "recurso formulário" },
  { id: "nanda-nic-noc", name: "NANDA, NIC e NOC", href: "/modelos/TPL-014", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "peça TPL-014" },
  { id: "bibliotecas", name: "Biblioteca", href: "/secao/biblioteca", kind: "biblioteca", frame: "shell", note: "inline", situacao: "montagem", source: "seção e fichas" },
  { id: "biblioteca-imagens", name: "Ficha de anatomia", href: "/secao/coracao-humano", kind: "biblioteca", frame: "shell", note: "inline", situacao: "montagem", source: "ficha do coração" },
  { id: "normativo", name: "Norma", href: "/modelos/norma", kind: "norma", frame: "shell", note: "inline", situacao: "montagem", source: "família norma" },
  { id: "editorial-curto", name: "Editorial curto", href: "/modelos/TPL-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "21 peças" },
  { id: "editorial-longo", name: "Editorial longo", href: "/blog/mary-eliza-mahoney", kind: "artigo", frame: "shell", note: "callout", situacao: "montagem", source: "artigo publicado" },
  { id: "carreira-concursos", name: "Carreira e concursos", href: "/concurso", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "gerador de currículo migrado do backup" },
  { id: "estudo", name: "Estudo", href: "/estudo", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "quiz, flashcard e simulado migrados do backup" },
  { id: "flashcard", name: "Flashcard", href: "/modelos/TPL-FLASHCARD-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-FLASHCARD-001" },
  { id: "casos-clinicos", name: "Caso clínico", href: "/modelos/TPL-005", kind: "editorial", frame: "shell", note: "none", situacao: "montagem", source: "TPL-005" },
  { id: "quiz", name: "Quiz", href: "/modelos/TPL-QUIZ-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-QUIZ-001" },
  { id: "simulados", name: "Simulado", href: "/modelos/TPL-SIMULADO-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-SIMULADO-001" },
  { id: "infograficos", name: "Infográfico", href: "/modelos/TPL-009", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-009" },
  { id: "slides", name: "Slides", href: "/modelos/slides", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "família slides" },
  { id: "provas", name: "Prova", href: "/modelos/TPL-PROVA-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-PROVA-001" },
  { id: "ebook", name: "Ebook", href: "/modelos/TPL-EBOOK-001", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "TPL-EBOOK-001" },
  { id: "manual", name: "Guia", href: "/modelos/guia", kind: "guia", frame: "shell", note: "callout", situacao: "montagem", source: "família guia" },
  { id: "pdf", name: "PDF", href: "/modelos/pdf", kind: "editorial", frame: "shell", note: "inline", situacao: "molde", source: "perfil pdf do backup, sem arquivo governado" },
  { id: "sbar", name: "SBAR", href: "/sbar", kind: "editorial", frame: "shell", note: "callout", situacao: "montagem", source: "passagem de plantão migrada do backup" },
  { id: "calculadoras-trabalhistas", name: "Calculadoras trabalhistas", href: "/calculadoras-trabalhistas", kind: "ferramenta", frame: "shell", note: "callout", situacao: "montagem", source: "quatro calculadoras migradas do backup" },
  { id: "doencas-compulsorias", name: "Doenças compulsórias", href: "/doencas-compulsorias", kind: "secao", frame: "shell", note: "callout", situacao: "montagem", source: "lista migrada do backup" },
  { id: "exames-laboratoriais", name: "Exames laboratoriais", href: "/exames-laboratoriais", kind: "ferramenta", frame: "shell", note: "callout", situacao: "montagem", source: "catálogo migrado do backup" },
  { id: "curiosidades", name: "Curiosidades", href: "/curiosidades", kind: "artigo", frame: "shell", note: "inline", situacao: "montagem", source: "fatos migrados do backup" },
  { id: "ferramentas-pesquisa", name: "Pesquisa", href: "/ferramentas-pesquisa", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "citação, fontes e PICO migrados do backup" },
  { id: "forum", name: "Fórum", href: "/forum", kind: "secao", frame: "shell", note: "inline", situacao: "montagem", source: "fórum migrado do backup" },
  { id: "album", name: "Álbum", href: "/album", kind: "biblioteca", frame: "shell", note: "inline", situacao: "montagem", source: "álbum migrado do backup" },
  { id: "area-assinante", name: "Área do assinante", href: "/assinante", kind: "area", frame: "area", note: "none", situacao: "montagem", source: "área logada" },
  { id: "area-admin", name: "Área do administrador", href: "/admin", kind: "area", frame: "admin", note: "none", situacao: "montagem", source: "console" },
  { id: "viladocuidado", name: "Vila do Cuidado", href: "/viladocuidado", kind: "editorial", frame: "shell", note: "inline", situacao: "montagem", source: "piloto educativo migrado do backup" },
];

export function catalogById(id: string) {
  return templateCatalog.find((item) => item.id === id);
}
