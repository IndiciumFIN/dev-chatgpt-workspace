import type { ClinicalTool } from "@/lib/tools/types";

import { siteOrigin } from "@/lib/site-origin";
export { siteOrigin };

import { hasInterfaceDictionary, isCanonicalLocale, legacySeoLocales } from "@/lib/locale-registry";
import { alternateLocales, canonicalLocale, routeEntry } from "@/lib/route-registry";
const locales = legacySeoLocales;

export function pageLang(value: unknown) {
  if (isCanonicalLocale(value)) return value;
  return "pt-BR";
}

export function absoluteUrl(path: string, lang: string = "pt-BR") {
  const url = new URL(path, siteOrigin);
  if (lang !== "pt-BR") url.searchParams.set("lang", lang);
  return url.toString();
}

/**
 * Canonical e hreflang, derivados do Route Registry (UTC-051).
 *
 * Um idioma SEM dicionario de interface entrega o mesmo conteudo do portugues.
 * Canonizar para si mesmo dizia ao buscador que sao paginas distintas — e sao
 * 15 copias byte-a-byte da mesma pagina pt-BR, todas indexaveis, todas
 * competindo entre si. Canoniza para a versao pt-BR: o buscador indexa uma
 * vez, e o visitante que pediu `?lang=ja` continua recebendo a pagina.
 *
 * O caminho vem do registry: uma rota que nao esta nele e um bug do
 * registry, nao um canonical para montar na mao.
 */
export function languageLinks(path: string, lang: unknown) {
  const canonicalLang = canonicalLocale(lang);
  return [
    { rel: "canonical", href: absoluteUrl(path, canonicalLang) },
    ...alternateLocales().map((code) => ({
      rel: "alternate" as const,
      hrefLang: code,
      href: absoluteUrl(path, code),
    })),
    { rel: "alternate" as const, hrefLang: "x-default", href: absoluteUrl(path, "pt-BR") },
  ];
}

/** O caminho canonico de uma rota, resolvido pelo registry. */
export function canonicalPath(path: string): string {
  const entry = routeEntry(path);
  return entry ? entry.path : path;
}

export function websiteJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Calculadoras de Enfermagem",
    url: siteOrigin,
    inLanguage: locales,
    description: "Escalas, protocolos e calculadoras clínicas de enfermagem.",
  });
}

/**
 * Dados estruturados de uma PAGINA DE SECAO.
 *
 * As secoes institucionais e de conteudo entravam no sitemap sem nenhum
 * JSON-LD: 18 URLs indexaveis que o buscador nao conseguia classificar.
 * `WebPage` + `BreadcrumbList` e o formato certo para uma pagina pilar.
 *
 * `inLanguage` e "pt-BR" porque o CONTEUDO das secoes e em portugues por
 * decisao — nao pelo idioma escolhido na URL. Ver `contentLocale()`.
 */
export function sectionJsonLd(section: { slug: string; title: string; lead: string }) {
  const url = absoluteUrl(`/secao/${section.slug}`);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: section.title,
        url,
        description: section.lead,
        inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", name: "Calculadoras de Enfermagem", url: siteOrigin },
        publisher: { "@type": "Organization", name: "Calculadoras de Enfermagem", url: siteOrigin },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: siteOrigin },
          { "@type": "ListItem", position: 2, name: section.title, item: url },
        ],
      },
    ],
  });
}

export function toolJsonLd(tool: ClinicalTool) {
  const url = absoluteUrl(`/ferramentas/${tool.slug}`);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: tool.title,
        url,
        description: tool.lead,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        provider: { "@type": "Organization", name: "Calculadoras de Enfermagem", url: siteOrigin },
      },
      {
        "@type": "FAQPage",
        url,
        inLanguage: "pt-BR",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: siteOrigin },
          {
            "@type": "ListItem",
            position: 2,
            name: tool.kind === "escala" ? "Escalas" : "Calculadoras",
            item: absoluteUrl(tool.kind === "escala" ? "/secao/escalas" : "/secao/calculadoras"),
          },
          { "@type": "ListItem", position: 3, name: tool.title, item: url },
        ],
      },
    ],
  });
}
