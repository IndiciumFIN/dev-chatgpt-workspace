/**
 * Catalogo de templates do produto — um para cada formato de conteudo.
 *
 * A lista veio do dono. Cada entrada diz:
 *   - qual pagina o implementa HOJE (`url`) ou `null` se ainda nao existe;
 *   - qual kind do contrato de template ele usa;
 *   - de onde vem a materia-prima, quando vier.
 *
 * O que e montagem e o que nao e:
 *   - MONTAGEM: o perfil UE-LTS existe, o catalogo editorial tem o tipo, e a
 *     pagina e o renderer. O papel entra no lugar.
 *   - CONTEUDO GOVERNADO: a escala/calculadora nova precisa de fonte
 *     normativa qualificada e binding por campo. Nao e montagem.
 */
export type TemplateSituacao = "montagem" | "conteudo-governado" | "a-definir";

export type TemplateCatalogo = {
  id: string;
  nome: string;
  /** A pagina que implementa o template hoje, ou null se ainda nao existe. */
  url: string | null;
  /** O kind do contrato de template (ver template-contract.ts). */
  kind: string;
  situacao: TemplateSituacao;
  /** De onde vem a materia-prima. */
  materiaPrima: string;
  /** O frame que a PAGINA usa. */
  frame: "shell" | "area" | "admin" | "login" | "home";
  /** O estilo da nota que a PAGINA apresenta. */
  note: "callout" | "inline" | "none";
};

