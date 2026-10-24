#!/usr/bin/env node
import { loadToolContracts } from "./load-tool-contracts.mjs";
/**
 * Gera os contratos de entidade a partir do código — nunca à mão.
 *
 * Razão de existir: um contrato escrito à mão começa a mentir no dia seguinte.
 * Este script lê a fonte de verdade (as rotas de verdade, as ferramentas de
 * verdade, os tokens de verdade) e emite o JSON. Se alguém adiciona uma rota,
 * um componente ou um token, o contrato cresce sozinho no próximo run — e o
 * gate de cobertura passa a enxergar a entidade nova.
 *
 *   node scripts/generate-entity-contracts.mjs
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "contracts/entities";
mkdirSync(OUT, { recursive: true });

/** Lê um arquivo se existir; string vazia se não. */
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

/* ------------------------------------------------------------------ rotas */
const routes = readdirSync("src/routes")
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("__"))
  .map((f) => f.replace(/\.tsx$/, ""));

/* ------------------------------------------------------- ferramentas CLI */
// Fonte unica: avaliacao real do catalogo. Se nao importar, HOLD bloqueante;
// nunca degradar para regex, nem consumir dump stale compartilhado em /tmp.
const GOV = loadToolContracts();
const tools = GOV.tools.map((tool) => tool.slug);
const toolMeta = Object.fromEntries(GOV.tools.map((tool) => [tool.slug, tool]));

/* ------------------------------------------------------------ componentes */
const components = readdirSync("src/components/site")
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));

/* ---------------------------------------------------------------- tokens */
const siteData = read("src/lib/site-data.ts");
const canonicalBlock = siteData.slice(siteData.indexOf("export const tokens"), siteData.indexOf("export const rejected"));
const rejectedBlock = siteData.slice(siteData.indexOf("export const rejected"));
const tokens = [
  ...[...canonicalBlock.matchAll(/\{ name:\s*"([^"]+)",\s*hex:\s*"(#[0-9A-Fa-f]{6})"/g)].map((m) => ({
    name: m[1],
    hex: m[2],
    role: "canonical",
  })),
  ...[...rejectedBlock.matchAll(/\{ name:\s*"([^"]+)",\s*hex:\s*"(#[0-9A-Fa-f]{6})"/g)].map((m) => ({
    name: m[1],
    hex: m[2],
    role: "rejected",
  })),
];

/* ------------------------------------------------------------- artigos */
// Um artigo por arquivo: o contrato deriva dos ARQUIVOS, não do índice
// gerado — senão o contrato seria derivado de uma saída do próprio gerador.
const ARTICLE_DIR = "src/lib/content/articles";
const articles = existsSync(ARTICLE_DIR)
  ? readdirSync(ARTICLE_DIR)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
      .map((f) => read(`${ARTICLE_DIR}/${f}`).match(/slug:\s*"([^"]+)"/)?.[1])
      .filter(Boolean)
  : [];

/* ---------------------------------------------------------- assets de marca */
const brand = readdirSync("public/brand").filter((f) => !f.startsWith("."));

/* --------------------------------------------------------------- chrome */
const css = read("src/styles.css");
const chromeTokens = [...css.matchAll(/--chrome-([a-z-]+):\s*([^;]+);/g)].map((m) => ({
  name: `--chrome-${m[1]}`,
  value: m[2].trim(),
}));

// Metadado de emissao do contrato, NAO a data de execucao do build.
 // É versionado para que uma virada de dia em UTC não invalide hashes do conteúdo.
const releaseMetadata = JSON.parse(read("registers/governance/entity-contracts-release.v1.json"));
if (releaseMetadata.schemaVersion !== 1 || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(releaseMetadata.generatedOn)) {
  throw new Error("Metadado de emissao do contrato invalido (fail-closed)");
}
const stamp = releaseMetadata.generatedOn;

