/**
 * Contratos como invariante de runtime.
 *
 * Este módulo é a razão de os contratos existirem. Ele importa o índice gerado
 * a partir de contracts/entities/ e VALIDA em tempo de carga — se uma
 * invariante estiver quebrada, a aplicação não sobe.
 *
 * A diferença entre isto e o padrão que o projeto tinha:
 *   antes:  um arquivo .json declarava fatos que ninguém consultava
 *   agora:  o mesmo arquivo, e a aplicação depende dele para funcionar
 *
 * Uma consequência deliberada: apagar ou esvaziar um contrato deixa de ser
 * inofensivo. Vira uma queda de produção — que é o ponto.
 */
import {
  contractArticles,
  contractBrand,
  contractChrome,
  contractComponents,
  contractRoutes,
  contractTokens,
  contractTools,
  contractToolBindings,
  contractToolComponents,
  contractToolSources,
} from "./contract-index.generated";

class ContractViolation extends Error {
  constructor(contract: string, detail: string) {
    super(`CONTRACT_VIOLATION [${contract}]: ${detail}`);
    this.name = "ContractViolation";
  }
}

function require_<T>(contract: string, value: T | undefined | null, detail: string, empty = 0): T {
  if (!value) throw new ContractViolation(contract, detail);
  if (Array.isArray(value) && value.length <= empty)
    throw new ContractViolation(contract, `${detail} (vazio)`);
  return value;
}

/* ------------------------------------------------------------------ marca */
const brandItems = require_("CE-CONTRACT-BRAND", contractBrand, "marca ausente", 0);

/**
 * O logo que a aplicação carrega é decidido pelo contrato, não pelo componente.
 * `logo.webp` é o original do release. `logo.svg` foi um vetor que eu criei sem
 * autorização e está declarado superseded, mantido em disco e fora do caminho
 * da aplicação.
 */
export const brandLogo = require_(
  "CE-CONTRACT-BRAND",
  brandItems.find((b) => (b as { papel?: string }).papel === "marca-primaria"),
  "nenhum item declarado com papel marca-primaria",
) as { id: string; file: string };

export const brandAssets = brandItems;

/* ------------------------------------------------------------ ferramentas */
const tools = require_("CE-CONTRACT-CLINICAL-TOOLS", contractTools, "catálogo clínico ausente", 0);
export const toolIds = tools as readonly { id: string; slug: string }[];
export const toolIdsFor = (slugs: readonly string[]) =>
  slugs.map((s) => toolIds.find((t) => t.slug === s)?.id ?? `CE-TOOL-${s}`);

/* ------------------------------------------------------------------- ids */
export const routeIds = require_("CE-CONTRACT-ROUTES", contractRoutes, "rotas ausentes", 0) as readonly { id: string; file: string }[];
export const componentIds = require_("CE-CONTRACT-COMPONENTS", contractComponents, "componentes ausentes", 0) as readonly { id: string; file: string }[];

/* --------------------------------------------------------------- artigos */
export const articleIds = require_("CE-CONTRACT-ARTICLES", contractArticles, "catálogo de artigos ausente", 0) as readonly { id: string; slug: string; route: string }[];

/* ---------------------------------------------------------------- tokens */
const tokens = require_("CE-CONTRACT-DESIGN-TOKENS", contractTokens, "tokens ausentes", 0);
const canonicalTokens = tokens.filter((t) => t.role === "canonical");
if (canonicalTokens.length !== 8)
  throw new ContractViolation("CE-CONTRACT-DESIGN-TOKENS", `esperados 8 tokens canônicos, encontrados ${canonicalTokens.length}`);

/**
 * Os valores canônicos vivem em styles.css porque CSS não lê TypeScript.
 * O contrato não fica passivo por causa disso: ele carrega o valor canônico e
 * a verificação acontece em `npm run audit`. Se alguém editar o hex no CSS,
 * o gate acusa — é a ponte entre os dois mundos.
 */
export const frozenTokenHex = Object.fromEntries(canonicalTokens.map((t) => [t.name, t.hex])) as Record<string, string>;
export const rejectedTokenHex = Object.fromEntries(tokens.filter((t) => t.role === "rejected").map((t) => [t.name, t.hex])) as Record<string, string>;

/* ---------------------------------------------------------------- chrome */
export const chromeBands = require_("CE-CONTRACT-CHROME", contractChrome, "faixas de cabeçalho ausentes", 0);
export const chromeTotal = chromeBands.find((c) => /total/.test(c.id))?.value ?? null;

export const contractSummary = {
  routes: routeIds.length,
  tools: toolIds.length,
  components: componentIds.length,
  tokens: tokens.length,
  chrome: chromeBands.length,
  brand: brandAssets.length,
} as const;
/* Contrato universal de ferramenta — o vocabulario e o do CKO (canonical_id).
   Exposto como `const` para que o gate reconheca o consumidor. */
export const toolSourceIds = contractToolSources;
export const toolBindingIds = contractToolBindings;
export const toolComponentIds = contractToolComponents;
