type Locale = "en" | "es" | "fr";

const menu: Record<string, Partial<Record<Locale, string>>> = {};

export function bindMenu(labels: { locale: string; groupId: string; key: string; text: string }[]) {
  for (const key of Object.keys(menu)) delete menu[key];
  for (const row of labels) {
    if (row.groupId !== "menu") continue;
    const locale = row.locale === "en" || row.locale === "es" || row.locale === "fr" ? row.locale : undefined;
    if (!locale) continue;
    menu[row.key] = { ...menu[row.key], [locale]: row.text };
  }
}

export function boundLabel(id: string, fallback: string, locale: string) {
  if (locale === "pt-BR") return fallback;
  const row = locale === "en" || locale === "es" || locale === "fr" ? menu[id]?.[locale] ?? menu[fallback]?.[locale] : undefined;
  return row ?? fallback;
}
