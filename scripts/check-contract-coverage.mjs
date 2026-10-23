#!/usr/bin/env node
import { execFileSync } from "node:child_process";
/**
 * Gate de cobertura de contratos.
 *
 * Este é o arquivo que transforma contrato em invariante. Sem ele, os
 * contratos são documentação — e a auditoria anterior mostrou o resultado
 * disso: três arquivos com nome de contrato que NENHUM código lia.
 *
 * O gate é deliberadamente não-circular. Ele NÃO lê a lista de entidades do
 * contrato para conferi-la: ele **re-deriva** a lista do código (as rotas de
 * verdade, as ferramentas de verdade, os tokens de verdade) e compara com o
 * que o contrato afirma. Assim, um contrato desatualizado falha igual um
 * contrato ausente.
 *
 * Três violações, todas bloqueantes:
 *   1. ENTIDADE SEM CONTRATO — a entidade existe no código e não está no contrato
 *   2. CONTRATO COM ENTIDADE FANTASMA — o contrato cita algo que não existe
 *   3. CONTRATO ÓRFÃO — existe contrato que nenhum código nem script lê
 *
 *   node scripts/check-contract-coverage.mjs
 *   sai com 1 se qualquer violação existir
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), "utf8") : "");
const violations = [];
const check = (id, pass, detail) => {
  if (!pass) violations.push({ id, detail });
  return pass;
};

/* =====================================================================
   1. Re-deriva as entidades do CÓDIGO, sem consultar os contratos.
   ===================================================================== */
// O dump vem do runtime (o catalogo tem dado que regex nao ve). O gate o produz
// antes de ler, para nao depender de o gerador ter rodado antes.
try {
  execFileSync(process.execPath, [
    "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e",
    "import('./scripts/read-tool-contracts.ts').then(()=>process.exit(0)).catch(e=>{process.stderr.write(String(e));process.exit(1)})",
  ], { encoding: "utf8", cwd: root, stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, TOOL_CONTRACTS_DUMP: "/tmp/ce-tool-contracts.json" } });
} catch (e) {
  console.error(`[gate] nao consegui ler os contratos de ferramenta: ${String(e).slice(0, 200)}`);
}

const derived = {
  routes: readdirSync(join(root, "src/routes"))
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("__"))
    .map((f) => f.replace(/\.tsx$/, "")),
  tools: [...read("src/lib/tools/catalog.ts").matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]),
  // As tres listas vem do dump em runtime — nao de regex sobre texto.
  toolSources: (() => { try { return JSON.parse(readFileSync("/tmp/ce-tool-contracts.json", "utf8")).fontes.map((f) => f.canonical_id); } catch { return []; } })(),
  toolBindings: (() => { try { const payload = JSON.parse(readFileSync("/tmp/ce-tool-contracts.json", "utf8")); return payload.bindings.map((b) => b.canonical_id).concat(payload.campos.map((c) => c.canonical_id)).concat(payload.camposContexto.map((c) => c.canonical_id)); } catch { return []; } })(),
  toolComponents: readdirSync(join(root, "src/components/site"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => `CE-COMP-${f.replace(/\.tsx$/, "")}`),
  components: readdirSync(join(root, "src/components/site"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => f.replace(/\.tsx$/, "")),
  tokens: (() => {
    const s = read("src/lib/site-data.ts");
    const canon = s.slice(s.indexOf("export const tokens"), s.indexOf("export const rejected"));
    const rej = s.slice(s.indexOf("export const rejected"));
    const grab = (t) => [...t.matchAll(/\{ name:\s*"([^"]+)",\s*hex:\s*"(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1]);
    return { canonical: grab(canon), rejected: grab(rej) };
  })(),
  brand: readdirSync(join(root, "public/brand")).filter((f) => !f.startsWith(".")),
  articles: existsSync(join(root, "src/lib/content/articles"))
    ? readdirSync(join(root, "src/lib/content/articles"))
        .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
        .map((f) => read(`src/lib/content/articles/${f}`).match(/slug:\s*"([^"]+)"/)?.[1])
        .filter(Boolean)
    : [],
};

/* =====================================================================
   2. Lê os contratos gerados e compara com o derivado.
   ===================================================================== */
const DIR = join(root, "contracts/entities");
const contracts = {};
if (!existsSync(DIR)) {
  console.error("BLOCKED: contracts/entities não existe. Rode scripts/generate-entity-contracts.mjs.");
  process.exit(1);
}
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  contracts[f] = JSON.parse(readFileSync(join(DIR, f), "utf8"));
}
const items = (name) => contracts[name]?.items ?? [];