const files = {
  "clinical-tools.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-CLINICAL-TOOLS",
    domain: "clinical",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/lib/tools/catalog.ts",
    note:
      "O conteúdo clínico (critérios, campos, faixas, referências) é o produto. " +
      "Cada ferramenta precisa de id, faixa de escore e referência verificável.",
    items: tools.map((slug) => {
      const m = toolMeta[slug] ?? {};
      const binds = (GOV?.bindings ?? []).filter((b) => b.field_path.startsWith(`tool.${slug}.`));
      const campos = (GOV?.campos ?? []).filter((c) => c.field_path.startsWith(`tool.${slug}.`));
      return {
        id: `CE-TOOL-${slug}`,
        slug,
        // ── forma do CKO `tool.schema.json` ──
        tool_kind: m.kind === "escala" ? "ESCALA" : "CALCULADORA",
        status: m.status ?? "CANDIDATE",
        publicacao: m.publicacao ?? "publicada",
        holds: m.holds ?? [],
        source_ids: m.sourceIds ?? [],
        authority_binding_refs: binds.map((b) => b.canonical_id),
        field_definition_refs: campos.map((c) => c.canonical_id),
        formula_ref: `FORMULA-${slug.toUpperCase()}`,
        rule_refs: binds.filter((b) => b.field_path.includes(".bands.")).map((b) => b.canonical_id),
        interpretation_ref: `INTERP-${slug.toUpperCase()}`,
        result_ref: `RESULT-${slug.toUpperCase()}`,
        component_refs: [],
        privacy_profile: "PRIVACY-TOOL-PROFILE",
        safety_profile: `SAFETY-${slug.toUpperCase()}`,
        release_gate: (GOV?.politica?.release_gate) ?? "HOLD_HUMAN",
        test_vector_refs: [],
        seo_profile_ref: "SEO-PROFILE-SITE",
        i18n_profile_ref: "I18N-PROFILE-SITE",
        analytics_profile_ref: "ANALYTICS-PROFILE-SITE",
        about_tool: null,
        visibility: null,
        evidence_refs: [],
        patient_safety: { certs: [], goals: [] },
        // ── derivados, nao digitados ──
        faixa: m.faixa ?? null,
        referenciasOriginais: m.referencias ?? 0,
        authority: `src/lib/tools/catalog.ts#${slug}`,
      };
    }),
  },
  "tool-sources.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-TOOL-SOURCES",
    domain: "clinical",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/lib/tools/governance.ts",
    note:
      "Fontes normativas (CKO source.schema.json). Cada uma declara jurisdiction, rights, " +
      "locator com pinpoint, integridade e vigencia. A autoridade do produto mora aqui.",
    items: GOV?.fontes ?? [],
  },
  "tool-bindings.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-TOOL-BINDINGS",
    domain: "clinical",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/lib/tools/governance.ts",
    note:
      "Bindings de autoridade POR CAMPO (CKO authority_binding.schema.json) e as " +
      "definicoes de campo (field_definition.schema.json). UTC-002 exige binding por campo, " +
      "nao por ferramenta.",
    items: [...(GOV?.bindings ?? []), ...(GOV?.campos ?? []), ...(GOV?.camposContexto ?? [])],
  },
  "tool-components.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-TOOL-COMPONENTS",
    domain: "ui",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/components/site/",
    note:
      "Componentes governados que o Universal Tool Contract referencia (CKO component.schema.json). " +
      "Reuso do shell existente — FIND-CTR-001 proibe CSS paralelo.",
    items: components.map((c) => ({
      id: `CE-COMP-${c}`,
      component_key: c,
      owner_module: `src/components/site/${c}.tsx`,
      semantic_role: c,
      reusability_scope: "SITE",
      status: "DRAFT",
    })),
  },
  "routes.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-ROUTES",
    domain: "canonical",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/routes/",
    items: routes.map((r) => ({ id: `CE-ROUTE-${r}`, file: `src/routes/${r}.tsx` })),
  },
  "components.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-COMPONENTS",
    domain: "ui",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/components/site/",
    items: components.map((c) => ({ id: `CE-COMP-${c}`, file: `src/components/site/${c}.tsx` })),
  },
  "design-tokens.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-DESIGN-TOKENS",
    domain: "design-system",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/lib/site-data.ts",
    frozen: true,
    note:
      "Os valores de `role: canonical` são CONGELADOS. Alterar um deles é decisão " +
      "de design system e exige revisão explícita, não um build que passa. " +
      "`role: rejected` registra cores que já foram recusadas — existem para não voltarem.",
    items: tokens.map((t) => ({ id: `CE-TOKEN-${t.name.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}`, ...t })),
  },
  "chrome-bands.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-CHROME",
    domain: "shell",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/styles.css",
    items: chromeTokens.map((t) => ({ id: `CE-CHROME-${t.name.replace(/^--chrome-/, "").toUpperCase()}`, ...t })),
  },
  "articles.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-ARTICLES",
    domain: "conteudo",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "src/lib/content/articles/",
    note:
      "Artigos de fundo servidos por /blog/$slug. O corpo (JSX) fica na rota; aqui so os " +
      "dados de SEO. Um artigo novo precisa de slug, titulo, descricao, lead e pelo menos " +
      "uma entrada de indice — senao ele entra no sitemap sem ser encontrado por ninguem.",
    items: articles.map((slug) => ({ id: `CE-ARTICLE-${slug.toUpperCase()}`, slug, route: `/blog/${slug}` })),
  },
  "brand-assets.v1.json": {
    schemaVersion: 1,
    contract: "CE-CONTRACT-BRAND",
    domain: "brand",
    generatedBy: "scripts/generate-entity-contracts.mjs",
    generatedOn: stamp,
    authority: "public/brand/",
    // O id inclui a extensao de proposito: logo.svg e logo.webp coexistem no
    // diretorio, e o par precisa ficar visivel no contrato em vez de colidir.
    // `status` distingue o que a aplicacao carrega do que so sobrou do release.
    items: brand.map((f) => {
      const base = f.replace(/\.[a-z0-9]+$/i, "");
      const ext = f.slice(base.length + 1).toUpperCase();
      return {
        id: `CE-BRAND-${base.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}${ext ? `-${ext}` : ""}`,
        file: `public/brand/${f}`,
        // logo.svg e a marca primaria vigente (decisao do dono, commit 326350f);
        // logo.webp fica declarado como legado, nao apagado — apagar asset do
        // backup do dono nao e decisao do codigo.
        status: f === "logo.webp" ? "superseded" : "live",
        // `papel` e o que torna o contrato autoritativo: sem ele o consumidor
        // precisa adivinhar pelo nome do arquivo, e aí a declaracao do
        // contrato vira sugestao.
        ...(f === "logo.svg" ? { papel: "marca-primaria" } : {}),
        ...(f === "logo.svg"
          ? {
              nota:
                "Vetor vetorial canônico usado no header. Mantém legibilidade em " +
                "qualquer densidade de tela e evita distorção do raster anterior.",
            }
          : {}),
        ...(f === "logo.webp"
          ? {
              supersededBy: "CE-BRAND-LOGO-SVG",
              nota: "Raster legado, mantido apenas como referência e não utilizado pela aplicação.",
            }
          : {}),
      };
    }),
  },
};

