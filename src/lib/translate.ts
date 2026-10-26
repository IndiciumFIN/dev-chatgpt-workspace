import type { Locale } from "@/lib/chrome";
import { boundLabel } from "@/lib/menu-bind";

const targets: Record<Exclude<Locale, "pt-BR">, string> = {
  en: "en",
  es: "es",
  fr: "fr",
};

export function parseLocale(value: unknown): Locale | undefined {
  if (value === "pt-BR" || value === "en" || value === "es" || value === "fr") return value;
  return undefined;
}

export function navLabel(id: string, fallback: string, locale: Locale) {
  return boundLabel(id, fallback, locale);
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
  const known = boundLabel(source, source, locale);
  if (known !== source) return Promise.resolve(known);
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