const setEq = (a, b) => a.length === b.length && [...a].sort().join(" ") === [...b].sort().join(" ");

const cover = (file, contract, derivedList, keyOf = (x) => x?.canonical_id ?? x?.id ?? x) => {
  // Os contratos do CKO usam `canonical_id`; os do site, `id`. Aceita os dois.
  const declared = items(file).map((i) => keyOf(i));
  const faltando = derivedList.filter((x) => !declared.includes(x));
  const fantasma = declared.filter((x) => !derivedList.includes(x));
  check(`${contract}:toda-entidade-tem-contrato`, faltando.length === 0,
    faltando.length ? `${faltando.length} sem contrato: ${faltando.join(", ")}` : `${derivedList.length} cobertas`);
  check(`${contract}:sem-entidade-fantasma`, fantasma.length === 0,
    fantasma.length ? `o contrato cita ${fantasma.length} que não existem: ${fantasma.join(", ")}` : "nenhuma");
};

cover("routes.v1.json", "CE-CONTRACT-ROUTES", derived.routes,
  (i) => i.file?.replace("src/routes/", "").replace(/\.tsx$/, ""));
cover("clinical-tools.v1.json", "CE-CONTRACT-CLINICAL-TOOLS", derived.tools, (i) => i.slug);
cover("components.v1.json", "CE-CONTRACT-COMPONENTS", derived.components, (i) => i.file?.replace("src/components/site/", "").replace(/\.tsx$/, ""));
cover("brand-assets.v1.json", "CE-CONTRACT-BRAND", derived.brand, (i) => i.file?.replace("public/brand/", ""));
cover("articles.v1.json", "CE-CONTRACT-ARTICLES", derived.articles, (i) => i.slug);
cover("tool-sources.v1.json", "CE-CONTRACT-TOOL-SOURCES", derived.toolSources);
cover("tool-bindings.v1.json", "CE-CONTRACT-TOOL-BINDINGS", derived.toolBindings);
cover("tool-components.v1.json", "CE-CONTRACT-TOOL-COMPONENTS", derived.toolComponents, (i) => (i.id ?? i.canonical_id));

// Asset declarado `live` e nunca importado e a mesma doenca que o contrato orfao:
// o arquivo existe, o registro afirma que ele vive, e ninguem o usa. Se declarado
// `superseded`, o oposto e cobrado — tem que existir um `supersededBy` real.
const brandItems = items("brand-assets.v1.json");
const brandIds = new Set(brandItems.map((i) => (i.id ?? i.canonical_id)));
const srcBlob = consumersBlob();
// O codigo referencia o caminho publico ("/brand/x.svg"), nao o caminho do repo.
const liveDead = brandItems.filter((i) => i.status === "live" && !srcBlob.includes(i.file.replace(/^public/, "")));
check("CE-CONTRACT-BRAND:live-tem-consumidor", liveDead.length === 0,
  liveDead.length ? `declarado live e sem consumidor: ${liveDead.map((i) => i.file).join(", ")}`
                  : `${brandItems.filter((i) => i.status === "live").length} assets live, todos consumidos`);