let total = 0;
for (const [name, doc] of Object.entries(files)) {
  writeFileSync(join(OUT, name), `${JSON.stringify(doc, null, 2)}\n`);
  total += doc.items.length;
  console.log(`${name.padEnd(28)} ${String(doc.items.length).padStart(3)} itens  ${doc.contract}`);
}
/* =====================================================================
   Emite o módulo TypeScript que a aplicação importa.
   É este arquivo que tira os contratos da categoria "documentação": se a
   aplicação depende dele, apagar um contrato quebra a aplicação — e não é
   mais possível alegar que o registro "só documenta".
   ===================================================================== */
const genPath = "src/lib/contract-index.generated.ts";
writeFileSync(
  genPath,
  `// GERADO por scripts/generate-entity-contracts.mjs — nao editar a mao.
// A fonte da verdade sao os JSON em contracts/entities/. Qualquer mudanca aqui
// e sobrescrita no proximo run e detectada pelo gate de cobertura.
export interface ContractItem { id: string; [k: string]: unknown }
export interface Contract<T> { contract: string; domain: string; items: T[] }

export const contractRoutes = ${JSON.stringify(files["routes.v1.json"].items.map((i) => ({ id: i.id, file: i.file })), null, 2)} as const;
export const contractTools = ${JSON.stringify(files["clinical-tools.v1.json"].items.map((i) => ({ id: i.id, slug: i.slug })), null, 2)} as const;
export const contractComponents = ${JSON.stringify(files["components.v1.json"].items.map((i) => ({ id: i.id, file: i.file })), null, 2)} as const;
export const contractTokens = ${JSON.stringify(files["design-tokens.v1.json"].items.map((i) => ({ id: i.id, name: i.name, hex: i.hex, role: i.role })), null, 2)} as const;
export const contractChrome = ${JSON.stringify(files["chrome-bands.v1.json"].items.map((i) => ({ id: i.id, value: i.value })), null, 2)} as const;
export const contractArticles = ${JSON.stringify(files["articles.v1.json"].items.map((i) => ({ id: i.id, slug: i.slug, route: i.route })), null, 2)} as const;
// Contrato universal de ferramenta — o vocabulario do CKO (canonical_id, nao id).
export const contractToolSources = ${JSON.stringify(files["tool-sources.v1.json"].items.map((i) => ({ canonical_id: i.canonical_id, authority: i.authority, jurisdiction: i.jurisdiction, source_type: i.source_type })), null, 2)} as const;
export const contractToolBindings = ${JSON.stringify(files["tool-bindings.v1.json"].items.map((i) => ({ canonical_id: i.canonical_id, field_path: i.field_path, source_ids: i.source_ids ?? [], authority_class: i.authority_class, decision: i.decision })), null, 2)} as const;
export const contractToolComponents = ${JSON.stringify(files["tool-components.v1.json"].items.map((i) => ({ id: i.id, component_key: i.component_key })), null, 2)} as const;
export const contractBrand = ${JSON.stringify(files["brand-assets.v1.json"].items, null, 2)} as const;
`
);
console.log(`\n${total} entidades cobertas em ${Object.keys(files).length} contratos.`);
console.log(`${genPath} emitido — a aplicacao passa a depender dele.`);