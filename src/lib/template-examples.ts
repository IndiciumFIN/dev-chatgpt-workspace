/**
 * Um exemplo de cada kind de template — a Declaracao do par.
 *
 * Deriva do CATALOGO de templates do produto: para cada kind, a primeira
 * pagina do catalogo que o implementa. Fica no codigo, e nao dentro do
 * script de auditoria, porque o gate de release tem de poder conferir que
 * todo kind declarado tem uma pagina declarada. Um mapa que so existe dentro
 * do auditor seria um mapa que ninguem mais ve.
 */
import { templateCatalogo } from "@/lib/template-catalog";

export type TemplateExample = {
  kind: string;
  url: string;
  porQue: string;
  /** O frame que a PAGINA usa. Descreve a pagina, nao o frame generico. */
  frame: "shell" | "area" | "admin" | "login" | "home";
  /** O estilo da nota que a PAGINA apresenta. */
  note: "callout" | "inline" | "none";
};

export const templateExamples: TemplateExample[] = (() => {
  const vistos = new Set<string>();
  const out: TemplateExample[] = [];
  for (const item of templateCatalogo) {
    if (!item.url || vistos.has(item.kind)) continue;
    vistos.add(item.kind);
    out.push({ kind: item.kind, url: item.url, frame: item.frame, note: item.note, porQue: item.nome });
  }
  // `entrada` e um kind com pagina (a tela de login) que nao entra na lista
  // de templates do produto — e mesmo assim tem que ter exemplo.
  if (!vistos.has("entrada")) {
    out.push({ kind: "entrada", url: "/login", frame: "login", note: "none", porQue: "a entrada (frame 'login')" });
  }
  return out;
})();
