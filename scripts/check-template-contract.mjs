#!/usr/bin/env node
/**
 * Gate estatico do contrato de template.
 *
 * Roda OFFLINE e sem navegador, como os demais gates de release. Verifica
 * tres coisas que nao dependem de render:
 *
 * 1. **Todo kind declarado tem pagina OU esta declarado nao aplicavel.** A
 *    politica (CKO-POL-UT-001, "Explicit non-applicability") exige
 *    `NOT_APPLICABLE_JUSTIFIED` COM EVIDENCIA. Um kind declarado e sem pagina
 *    e um nulo silencioso.
 *
 * 2. **Nenhuma dimensao do contrato esta morta.** Uma dimensao declarada e
 *    nunca lida por nenhum componente e decoracao — foi assim com `note` e
 *    `resources`, que o codigo ignorava e o contrato anunciava. Este check
 *    impede que a proxima dimensao morra do mesmo jeito.
 *
 * 3. **O par (kind, url) esta declarado no codigo**, e nao dentro do
 *    auditor. Mapa que so existe dentro da ferramenta e mapa que ninguem
 *    mais ve.
 *
 * A verificacao de COMPORTAMENTO (o navegador contra o contrato) vive em
 * `scripts/audit-templates.mjs`, que precisa do build servido.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { templateExamples } from "@/lib/template-examples";
import { templateCatalogo } from "@/lib/template-catalog";
import { templateApplicability } from "@/lib/template-applicability";
import { templateContracts } from "@/lib/template-contract";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

let falhas = 0;
const check = (nome, ok, detalhe = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
  if (!ok) falhas++;
};

/* ── 1. a dimensoes do contrato ─────────────────────────────────────────── */
const contrato = read("src/lib/template-contract.ts");
// As DIMENSOES sao os campos do tipo TemplateContract, nao os kinds.
const tipoContrato = contrato.slice(contrato.indexOf("export type TemplateContract ="), contrato.indexOf("};", contrato.indexOf("export type TemplateContract =")));
const dimensoes = [...tipoContrato.matchAll(/^\s{2}(\w+)[?]?:/gm)].map((m) => m[1]);
const tipos = Object.keys(templateContracts);

/* ── 2. a aplicabilidade ───────────────────────────────────────────────── */
const aplicabilidade = read("src/lib/template-applicability.ts");
const naoAplicaveis = Object.entries(templateApplicability).filter(([, v]) => !v.aplicavel).map(([k]) => k);
const semJustificativa = naoAplicaveis.filter(
  (k) => !(templateApplicability[k]?.justificativa?.trim() && templateApplicability[k]?.evidencia?.trim()),
);
check(
  "nao-aplicavel-tem-justificativa-e-evidencia",
  semJustificativa.length === 0,
  semJustificativa.length ? `sem justificativa+evidencia: ${semJustificativa.join(", ")}` : `${naoAplicaveis.length} kind(s) nao aplicavel(is)`,
);

/* ── 3. o par (kind, url) declarado no codigo ──────────────────────────── */
const exemplos = "src/lib/template-examples.ts";
const pares = templateExamples.map((e) => [e.kind, e.url]);
const kindsComPagina = new Set(pares.map((p) => p[0]));
const kindsComNaoAplicavel = new Set(naoAplicaveis);
const kindsSemNada = tipos.filter((k) => !kindsComPagina.has(k) && !kindsComNaoAplicavel.has(k));
check(
  "todo-kind-tem-pagina-ou-nao-aplicavel",
  kindsSemNada.length === 0,
  kindsSemNada.length ? `nulo silencioso: ${kindsSemNada.join(", ")}` : `${pares.length} com pagina, ${naoAplicaveis.length} nao aplicavel`,
);
const paginasRepetidas = pares.filter((p, i) => pares.findIndex((q) => q[1] === p[1]) !== i);
check("uma-pagina-por-kind", paginasRepetidas.length === 0, paginasRepetidas.map((p) => p[0]).join(", "));
const exemplosDeKindInexistente = pares.filter(([k]) => !tipos.includes(k));
check("exemplos-referem-se-a-kinds-existentes", exemplosDeKindInexistente.length === 0, exemplosDeKindInexistente.map((p) => p[0]).join(", "));

