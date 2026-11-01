/**
 * A origem canonica do site.
 *
 * Vive num modulo proprio porque o Route Registry precisa dela e o `seo.ts`
 * precisa do registry: se `siteOrigin` morasse no `seo.ts`, o registry
 * importaria o `seo.ts` e o `seo.ts` importaria o registry — ciclo.
 */
export const siteOrigin = "https://calculadorasdeenfermagem.com.br";
