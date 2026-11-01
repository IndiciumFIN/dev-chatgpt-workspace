import type { ClinicalTool } from "@/lib/tools/types";

export const siteOrigin = "https://calculadorasdeenfermagem.com.br";

const offered = ["pt-BR", "en", "es", "fr"] as const;

export function pageLang(value: unknown) {
  if (value === "en" || value === "es" || value === "fr" || value === "pt-BR") return value;
  return "pt-BR";
}

export function absoluteUrl(path: string, lang: string = "pt-BR") {
  const url = new URL(path, siteOrigin);
  if (lang !== "pt-BR") url.searchParams.set("lang", lang);
  return url.toString();
}

export function languageLinks(path: string, lang: unknown, published: readonly string[] = ["pt-BR"]) {
  const locales = offered.filter((code) => published.includes(code));
  const list = locales.includes("pt-BR") ? [...locales] : ["pt-BR", ...locales];
  const requested = pageLang(lang);
  const current = list.includes(requested) ? requested : "pt-BR";
  return [
    { rel: "canonical", href: absoluteUrl(path, current) },
    ...list.map((code) => ({
      rel: "alternate" as const,
      hrefLang: code,
      href: absoluteUrl(path, code),
    })),
    { rel: "alternate" as const, hrefLang: "x-default", href: absoluteUrl(path, "pt-BR") },
  ];
}

export function websiteJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Calculadoras de Enfermagem",
    url: siteOrigin,
    inLanguage: ["pt-BR"],
    description: "Escalas, protocolos e calculadoras clínicas de enfermagem.",
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
