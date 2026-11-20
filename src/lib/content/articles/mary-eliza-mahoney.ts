import type { ArticleEntry } from "./types.ts";

/** Biografia de Mary Eliza Mahoney — primeira entrada do catálogo de artigos. */
export const article: ArticleEntry = {
    slug: "mary-eliza-mahoney",
    title: "Mary Eliza Mahoney",
    seoTitle: "Mary Eliza Mahoney: biografia e linha do tempo",
    description:
      "Biografia de Mary Eliza Mahoney (1845–1926), pioneira da enfermagem afro-americana, com fotografia histórica e linha do tempo documentada.",
    eyebrow: "História da enfermagem · Pessoas e pioneiros",
    lead: "A enfermeira pioneira cuja trajetória reuniu formação profissional, cuidado e defesa da igualdade de oportunidades nos Estados Unidos.",
    toc: [
      ["introducao", "Introdução"],
      ["origens", "1. Origens e formação"],
      ["carreira", "2. Carreira profissional"],
      ["associacao", "3. Organização profissional e ativismo"],
      ["linha-do-tempo", "4. Linha do tempo"],
      ["contexto", "5. Por que sua história importa?"],
      ["faq", "6. Perguntas frequentes"],
      ["referencias", "Referências"],
    ],
    dateModified: "2026-10-10",
    schema: { "@type": "Person", name: "Mary Eliza Mahoney", birthDate: "1845", deathDate: "1926-01-04" },
    section: "biblioteca",
  };