const badSup = brandItems.filter((i) => i.status === "superseded" && !brandIds.has(i.supersededBy));
check("CE-CONTRACT-BRAND:superseded-aponta-para-algo-real", badSup.length === 0,
  badSup.length ? `supersededBy inexistente: ${badSup.map((i) => i.supersededBy).join(", ")}`
                : `${brandItems.filter((i) => i.status === "superseded").length} superseded, todos apontam para item existente`);

// tokens: dois papéis
const tokenItems = items("design-tokens.v1.json");
const canonNames = tokenItems.filter((t) => t.role === "canonical").map((t) => t.name);
const rejNames = tokenItems.filter((t) => t.role === "rejected").map((t) => t.name);
check("CE-CONTRACT-DESIGN-TOKENS:toda-entidade-tem-contrato",
  setEq(canonNames, derived.tokens.canonical) && setEq(rejNames, derived.tokens.rejected),
  `${canonNames.length} canônicos + ${rejNames.length} recusados (derivado: ${derived.tokens.canonical.length} + ${derived.tokens.rejected.length})`);

// chrome: pelo menos um token precisa existir e nenhum contrato pode ter menos de 3
const chrome = items("chrome-bands.v1.json");
check("CE-CONTRACT-CHROME:presente", chrome.length >= 3, `${chrome.length} tokens de chrome`);

/* =====================================================================
   3. Toda entidade precisa de id único, com namespace.
   ===================================================================== */
for (const [file, doc] of Object.entries(contracts)) {
  const ids = doc.items.map((i) => (i.id ?? i.canonical_id));
  check(`${doc.contract}:id-presente`, ids.every((x) => typeof x === "string" && /^(CE-[A-Z]+-|(SRC|AB|FD|TOOL|CMP|MD|REQ|VALID|EV|POL)-)/.test(x)),
    ids.filter((x) => typeof x !== "string" || !/^(CE-[A-Z]+-|(SRC|AB|FD|TOOL|CMP|MD|REQ|VALID|EV|POL)-)/.test(x)).join(", ") || "todos com namespace CE-");
  check(`${doc.contract}:id-unico`, new Set(ids).size === ids.length,
    new Set(ids).size === ids.length ? `${ids.length} ids únicos` : "há id repetido");
}

/* =====================================================================
   4. Referência de arquivo precisa existir.
   ===================================================================== */
for (const doc of Object.values(contracts)) {
  for (const item of doc.items) {
    if (item.file) check(`${doc.contract}:arquivo-existe`, existsSync(join(root, item.file)), item.file);
  }
}

// Recursivo de proposito: shell.tsx mora em src/components/site/, e uma varredura
// rasa "acharia" que a marca nao tem consumidor — conclusao errada, gate errado.
function consumersBlob() {
  let b = "";
  (function walk(dir) {
    for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (e.name === "node_modules") continue;
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) b += readFileSync(join(root, p), "utf8");
    }
  })("src");
  return b;
}

/* =====================================================================
   5. Contrato órfão: existe contrato que NINGUÉM lê.
   ===================================================================== */
const consumers = [];
const scanDirs = ["src", "scripts"];
function walk(dir) {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx|mjs)$/.test(e.name)) consumers.push(p);
  }
}
scanDirs.forEach(walk);

// Dois niveis, porque sao coisas diferentes:
//
//   LIGADO — contracts.ts importa este contrato do indice gerado e expoe ao
//            menos um simbolo derivado dele. Se nao expoe, ele nao e validado
//            no boot e nao protege nada.
//
//   USADO  — algum arquivo da aplicacao importa @/lib/contracts. Se ninguem
//            importa, o modulo existe mas a aplicacao continua sem depender
//            dele — e um contrato sem consumidor e exatamente o defeito que
//            esta auditoria veio remover.
//
// O arquivo gerado NAO conta como consumidor em nenhum dos niveis: se contasse,
// o gate se auto-satisfaria e voltaria a ser decoracao.
const FACADE = "src/lib/contracts.ts";
const facadeSrc = read(FACADE);
const genSrc = read("src/lib/contract-index.generated.ts");

