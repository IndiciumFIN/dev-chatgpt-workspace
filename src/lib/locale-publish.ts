const locales = new Set(["ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl", "ru", "sv", "tr", "uk", "vi", "zh"]);

export const publishLocaleStatement = `
update content_text as copy
set status = 'publicado'
where copy.slug = $1
  and copy.locale = $2
  and copy.status = 'rascunho'
  and exists (
    select 1 from content_alias as alias
    where alias.slug = copy.slug
      and alias.locale = copy.locale
      and alias.view = copy.view
  )
returning copy.slug
`;

export function assertLocalePublish(slug: string, locale: string) {
  if (typeof slug !== "string" || !/^[a-z0-9][a-z0-9_./-]{0,159}$/.test(slug) || slug.includes("..")) {
    throw new Error("Objeto inválido.");
  }
  if (!locales.has(locale)) throw new Error("Idioma inválido.");
  return { slug, locale };
}
