import { createRootRoute, HeadContent, Outlet, Scripts, retainSearchParams, useRouterState } from "@tanstack/react-router";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AuthProvider } from "@/lib/auth/provider";
import { ChromeProvider } from "@/lib/chrome";
import { parseLocale } from "@/lib/translate";
import { readStoredSite } from "@/lib/stored.functions";
import { StoredProvider } from "@/lib/stored";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>) => {
    const lang = parseLocale(search.lang);
    return lang ? { lang } : {};
  },
  search: {
    middlewares: [retainSearchParams(["lang"])],
  },
  headers: () => ({
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  }),
  loader: () => readStoredSite(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Calculadoras de Enfermagem" },
      { name: "theme-color", content: "#1A3E74" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Lexend:wght@400;600;700&family=Nunito+Sans:wght@700;800&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const stored = Route.useLoaderData();
  const lang = useRouterState({
    select: (state) => parseLocale((state.location.search as { lang?: unknown }).lang) ?? "pt-BR",
  });
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <StoredProvider value={stored}>
            <ChromeProvider>
              <Outlet />
            </ChromeProvider>
          </StoredProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
