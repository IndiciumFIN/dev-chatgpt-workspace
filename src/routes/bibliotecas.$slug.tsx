import { createFileRoute, notFound, Outlet, retainSearchParams } from "@tanstack/react-router";
import { getLibrary } from "@/lib/bibliotecas";
import { parseLocale } from "@/lib/translate";
import type { Locale } from "@/lib/chrome";

/**
 * Rota PAI de `/bibliotecas/$slug` e `/bibliotecas/$slug/$object`.
 *
 * Sem `<Outlet />` o filho nunca renderiza — toda URL de objeto caia no hub.
 * O padrao do site para rota pai e `component: () => <Outlet />`
 * (ver `institucional.$hub.tsx`).
 *
 * A validacao do slug mora aqui: ela roda para o hub E para o objeto.
 */
export const Route = createFileRoute("/bibliotecas/$slug")({
  search: { middlewares: [retainSearchParams(["lang"])] },
  validateSearch: (search: Record<string, unknown>): { lang?: Locale } => {
    const lang = parseLocale(search.lang);
    return { ...(lang ? { lang } : {}) };
  },
  loader: ({ params }) => {
    const lib = getLibrary(params.slug);
    if (!lib || lib.slug === "acervo-a-classificar") throw notFound();
    return { slug: lib.slug, title: lib.title, lead: lib.subtitle };
  },
  component: () => <Outlet />,
});