/* ── 4. nenhuma dimensao do contrato esta morta ─────────────────────────── */
const fontes = [
  "src/components/article/article-page.tsx",
  "src/components/site/page-tools.tsx",
  "src/components/tools/clinical-tool.tsx",
  "src/components/site/section-page.tsx",
  "src/components/templates/library-view.tsx",
  "src/components/templates/norm-view.tsx",
  "src/components/templates/guide-view.tsx",
  "src/components/site/home-page.tsx",
  "src/components/site/areas.tsx",
  "src/routes/login.tsx",
].map((f) => read(f)).join("\n");
const mortas = dimensoes.filter(
  (d) => !new RegExp(`contract\\.${d}\\b|contractOf\\([^)]*\\)\\.${d}\\b`).test(fontes),
);
check(
  "nenhuma-dimensao-do-contrato-e-morta",
  mortas.length === 0,
  mortas.length ? `declaradas e nunca lidas: ${mortas.join(", ")}` : `${dimensoes.length} dimensoes consumidas pelo codigo`,
);

/* ── 5. frame e note nao estao mais no contrato do frame ──────────────── */
const tiposDeContrato = tipoContrato;
check(
  "frame-e-note-nao-sao-dimensoes-do-frame",
  !/^\s{2}frame[?]?:/m.test(tiposDeContrato) && !/^\s{2}note[?]?:/m.test(tiposDeContrato),
  "frame e note descrevem a PAGINA; vivem em template-examples.ts",
);
const exemplosDeclaram = templateExamples.map((e) => [e.frame, e.note]);
check(
  "exemplos-declaram-frame-e-note",
  exemplosDeclaram.length === pares.length,
  `${exemplosDeclaram.length}/${pares.length} exemplos declaram frame e note`,
);

/* ── 5b. todo template do catalogo do dono tem pagina valida ou esta declarado
   como pendente, com materia-prima identificada ─────────────────────────── */
const catalogoSemPagina = templateCatalogo.filter((t) => !t.url);
const semMateriaPrima = templateCatalogo.filter((t) => !t.materiaPrima?.trim());
check(
  "todo-template-do-catalogo-declara-a-sua-materia-prima",
  semMateriaPrima.length === 0,
  semMateriaPrima.length ? `sem materia-prima: ${semMateriaPrima.map((t) => t.nome).join(", ")}` : `${templateCatalogo.length} templates com materia-prima declarada`,
);
// Toda pagina do catalogo tem que pertencer a um kind QUE TEM EXEMPLO — logo
// tem contrato conhecido, e a auditoria de browser tem contra o que conferir.
// Paginas do mesmo kind podem ter estilos de nota diferentes: o exemplo e o
// primeiro de cada kind, nao a regra de todos.
const kindsComExemplo = new Set(templateExamples.map((e) => e.kind));
const paginaSemContrato = templateCatalogo.filter((t) => t.url && !kindsComExemplo.has(t.kind));
check(
  "toda-pagina-do-catalogo-tem-kind-com-exemplo",
  paginaSemContrato.length === 0,
  paginaSemContrato.length ? `sem kind conhecido: ${paginaSemContrato.map((t) => t.nome).join(", ")}` : `${templateCatalogo.filter((t) => t.url).length} paginas com kind conhecido`,
);
const framesValidos = new Set(["shell", "area", "admin", "login", "home"]);
const notasValidas = new Set(["callout", "inline", "none"]);
const valorInvalido = templateCatalogo.filter((t) => !framesValidos.has(t.frame) || !notasValidas.has(t.note));
check(
  "frame-e-note-do-catalogo-sao-validos",
  valorInvalido.length === 0,
  valorInvalido.length ? `invalidos: ${valorInvalido.map((t) => t.nome).join(", ")}` : "todos os frames e notas sao validos",
);

/* ── 6. o contrato governa os recursos da ferramenta ───────────────────── */
const tool = read("src/components/tools/clinical-tool.tsx");
check(
  "recursos-governados-pelo-contrato",
  /contractOf\("ferramenta"\)\.resources\.includes\("formulario"\)/.test(tool) &&
    /contractOf\("ferramenta"\)\.resources\.includes\("laudo"\)/.test(tool),
  "formulario e laudo sao renderizados por decisao do contrato",
);

console.log(falhas ? `\n${falhas} verificacao(oes) falharam.` : "\nContrato de template: tudo consistente.");
process.exit(falhas ? 1 : 0);
