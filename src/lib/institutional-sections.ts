import { institutionalPages } from "@/lib/institutional";
import type { Section } from "@/lib/sections";

const skip = new Set([
  "",
  "sobre",
  "sobre/fale-conosco",
  "privacidade",
  "privacidade/politica-de-privacidade",
  "privacidade/cookies-e-consentimento",
  "acessibilidade",
  "acessibilidade/declaracao-de-acessibilidade",
  "sustentabilidade",
  "sustentabilidade/compromisso-e-praticas",
  "assinante",
  "assinante/termos-de-uso",
  "editorial",
]);

function ready(text: string) {
  return text.replace(/PENDENTE:[^.]*/g, "").replace(/\bPENDENTE\b/g, "").replace(/\s+/g, " ").trim();
}

function usable(text: string) {
  if (text.length < 24) return false;
  if (/formação:\s*·/.test(text) || /COREN-UF\s*$/.test(text)) return false;
  return true;
}

function toSection(path: string): Section | undefined {
  if (skip.has(path) || !path.includes("/")) return undefined;
  const page = institutionalPages.find((item) => item.path === path);
  if (!page || page.kind === "hub") return undefined;
  const slug = path.split("/")[1];
  const blocks = page.sections
    .map((section, index) => ({ id: `${slug}-${index + 1}`, title: section.title, text: ready(section.text), items: [] }))
    .filter((block) => usable(block.text ?? ""));
  return {
    slug,
    kicker: page.kicker,
    title: page.title,
    lead: ready(page.lead),
    kind: "pages",
    blocks,
  };
}

const extra = institutionalPages.map((page) => toSection(page.path)).filter((page): page is Section => Boolean(page));

const familyBySlug = new Map<string, { id: string; label: string }>();

for (const slug of ["politicas", "termos", "acessibilidade", "contato", "mapa", "sobre"]) {
  familyBySlug.set(slug, { id: slug === "sobre" ? "sobre" : slug, label: slug });
}
for (const slug of ["missao-visao-valores", "objetivos-do-site", "equipe-e-autores"]) {
  familyBySlug.set(slug, { id: "sobre", label: "Sobre" });
}
familyBySlug.set("compromisso", { id: "sustentabilidade", label: "Sustentabilidade" });

for (const page of institutionalPages) {
  if (skip.has(page.path) || page.kind === "hub" || !page.path.includes("/")) continue;
  const slug = page.path.split("/")[1];
  const root = page.path.split("/")[0];
  if (root === "sustentabilidade") familyBySlug.set(slug, { id: "sustentabilidade", label: "Sustentabilidade" });
  if (root === "editorial") familyBySlug.set(slug, { id: "editorial", label: "Editorial" });
  if (root === "assinante") familyBySlug.set(slug, { id: "assinante", label: "Assinante" });
}

const heads: Record<string, { label: string; slug: string }> = {
  sobre: { label: "Sobre Nós", slug: "missao-visao-valores" },
  sustentabilidade: { label: "Sustentabilidade", slug: "compromisso" },
  editorial: { label: "Editorial", slug: "politica-editorial" },
  assinante: { label: "Assinante", slug: "planos" },
};

export function familyTabs(slug: string) {
  const family = familyBySlug.get(slug);
  if (!family) return [];
  if (family.id === "sobre") {
    return [
      { slug: "missao-visao-valores", label: "Missão", text: "Por que a plataforma existe e o que orienta o conteúdo." },
      { slug: "objetivos-do-site", label: "Objetivo", text: "O que o site oferece a quem estuda e a quem trabalha na assistência." },
      { slug: "equipe-e-autores", label: "Equipe", text: "Quem desenvolve, quem revisa e quem responde pelo conteúdo." },
    ];
  }
  const tabs: { slug: string; label: string; text: string }[] = [];
  if (family.id === "sustentabilidade") {
    tabs.push({ slug: "compromisso", label: "Sustentabilidade", text: "Práticas para reduzir o consumo digital do site." });
  }
  for (const page of extra) {
    if (familyBySlug.get(page.slug)?.id === family.id && page.slug !== "compromisso") {
      tabs.push({ slug: page.slug, label: page.title, text: page.lead });
    }
  }
  return tabs;
}

export function institutionalTrail(slug: string) {
  const family = familyBySlug.get(slug);
  const head = family ? heads[family.id] : undefined;
  if (!head) return [];
  if (slug === head.slug) return [{ label: head.label }];
  return [{ label: head.label, slug: head.slug }];
}

export function isInstitutionalPage(slug: string) {
  return familyBySlug.has(slug);
}

export function extraSection(slug: string) {
  return extra.find((page) => page.slug === slug);
}

export function extraSections() {
  return extra;
}
