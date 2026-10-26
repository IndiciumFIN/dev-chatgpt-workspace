import type { Dest } from "@/lib/sections";
import { calculators, scales, simulations } from "@/lib/site-data";
import { slugify } from "@/lib/slug";

export type NavNode = {
  id: string;
  label: string;
  dest?: Dest;
  live?: boolean;
  tone?: "guide" | "enter" | "subscribe";
  groups?: { label?: string; items: NavNode[] }[];
};

function fromTile(title: string, textSlug: string | undefined, section: string): NavNode {
  if (textSlug) {
    return { id: textSlug, label: title, dest: { kind: "tool", slug: textSlug }, live: true };
  }
  const id = slugify(title);
  return { id, label: title, dest: { kind: "section", slug: section, hash: id } };
}

export const primaryNav: NavNode[] = [
  { id: "inicio", label: "Início", dest: { kind: "home" } },
  {
    id: "sobre",
    label: "Sobre Nós",
    dest: { kind: "section", slug: "missao-visao-valores" },
    groups: [
      {
        items: [
          { id: "missao", label: "Missão, visão e valores", dest: { kind: "section", slug: "missao-visao-valores" } },
          { id: "objetivo", label: "Objetivo do site", dest: { kind: "section", slug: "objetivos-do-site" } },
          { id: "equipe", label: "Equipe e autores", dest: { kind: "section", slug: "equipe-e-autores" } },
          { id: "mapa", label: "Mapa do site", dest: { kind: "section", slug: "mapa" } },
          { id: "politicas", label: "Políticas do site", dest: { kind: "section", slug: "politicas" } },
          { id: "termos", label: "Termos e condições de uso", dest: { kind: "section", slug: "termos" } },
          { id: "compromisso", label: "Sustentabilidade digital", dest: { kind: "section", slug: "compromisso" } },
        ],
      },
    ],
  },
  {
    id: "calculadoras",
    label: "Calculadoras",
    dest: { kind: "section", slug: "calculadoras" },
    groups: [
      {
        label: "No ar",
        items: calculators.filter((item) => item.slug).map((item) => fromTile(item.title, item.slug, "calculadoras")),
      },
      {
        label: "Catálogo",
        items: [
          ...calculators.filter((item) => !item.slug).map((item) => fromTile(item.title, item.slug, "calculadoras")),
          { id: "todas-calc", label: "Ver todas as calculadoras", dest: { kind: "section", slug: "calculadoras" } },
        ],
      },
      {
        label: "Escalas",
        items: [
          ...scales.filter((item) => item.slug).map((item) => fromTile(item.title, item.slug, "escalas")),
          ...scales.filter((item) => !item.slug).map((item) => fromTile(item.title, item.slug, "escalas")),
          { id: "todas-escalas", label: "Ver todas as escalas", dest: { kind: "section", slug: "escalas" } },
        ],
      },
    ],
  },
  {
    id: "conteudos",
    label: "Conteúdos",
    dest: { kind: "section", slug: "conteudos" },
    groups: [
      {
        items: [
          { id: "nsp", label: "Núcleo de Segurança do Paciente", dest: { kind: "section", slug: "conteudos", hash: "nsp" } },
          { id: "sus", label: "Saúde pública", dest: { kind: "section", slug: "conteudos", hash: "sus" } },
          { id: "leis", label: "Legislações de enfermagem", dest: { kind: "section", slug: "conteudos", hash: "leis" } },
          { id: "literatura", label: "Literatura, NANDA, NIC e NOC", dest: { kind: "section", slug: "conteudos", hash: "literatura" } },
          { id: "urgencia", label: "Urgência e emergência", dest: { kind: "section", slug: "conteudos", hash: "urgencia" } },
          { id: "centro", label: "Bloco, clínica e trabalho", dest: { kind: "section", slug: "conteudos", hash: "centro" } },
          { id: "materno", label: "Obstetrícia e neonatologia", dest: { kind: "section", slug: "conteudos", hash: "materno" } },
        ],
      },
    ],
  },
  {
    id: "carreira",
    label: "Carreira",
    dest: { kind: "section", slug: "carreira" },
    groups: [
      { label: "Minha carreira", items: [
        { id: "career-passport", label: "Passaporte profissional", dest: { kind: "section", slug: "carreira", hash: "passaporte" } },
        { id: "career-skills", label: "Skills e gaps", dest: { kind: "section", slug: "carreira", hash: "skills" } },
        { id: "career-paths", label: "Trilhas de carreira", dest: { kind: "section", slug: "carreira", hash: "trilhas" } },
        { id: "career-docs", label: "Currículo e documentos", dest: { kind: "section", slug: "carreira", hash: "documentos" } },
      ]},
      { label: "Oportunidades", items: [
        { id: "career-opps", label: "Vagas, concursos e oportunidades", dest: { kind: "section", slug: "carreira", hash: "oportunidades" } },
        { id: "career-apps", label: "Minhas candidaturas", dest: { kind: "section", slug: "carreira", hash: "candidaturas" } },
        { id: "career-credentials", label: "Credenciais", dest: { kind: "section", slug: "carreira", hash: "credenciais" } },
        { id: "emprego", label: "Sites de Emprego", dest: { kind: "section", slug: "emprego" } },
      ]},
    ],
  },
  {
    id: "jovens",
    label: "Jovens",
    dest: { kind: "section", slug: "jovens" },
    groups: [
      { items: [
        { id: "youth-discover", label: "Descobrir profissões", dest: { kind: "section", slug: "jovens", hash: "descobrir" } },
        { id: "youth-nursing", label: "Enfermagem como carreira", dest: { kind: "section", slug: "jovens", hash: "enfermagem-carreira" } },
        { id: "youth-reflect", label: "Explorar interesses", dest: { kind: "section", slug: "jovens", hash: "autoconhecimento" } },
        { id: "youth-first", label: "Primeiros passos", dest: { kind: "section", slug: "jovens", hash: "primeiros-passos" } },
        { id: "youth-games", label: "Jogos e quizzes", dest: { kind: "section", slug: "jovens", hash: "jogos-quizzes" } },
      ]},
    ],
  },
  {
    id: "simulados",
    label: "Simulados",
    dest: { kind: "section", slug: "simulados" },
    groups: [
      {
        items: simulations.map((item) => fromTile(item.title, item.slug, "simulados")),
      },
    ],
  },
  {
    id: "biblioteca",
    label: "Biblioteca de enfermagem",
    dest: { kind: "section", slug: "biblioteca" },
    groups: [
      {
        items: [
          { id: "formularios", label: "Formulários de escalas", dest: { kind: "section", slug: "biblioteca", hash: "formularios" } },
          { id: "anatomia", label: "Anatomia", dest: { kind: "model", id: "biblioteca", hash: "anatomia" }, live: true },
          { id: "seringas", label: "Seringas e agulhas", dest: { kind: "model", id: "biblioteca", hash: "seringas" }, live: true },
          { id: "imagens", label: "Imagens", dest: { kind: "model", id: "biblioteca", hash: "imagens" }, live: true },
          { id: "pdfs", label: "PDFs", dest: { kind: "model", id: "biblioteca", hash: "pdfs" }, live: true },
          { id: "slides", label: "Slides", dest: { kind: "model", id: "biblioteca", hash: "slides" }, live: true },
          { id: "infograficos", label: "Infográficos", dest: { kind: "model", id: "biblioteca", hash: "infograficos" }, live: true },
          { id: "acervo", label: "Acervo", dest: { kind: "section", slug: "biblioteca", hash: "acervo" } },
          { id: "blog", label: "Blog de enfermagem", dest: { kind: "section", slug: "biblioteca", hash: "blog" } },
          { id: "provas", label: "Provas de concurso", dest: { kind: "section", slug: "biblioteca", hash: "provas" } },
        ],
      },
    ],
  },
  { id: "contato", label: "Fale Conosco", dest: { kind: "section", slug: "contato" } },
];

export const accountNav: NavNode[] = [
  { id: "entrar", label: "Entrar", tone: "enter", dest: { kind: "page", to: "/login" } },
  { id: "assinatura", label: "Assine já", tone: "subscribe", dest: { kind: "section", slug: "assinatura" } },
];

export function findByQuery(query: string): Dest | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  const nodes: NavNode[] = [];
  function walk(list: NavNode[]) {
    for (const node of list) {
      nodes.push(node);
      for (const group of node.groups ?? []) walk(group.items);
    }
  }
  walk([...primaryNav, ...accountNav]);
  const hit = nodes.find((node) => node.live && node.label.toLowerCase().includes(q) && node.dest);
  return hit?.dest ?? nodes.find((node) => node.label.toLowerCase().includes(q) && node.dest)?.dest;
}
