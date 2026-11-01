const languages = ["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl", "ru", "sv", "tr", "uk", "vi", "zh"] as const;

export const editionLabel: Record<string, string> = {
  "pt-BR": "Português",
  ar: "العربية",
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  id: "Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pl: "Polski",
  ru: "Русский",
  sv: "Svenska",
  tr: "Türkçe",
  uk: "Українська",
  vi: "Tiếng Việt",
  zh: "中文",
};

export function isShellHtml(html: string) {
  return html.includes("premium-content-placeholder") || html.includes("Carregando conteúdo protegido");
}

export function canonicalOf(path: string) {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length > 1 && (languages as readonly string[]).includes(parts[0] ?? "")) parts.shift();
  return `/${parts.join("/")}`;
}

export function editionPaths(path: string) {
  const canonical = canonicalOf(path);
  return ["pt-BR", ...languages].map((code) => (code === "pt-BR" ? canonical : `/${code}${canonical}`));
}

export function resolveHref(page: string, href: string) {
  const raw = href.trim();
  if (!raw || /^[#]|^(mailto:|tel:|javascript:)/i.test(raw)) return null;
  let path = raw.split("#")[0]?.split("?")[0] ?? "";
  if (!path || path.startsWith("//")) return null;
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (!url.hostname.endsWith("calculadorasdeenfermagem.com.br")) return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/")) {
    const base = page.split("/").slice(0, -1).join("/");
    path = `${base}/${path}`;
  }
  const parts: string[] = [];
  for (const bit of path.split("/")) {
    if (!bit || bit === ".") continue;
    if (bit === "..") parts.pop();
    else parts.push(bit);
  }
  const normal = `/${parts.join("/")}`;
  if (!normal.endsWith(".html") || normal.includes("/conta/") || parts.some((bit) => bit.startsWith("."))) return null;
  return normal;
}

export function shellBody(page: string, published: ReadonlySet<string>) {
  const canonical = canonicalOf(page);
  const lines = ["A tradução desta página não está no repositório."];
  if (canonical !== page && published.has(canonical)) lines.push(`[[Versão em português|${canonical}]]`);
  return lines.join("\n");
}

function anchorLabel(inner: string) {
  return inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().replace(/[[\]|]/g, " ").slice(0, 180);
}

export function linkedHtml(html: string, page: string, published: ReadonlySet<string>) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs: string, inner: string) => {
    const href = attrs.match(/href=["']([^"']+)["']/i)?.[1];
    const label = anchorLabel(inner);
    const target = href ? resolveHref(page, href) : null;
    if (!href || !label || !target || target === page || !published.has(target)) return label || inner;
    return `[[${label}|${target}]]`;
  });
}

export function editionOf(path: string) {
  const top = path.replace(/^\//, "").split("/")[0] ?? "";
  const code = (languages as readonly string[]).includes(top) ? top : "pt-BR";
  return { code, label: editionLabel[code] ?? code, path };
}
