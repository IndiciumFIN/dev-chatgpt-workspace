import type { Locale } from "@/lib/chrome";
import { isCanonicalLocale } from "@/lib/locale-registry";
import { headerLocales } from "@/lib/header-i18n";

const targets: Record<Exclude<Locale, "pt-BR">, string> = Object.fromEntries(headerLocales.filter((x) => x.id !== "pt-BR").map((x) => [x.id, x.id])) as Record<Exclude<Locale, "pt-BR">, string>;

const menu: Record<string, Partial<Record<Locale, string>>> = {
  concurso: { en: "Santos exam", es: "Concurso Santos", fr: "Concours Santos" },
  "guia-santos": {
    en: "Full study guide for the Santos 74/2026 exam (Nurse)",
    es: "Guía completa para el concurso Santos 74/2026 (Enfermero)",
    fr: "Guide complet du concours Santos 74/2026 (Infirmier)",
  },
  inicio: { en: "Home", es: "Inicio", fr: "Accueil" },
  sobre: { en: "About", es: "Sobre nosotros", fr: "À propos" },
  missao: { en: "Mission, vision and values", es: "Misión, visión y valores", fr: "Mission, vision et valeurs" },
  objetivo: { en: "Purpose of the site", es: "Objetivo del sitio", fr: "Objectif du site" },
  mapa: { en: "Site map", es: "Mapa del sitio", fr: "Plan du site" },
  cookies: { en: "Cookie policy", es: "Política de cookies", fr: "Politique de cookies" },
  retencao: { en: "Data retention policy", es: "Política de retención", fr: "Politique de conservation" },
  lgpd: { en: "Data protection", es: "Protección de datos", fr: "Protection des données" },
  privacidade: { en: "Privacy policy", es: "Política de privacidad", fr: "Politique de confidentialité" },
  acessibilidade: { en: "Accessibility policy", es: "Política de accesibilidad", fr: "Politique d'accessibilité" },
  impacto: { en: "Impact report", es: "Informe de impacto", fr: "Rapport d'impact" },
  verde: { en: "Green technology", es: "Tecnología verde", fr: "Technologie verte" },
  politicas: { en: "Site policies", es: "Políticas del sitio", fr: "Politiques du site" },
  termos: { en: "Terms of use", es: "Términos y condiciones", fr: "Conditions d'utilisation" },
  compromisso: { en: "Digital sustainability", es: "Sostenibilidad digital", fr: "Durabilité numérique" },
  calculadoras: { en: "Calculators", es: "Calculadoras", fr: "Calculatrices" },
  "No ar": { en: "Live", es: "En línea", fr: "En ligne" },
  Catálogo: { en: "Catalog", es: "Catálogo", fr: "Catalogue" },
  "todas-calc": { en: "See all calculators", es: "Ver todas las calculadoras", fr: "Voir toutes les calculatrices" },
  Escalas: { en: "Scales", es: "Escalas", fr: "Échelles" },
  "todas-escalas": { en: "See all scales", es: "Ver todas las escalas", fr: "Voir toutes les échelles" },
  conteudos: { en: "Contents", es: "Contenidos", fr: "Contenus" },
  nsp: { en: "Patient safety unit", es: "Núcleo de seguridad del paciente", fr: "Unité de sécurité des patients" },
  sus: { en: "Public health", es: "Salud pública", fr: "Santé publique" },
  leis: { en: "Nursing legislation", es: "Legislación de enfermería", fr: "Législation infirmière" },
  literatura: { en: "Literature, NANDA, NIC and NOC", es: "Literatura, NANDA, NIC y NOC", fr: "Littérature, NANDA, NIC et NOC" },
  urgencia: { en: "Emergency care", es: "Urgencia y emergencia", fr: "Urgences" },
  centro: { en: "Operating room, clinic and work", es: "Bloque, clínica y trabajo", fr: "Bloc, clinique et travail" },
  materno: { en: "Obstetrics and neonatology", es: "Obstetricia y neonatología", fr: "Obstétrique et néonatologie" },
  emprego: { en: "Job sites", es: "Empleo", fr: "Emploi" },
  simulados: { en: "Quizzes", es: "Simulacros", fr: "QCM" },
  biblioteca: { en: "Nursing library", es: "Biblioteca", fr: "Bibliothèque" },
  formularios: { en: "Scale forms", es: "Formularios de escalas", fr: "Formulaires d'échelles" },
  acervo: { en: "Collection", es: "Acervo", fr: "Fonds" },
  blog: { en: "Nursing blog", es: "Blog de enfermería", fr: "Blog infirmier" },
  provas: { en: "Exam papers", es: "Pruebas de concurso", fr: "Sujets de concours" },
  contato: { en: "Contact", es: "Contacto", fr: "Contact" },
  entrar: { en: "Sign in", es: "Entrar", fr: "Connexion" },
  area: { en: "Your area", es: "Tu área", fr: "Votre espace" },
  admin: { en: "Administrator", es: "Administrador", fr: "Administrateur" },
  assinante: { en: "Subscriber", es: "Suscriptor", fr: "Abonné" },
  assinatura: { en: "Subscribe", es: "Suscribirse", fr: "S'abonner" },
};

export function parseLocale(value: unknown): Locale | undefined {
  if (isCanonicalLocale(value)) return value as Locale;
  return undefined;
}

export function navLabel(id: string, fallback: string, locale: Locale) {
  if (locale === "pt-BR") return fallback;
  return menu[id]?.[locale] ?? menu[fallback]?.[locale] ?? fallback;
}

const memory = new Map<string, string>();
let queue: Promise<void> = Promise.resolve();

function remember(key: string, value: string) {
  memory.set(key, value);
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* quota or private mode */
  }
}

function recall(key: string) {
  const hot = memory.get(key);
  if (hot) return hot;
  try {
    const cold = sessionStorage.getItem(key);
    if (cold) memory.set(key, cold);
    return cold;
  } catch {
    return null;
  }
}

export function translateText(text: string, locale: Locale): Promise<string> {
  const source = text.trim();
  if (!source || locale === "pt-BR") return Promise.resolve(text);
  const known = menu[source]?.[locale];
  if (known) return Promise.resolve(known);
  const key = `cde-mt:${locale}:${source}`;
  const cached = recall(key);
  if (cached) return Promise.resolve(cached);
  const run = queue.then(async () => {
    const again = recall(key);
    if (again) return again;
    const pair = `pt-BR|${targets[locale]}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source.slice(0, 450))}&langpair=${pair}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return text;
      const data = (await response.json()) as {
        quotaFinished?: boolean;
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };
      const out = data.responseData?.translatedText?.trim();
      if (!out || data.quotaFinished || data.responseStatus !== 200) return text;
      if (/MYMEMORY WARNING|QUERY LENGTH|INVALID LANGUAGE/i.test(out)) return text;
      remember(key, out);
      return out;
    } catch {
      return text;
    }
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
