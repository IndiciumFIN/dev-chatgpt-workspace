
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/lib/content/curiosidades";
const catalog = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));
const sources = JSON.parse(readFileSync(join(ROOT, "sources.json"), "utf8"));
const sourceIds = new Set(sources.map((item) => item.source_id));
const pages = readdirSync(join(ROOT, "pages")).filter((name) => name.endsWith(".json"));
const knownComponents = new Set(["checkgrid", "callout", "faq", "pair", "stats", "evidence", "cards", "timeline", "conflict", "quote"]);
const errors = [];
let sections = 0, components = 0, unresolved = 0, unmatchedReferenceCount = 0;
if (catalog.length !== 87 || pages.length !== 87) errors.push("Inventário esperado: 87 registros e 87 páginas.");
if (new Set(catalog.map((item) => item.slug)).size !== catalog.length) errors.push("Slugs duplicados.");
for (const item of catalog) {
  const path = join(ROOT, "pages", item.slug + ".json");
  if (!existsSync(path)) { errors.push("Sem snapshot: " + item.slug); continue; }
  const page = JSON.parse(readFileSync(path, "utf8"));
  if (page.slug !== item.slug || page.content.slug !== item.slug) errors.push("Slug divergente: " + item.slug);
  if (page.content_status !== item.content_status) errors.push("Estado editorial divergente: " + item.slug);
  if (page.content_status === "PUBLISHED") errors.push("Publicação não autorizada: " + item.slug);
  if (page.content.sections.length !== item.section_count) errors.push("Seções divergentes: " + item.slug);
  if (page.content.references.length !== item.reference_count) unmatchedReferenceCount++;
  sections += page.content.sections.length;
  for (const section of page.content.sections) {
    if (!section.id || !section.title || !Array.isArray(section.paragraphs)) errors.push("Seção inválida: " + item.slug);
    for (const component of section.components ?? []) {
      components++;
      if (!knownComponents.has(component.type)) errors.push("Componente não suportado: " + component.type + " em " + item.slug);
    }
  }
  for (const ref of page.content.references) if (!sourceIds.has(ref.id)) unresolved++;
}
console.log(JSON.stringify({ pages: pages.length, catalog: catalog.length, sources: sources.length, sections, components, unmatchedReferenceCount, unresolvedLinks: unresolved, errors }, null, 2));
if (errors.length) process.exit(1);
console.log("PASS: integridade estrutural do snapshot. Não equivale a revisão bibliográfica, clínica, de licenciamento ou visual.");
