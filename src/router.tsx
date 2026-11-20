import { createRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/site/not-found";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeIds } from "@/lib/contracts";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // Carrega os contratos como invariantes reais de runtime e confirma a rota inicial.
  // Nao basta o JSON existir: esta verificacao opera no bootstrap do router.
  if (!routeIds.some((route) => route.file === "src/routes/index.tsx")) {
    throw new Error("CE-CONTRACT-ROUTES: rota inicial ausente do indice canonico");
  }
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
