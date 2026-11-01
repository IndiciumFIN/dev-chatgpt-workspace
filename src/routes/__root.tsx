import { createRootRoute, HeadContent, Outlet, Scripts, retainSearchParams, useRouterState } from "@tanstack/react-router";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AuthProvider } from "@/lib/auth/provider";
import { ChromeProvider } from "@/lib/chrome";
import { parseLocale } from "@/lib/translate";
import { contentLocale } from "@/lib/locale-registry";
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
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Calculadoras de Enfermagem" },
      { name: "theme-color", content: "#1A3E74" },
      { name: "msapplication-TileColor", content: "#1A3E74" },
      { name: "msapplication-config", content: "/browserconfig.xml" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Lexend:wght@400;600;700;900&family=Nunito+Sans:wght@700;800;900&display=swap",
      },
      // O ícone vem do conjunto gerado a partir da arte do dono
      // (scripts/make-brand-icons.py). Antes disto, o apple-touch-icon apontava
      // para /__grok/icon-180.png — que é o ícone do ChatGPT, não desta marca.
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "152x152", href: "/apple-touch-icon-152x152.png" },
      { rel: "mask-icon", href: "/favicon.svg", color: "#1A3E74" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const lang = useRouterState({
    select: (state) => contentLocale(parseLocale((state.location.search as { lang?: unknown }).lang)),
  });
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <ChromeProvider>
            <Outlet />
          </ChromeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