export const templateCatalogo: TemplateCatalogo[] = [
  { id: "home", frame: "home", note: "none", nome: "Home", url: "/", kind: "home", situacao: "montagem", materiaPrima: "composicao do site" },
  { id: "institucional", frame: "shell", note: "callout", nome: "Institucional", url: "/modelos/institucional", kind: "editorial", situacao: "montagem", materiaPrima: "familia 'institucional'" },
  { id: "escala-calculadora", frame: "shell", note: "none", nome: "Escala / Calculadora", url: "/ferramentas/braden", kind: "ferramenta", situacao: "montagem", materiaPrima: "catalogo de ferramentas" },

  { id: "calculadoras-trabalhistas", frame: "shell", note: "none", nome: "Calculadoras Trabalhistas", url: null, kind: "ferramenta", situacao: "conteudo-governado", materiaPrima: "CFM/ANVISA/COREN — a qualificar" },
  { id: "doencas-compulsorias", frame: "shell", note: "none", nome: "Doencas Compulsorias", url: null, kind: "ferramenta", situacao: "conteudo-governado", materiaPrima: "CFM/CID — a qualificar" },
  { id: "exames-laboratoriais", frame: "shell", note: "none", url: null, nome: "Exames Laboratoriais", kind: "ferramenta", situacao: "conteudo-governado", materiaPrima: "consensos/sociedades — a qualificar" },
  { id: "sbar", frame: "shell", note: "none", nome: "SBAR", url: null, kind: "ferramenta", situacao: "conteudo-governado", materiaPrima: "protocolo de passagem de plantao — a qualificar" },

  { id: "nanda-nic-noc", frame: "shell", note: "none", nome: "NANDA, NIC, NOC", url: "/secao/nanda", kind: "secao", situacao: "montagem", materiaPrima: "secao + catalogo NANDA" },
  { id: "bibliotecas", frame: "shell", note: "inline", nome: "Bibliotecas de Anatomia e diversas", url: "/modelos/biblioteca", kind: "biblioteca", situacao: "montagem", materiaPrima: "acervo AVIF (262 arquivos) + hubs" },
  { id: "biblioteca-imagens", frame: "shell", note: "inline", nome: "Biblioteca de Imagens", url: "/bibliotecas/anatomia", kind: "biblioteca", situacao: "montagem", materiaPrima: "acervo AVIF + pacote de referencia CKO" },

  { id: "normativo", frame: "shell", note: "none", nome: "Conteudo normativo (atomizado)", url: "/modelos/norma", kind: "norma", situacao: "montagem", materiaPrima: "familia 'norma'" },
  { id: "editorial-curto", frame: "shell", note: "inline", nome: "Conteudo editorial (curto)", url: "/modelos/TPL-001", kind: "editorial", situacao: "montagem", materiaPrima: "catalogo editorial (21 pecas)" },
  { id: "editorial-longo", frame: "shell", note: "inline", nome: "Conteudo editorial (longo)", url: "/blog/mary-eliza-mahoney", kind: "artigo", situacao: "montagem", materiaPrima: "catalogo de artigos" },
  { id: "curiosidades", frame: "shell", note: "inline", nome: "Conteudo de curiosidades", url: null, kind: "artigo", situacao: "a-definir", materiaPrima: "87 slots reservados, sem conteudo escrito" },
  { id: "carreira-concursos", frame: "shell", note: "none", nome: "Carreira e concursos (+ gerador de curriculo)", url: "/secao/concurso", kind: "secao", situacao: "a-definir", materiaPrima: "secao de concurso + gerador de curriculo (a criar)" },
  { id: "ferramentas-pesquisa", frame: "shell", note: "none", nome: "Ferramentas de pesquisa", url: null, kind: "ferramenta", situacao: "a-definir", materiaPrima: "a definir com o dono" },
  { id: "forum", frame: "shell", note: "inline", nome: "Forum de enfermagem", url: null, kind: "editorial", situacao: "a-definir", materiaPrima: "a definir com o dono" },
  { id: "album", frame: "shell", note: "inline", nome: "Album de Enfermagem", url: null, kind: "biblioteca", situacao: "a-definir", materiaPrima: "a definir com o dono" },

  { id: "area-assinante", frame: "area", note: "none", nome: "Area do Assinante", url: "/assinante", kind: "area", situacao: "montagem", materiaPrima: "AreaFrame" },
  { id: "area-admin", frame: "admin", note: "none", nome: "Area do administrador", url: "/admin", kind: "area", situacao: "montagem", materiaPrima: "LocalWorkbenchPage" },

  { id: "flashcard", frame: "shell", note: "inline", nome: "Flashcard", url: "/modelos/TPL-FLASHCARD-001", kind: "editorial", situacao: "montagem", materiaPrima: "perfil UE-LTS TPL-FLASHCARD-001" },
  { id: "casos-clinicos", frame: "shell", note: "none", nome: "Casos Clinicos", url: "/modelos/TPL-005", kind: "editorial", situacao: "montagem", materiaPrima: "catalogo TPL-005 + perfil UE-LTS TPL-CASE-001" },
  { id: "quiz", frame: "shell", note: "inline", nome: "Quiz", url: "/modelos/TPL-QUIZ-001", kind: "editorial", situacao: "montagem", materiaPrima: "perfil UE-LTS TPL-QUIZ-001" },
  { id: "simulados", frame: "shell", note: "inline", nome: "Simulados", url: "/modelos/TPL-SIMULADO-001", kind: "editorial", situacao: "montagem", materiaPrima: "perfil UE-LTS TPL-QUIZ-001 (canal de simulado)" },
  { id: "infograficos", frame: "shell", note: "inline", nome: "Infograficos", url: "/modelos/TPL-009", kind: "editorial", situacao: "montagem", materiaPrima: "catalogo TPL-009 + perfil UE-LTS TPL-INFOGRAPHIC-001" },
  { id: "slides", frame: "shell", note: "inline", nome: "Slides", url: "/modelos/slides", kind: "editorial", situacao: "montagem", materiaPrima: "familia 'slides' + perfil UE-LTS TPL-SLIDES-001" },
  { id: "provas", frame: "shell", note: "inline", nome: "Provas", url: "/modelos/TPL-PROVA-001", kind: "editorial", situacao: "montagem", materiaPrima: "TPL-PROVA-001 — PEÇA ENTREGUE" },
  { id: "ebook", frame: "shell", note: "inline", nome: "Ebook", url: "/modelos/TPL-EBOOK-001", kind: "editorial", situacao: "montagem", materiaPrima: "TPL-EBOOK-001 — PEÇA ENTREGUE" },
  { id: "manual", frame: "shell", note: "callout", nome: "Manual de Enfermagem", url: "/modelos/guia", kind: "guia", situacao: "montagem", materiaPrima: "familia 'guia' + perfil UE-LTS TPL-POCKET-GUIDE-001" },
  { id: "formularios", frame: "shell", note: "callout", nome: "Formularios de escalas/calculadoras", url: "/modelos/formulario", kind: "editorial", situacao: "montagem", materiaPrima: "recurso 'formulario' do contrato da ferramenta" },
];

/** Quantos ja tem pagina, e como se repartem por situacao. */
export function resumoCatalogo() {
  const comPagina = templateCatalogo.filter((t) => t.url);
  const semPagina = templateCatalogo.filter((t) => !t.url);
  const porSituacao = { montagem: 0, "conteudo-governado": 0, "a-definir": 0 } as Record<string, number>;
  for (const t of templateCatalogo) porSituacao[t.situacao] = (porSituacao[t.situacao] ?? 0) + 1;
  return { total: templateCatalogo.length, comPagina, semPagina, porSituacao };
}
