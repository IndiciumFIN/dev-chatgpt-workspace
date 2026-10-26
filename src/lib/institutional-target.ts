export type SectionTarget = { section: string; hash?: string };

/** Um assunto, um destino. A central institucional não repete a seção que já existe. */
export const sectionTarget: Record<string, SectionTarget> = {
  sobre: { section: "sobre" },
  "sobre/fale-conosco": { section: "contato" },
  privacidade: { section: "politicas" },
  "privacidade/politica-de-privacidade": { section: "politicas", hash: "privacidade" },
  "privacidade/cookies-e-consentimento": { section: "politicas", hash: "cookies" },
  acessibilidade: { section: "acessibilidade" },
  "acessibilidade/declaracao-de-acessibilidade": { section: "acessibilidade" },
  sustentabilidade: { section: "compromisso" },
  "sustentabilidade/compromisso-e-praticas": { section: "compromisso" },
  "assinante/termos-de-uso": { section: "termos" },
};

export const hubSeal: Record<string, { src: string; alt: string }> = {
  acessibilidade: { src: "/institucional/selo-acessibilidade.webp", alt: "Selo de acessibilidade digital" },
  privacidade: { src: "/institucional/selo-lgpd.webp", alt: "Selo de proteção de dados" },
  sustentabilidade: { src: "/institucional/selo-sustentabilidade.webp", alt: "Selo de sustentabilidade digital" },
};

export function redirectSection(path: string) {
  const known = sectionTarget[path]?.section;
  if (known) return known;
  if (path === "editorial") return "politica-editorial";
  if (path === "assinante") return "planos";
  if (path.includes("/")) return path.split("/")[1] || "sobre";
  return "sobre";
}

