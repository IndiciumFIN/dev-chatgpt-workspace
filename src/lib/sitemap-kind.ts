import type { TemplateKind } from "./template-contract";
import { governedSlugs } from "./intake.ts";

const languages = new Set(["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl", "ru", "sv", "tr", "uk", "vi", "zh"]);

export function localeOfPath(path: string) {
  const top = path.replace(/^\//, "").split("/")[0] ?? "";
  return languages.has(top) ? top : "pt-BR";
}

export function kindForSitemap(path: string): TemplateKind {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  const top = parts[0] ?? "";
  const name = parts[parts.length - 1] ?? "";
  if (parts.includes("blog")) return "artigo";
  if (parts.includes("biblioteca") || parts.includes("biblioteca_de_enfermagem")) return "biblioteca";
  if (parts.includes("downloads")) return "editorial";
  if (name.startsWith("guia_")) return "guia";
  if (/legisl|codigo_de_etica|^lei-/.test(name)) return "norma";
  if (name.startsWith("formulario") || top === "escalas-de-enfermagem") return "guia";
  return "secao";
}

const fragments = new Set(["footer.html", "menu-global.html", "global-body-elements.html", "downloads.template.html", "item.template.html"]);

export function shouldPublishPath(path: string) {
  if (!path.startsWith("/") || path.includes("..") || !path.endsWith(".html")) return false;
  const parts = path.slice(1).split("/");
  if (parts.some((part) => part.startsWith(".") || part.startsWith("_"))) return false;
  const file = parts[parts.length - 1] ?? "";
  if (fragments.has(file) || file.startsWith("googlefc")) return false;
  const top = parts.length > 1 ? parts[0] : "";
  if (!top) return file === "politicaapp.html";
  if (file === "index.html" && parts.length === 1) return false;
  return languages.has(top) || top === "escalas-de-enfermagem";
}

export function toolSlugForSitemap(path: string) {
  const name = path.replace(/^\//, "");
  if (name.includes("/")) return null;
  const slug = name.replace(/\.html$/, "");
  if (`${slug}.html` !== name) return null;
  return (governedSlugs as readonly string[]).includes(slug) ? slug : null;
}