// Mapeamento EXPLICITO de cada arquivo de contrato para (simbolo exportado,
// simbolo correspondente no indice gerado). Explicito de proposito: um
// mapeamento por indice de array parece esperto e silenciosamente associa o
// contrato errado ao export errado quando a ordem muda.
const EXPORT_BY_CONTRACT = {
  "routes.v1.json":           { export: /export const routeIds/,           generated: "contractRoutes" },
  "clinical-tools.v1.json":   { export: /export const toolIds/,           generated: "contractTools" },
  "components.v1.json":       { export: /export const componentIds/,      generated: "contractComponents" },
  "design-tokens.v1.json":    { export: /export const frozenTokenHex/,    generated: "contractTokens" },
  "chrome-bands.v1.json":     { export: /export const chromeBands/,       generated: "contractChrome" },
  "brand-assets.v1.json":     { export: /export const brandLogo/,         generated: "contractBrand" },
  "articles.v1.json":         { export: /export const articleIds/,        generated: "contractArticles" },
  "tool-sources.v1.json":     { export: /export const toolSourceIds/,     generated: "contractToolSources" },
  "tool-bindings.v1.json":    { export: /export const toolBindingIds/,    generated: "contractToolBindings" },
  "tool-components.v1.json":  { export: /export const toolComponentIds/,  generated: "contractToolComponents" },
};

const appFiles = consumers.filter((p) => !/\.generated\.(ts|tsx)$/.test(p) && p !== FACADE);
const usedBy = appFiles.filter((p) => /from ["'][^"']*lib\/contracts["']/.test(read(p)));

const orphanDetail = (file, doc) => {
  const map = EXPORT_BY_CONTRACT[file];
  if (!map) return `${doc.contract}: sem regra de ligacao declarada no gate — contrato novo precisa ser registrado aqui`;
  const wired = map.export.test(facadeSrc) && new RegExp(`\\b${map.generated}\\b`).test(facadeSrc) && new RegExp(`export const ${map.generated}\\b`).test(genSrc);
  if (!wired) return `${doc.contract}: contracts.ts nao expoe simbolo derivado deste contrato — ele nao protege nada`;
  if (!usedBy.length) return `${doc.contract}: contratos sao carregados, mas nenhum arquivo da aplicacao importa @/lib/contracts`;
  return null;
};

const orphans = [];
for (const [file, doc] of Object.entries(contracts)) {
  const why = orphanDetail(file, doc);
  if (why) orphans.push(why);
}
check("CE-CONTRACTS:sem-orfao", orphans.length === 0,
  orphans.length ? `orfao ou desconectado:\n       - ${orphans.join("\n       - ")}` : `${Object.keys(contracts).length} contratos com consumidor`);




/* =====================================================================
   Contrato universal de ferramenta — as politicas do CKO, cobradas aqui.

   A nota do contrato nao basta: o gate e o que verifica. As regras vem de
   CKO-POL-UT-001 (v1.1.0, emenda v1.2.0) e dos schemas do
   CKO_Sistema_Universal_Contratos_Canonicos:

     UTC-001  a fonte autoritativa precede a implementacao
     UTC-002  todo campo aplicavel tem binding em nivel de CAMPO
     UTC-003  nada clinico inline em template
     UTC-016  contexto assistencial opcional, mascarado, sem captura LGPD
     UTC-051  canonical vem do Route Registry, nunca hardcoded
     CKO-POL-R-002  autoridade clinica/regulatoria sem autoridade verificada -> HOLD
     CKO-POL-R-004  sem shell paralelo / token nao mapeado -> HOLD
   ===================================================================== */
{
  // O RUNTIME e a fonte de verdade. O contrato em disco e o que precisa bater
  // com ele — se o codigo muda e o contrato nao e regerado, o gate acusa.
  const dump = (() => { try { return JSON.parse(readFileSync("/tmp/ce-tool-contracts.json", "utf8")); } catch { return {}; } })();
  const fontesRuntime = dump.fontes ?? [];
  const bindingsRuntime = [...(dump.bindings ?? []), ...(dump.campos ?? []), ...(dump.camposContexto ?? [])];
  const fontes = fontesRuntime;
  const bindings = bindingsRuntime;
  const ferramentas = items("clinical-tools.v1.json");
  const fonteIds = new Set(fontes.map((f) => f.canonical_id));
  const bindingIds = new Set(bindings.map((b) => b.canonical_id));
  const bindingPorCampo = new Map(bindings.filter((b) => b.field_path).map((b) => [b.field_path, b]));

  // ── CKO-POL-R-002: fonte sem jurisdiction/rights/integridade nao e autoridade
  const fonteIncompleta = fontes.filter(
    (f) => !f.jurisdiction || !f.rights || !f.integrity?.sha256 || !f.locator?.pinpoint,
  );
  check("CE-TOOLS:fonte-com-jurisdicao-rights-integridade", fonteIncompleta.length === 0,
    fonteIncompleta.length
      ? `fonte sem jurisdiction/rights/integridade/pinpoint: ${fonteIncompleta.map((f) => f.canonical_id).join(", ")}`
      : `${fontes.length} fontes com jurisdiction, rights, integridade e pinpoint`);

  // ── UTC-002: binding por campo, nao por ferramenta
  const semBinding = [];
  for (const t of ferramentas) {
    const doTool = bindings.filter((x) => x.field_path?.startsWith(`tool.${t.slug}.`));
    for (const b of doTool) {
      if (!bindingPorCampo.has(b.field_path)) semBinding.push(b.field_path);
    }
    // uma escala sem nenhum authority_binding nao tem autoridade declarada
    if (doTool.length === 0 && t.tool_kind === "ESCALA") semBinding.push(`${t.slug}: nenhuma authority_binding`);
  }
  check("CE-TOOLS:binding-por-campo", semBinding.length === 0,
    semBinding.length ? `campos sem authority_binding: ${semBinding.slice(0, 8).join(", ")}` : "todo campo clinico tem authority_binding");

  // ── todo binding aponta para uma fonte que existe
  const bindingOrfao = bindings.filter((b) => (b.source_ids ?? []).some((id) => !fonteIds.has(id)));
  check("CE-TOOLS:binding-aponta-fonte-existente", bindingOrfao.length === 0,
    bindingOrfao.length ? bindingOrfao.map((b) => b.canonical_id).join(", ") : "todo source_id de binding existe no contrato de fontes");

  // ── CKO-POL-R-002: ferramenta com fonte nao entra em RELEASED com o gate de MD fechado
  const mdGate = (process.env.CKO_MD_GATE ?? "CLOSED").toUpperCase();
  const releasedSemAutoridade = ferramentas.filter(
    (t) => t.status === "RELEASED" && mdGate === "CLOSED",
  );
  check("CE-TOOLS:release-herda-hold-do-gate-de-md", releasedSemAutoridade.length === 0,
    releasedSemAutoridade.length
      ? `RELEASED com o gate de MD fechado: ${releasedSemAutoridade.map((t) => t.slug).join(", ")}`
      : `gate de MD ${mdGate}: nenhuma ferramenta em RELEASED`);

  // ── toda ferramenta referencia as fontes que declara
  const fonteNaoDeclarada = ferramentas.filter((t) => (t.source_ids ?? []).some((id) => !fonteIds.has(id)));
  check("CE-TOOLS:ferramenta-fonte-coerente", fonteNaoDeclarada.length === 0,
    fonteNaoDeclarada.length ? fonteNaoDeclarada.map((t) => t.slug).join(", ") : "toda ferramenta referencia fontes existentes");

  // ── UTC-016: contexto assistencial opcional, mascarado e sem captura LGPD
  const contexto = bindings.filter((b) => (b.canonical_id ?? "").startsWith("AB-CTX-"));
  const contextoRuim = contexto.filter(
    (b) => b.authority_class !== "INTERNAL_CONFIG" || b.decision !== "BOUND",
  );
  check("CE-TOOLS:contexto-como-config-interna-governada", contextoRuim.length === 0,
    contextoRuim.length ? contextoRuim.map((b) => b.canonical_id).join(", ") : `${contexto.length} campos de contexto como configuracao interna governada`);

  // ── o contrato em disco bate com o codigo (nao so com o dump em memoria)
  const emDiscoFontes = new Set(items("tool-sources.v1.json").map((f) => f.canonical_id));
  const emDiscoBindings = new Set(items("tool-bindings.v1.json").map((f) => f.canonical_id));
  const divergentes = [
    ...fontesRuntime.filter((f) => !emDiscoFontes.has(f.canonical_id)).map((f) => f.canonical_id),
    ...bindingsRuntime.filter((b) => !emDiscoBindings.has(b.canonical_id)).map((b) => b.canonical_id),
  ];
  check("CE-TOOLS:contrato-em-disco-bate-com-o-codigo", divergentes.length === 0,
    divergentes.length
      ? `${divergentes.length} entidade(s) no codigo e ausentes do contrato em disco: ${divergentes.slice(0, 8).join(", ")}`
      : "fontes e bindings do codigo estao no contrato em disco");

  // ── uma ferramenta candidata NAO entra no indice
  // (CKO-POL-R-005: no release without human review; FIND-CTR-009)
  const sitemap = read("public/sitemap.xml");
  const candidatasNoIndice = ferramentas.filter(
    (t) => t.publicacao !== "publicada" && sitemap.includes(`/ferramentas/${t.slug}`),
  );
  check("CE-TOOLS:candidata-fora-do-indice", candidatasNoIndice.length === 0,
    candidatasNoIndice.length
      ? `ferramenta candidata no indice: ${candidatasNoIndice.map((t) => t.slug).join(", ")}`
      : "nenhuma candidata no sitemap");

  // ── toda candidata carrega os HOLDs que a impedem de ser homologada
  const candidatas = ferramentas.filter((t) => t.publicacao === "candidata");
  const candidatasSemHold = candidatas.filter((t) => !(t.holds ?? []).length);
  check("CE-TOOLS:candidata-declara-os-holds", candidatasSemHold.length === 0,
    candidatasSemHold.length
      ? `candidata sem os HOLDs que a bloqueiam: ${candidatasSemHold.map((t) => t.slug).join(", ")}`
      : `${candidatas.length} candidata(s) com os HOLDs declarados`);

  // ── o release_gate declarado bate com a politica
  const releaseGateErrado = ferramentas.filter((t) => t.release_gate !== "HOLD_HUMAN" && mdGate === "CLOSED");
  check("CE-TOOLS:release-gate-herda-hold-human", releaseGateErrado.length === 0,
    releaseGateErrado.length ? releaseGateErrado.map((t) => t.slug).join(", ") : "toda ferramenta com release_gate HOLD_HUMAN");
}

/* =====================================================================
   resultado
   ===================================================================== */
const total = Object.values(contracts).reduce((n, d) => n + d.items.length, 0);
const report = {
  contracts: Object.keys(contracts).length,
  entities: total,
  violations,
  ok: violations.length === 0,
};

if (violations.length) {
  console.error(`BLOCKED — ${violations.length} violação(ões) de contrato:\n`);
  for (const v of violations) console.error(`  FAIL ${v.id}\n       ${v.detail}`);
  console.error(`\n${total} entidades em ${report.contracts} contratos. Corrija e rode de novo.`);
  process.exit(1);
}

console.log(`OK: ${total} entidades cobertas por ${report.contracts} contratos, todos com id único e consumidor.`);
for (const d of Object.values(contracts)) console.log(`  ${d.contract.padEnd(34)} ${String(d.items.length).padStart(3)} itens`);