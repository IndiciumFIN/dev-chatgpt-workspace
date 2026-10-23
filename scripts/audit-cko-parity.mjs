/**
 * Auditoria de paridade: os 56 schemas do CKO contra o que a branch realmente
 * IMPLEMENTA.
 *
 * Tres niveis, e a distincao e o ponto inteiro:
 *   AUSENTE     — nao temos tipo algum para esse schema
 *   DECLARADO   — temos o tipo e o campo, mas nenhum CONSUMIDOR o le
 *   IMPLEMENTADO— o campo e lido fora do arquivo que o declara
 *
 * O ultimo nivel e o unico que vale. Por isso o consumidor exclui o arquivo
 * que declara: se nao excluisse, todo campo pareceria usado, porque o nome
 * dele esta escrito la. Ja caiu nessa armadilha uma vez nesta sessao.
 *
 *   node --experimental-strip-types --import ./scripts/alias-hook.mjs \
 *        scripts/audit-cko-parity.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Os schemas vivem DENTRO do repositorio, para a auditoria rodar a partir do
// pacote entregue — e nao de uma pasta que so existe no meu sandbox.
const CATALOGO = "contracts/cko-schemas";
if (!existsSync(CATALOGO)) {
  console.error(`faltam os schemas CKO em ${CATALOGO} — a auditoria de paridade nao pode rodar`);
  process.exit(2);
}
const DECL = "src/lib/tools/contracts.ts";

/**
 * schema CKO -> tipo nosso. null = ainda nao temos nada.
 * A coluna `nota` diz por que, para nao parecer esquecimento.
 */
const MAPA = {
  authority_binding: ["AuthorityBinding", "authority binding por campo"],
  clinical_result: ["ResultadoContrato", "contrato de resultado"],
  clinical_rule: ["RegraClinica", "regra clinica"],
  component: ["ComponenteContrato", "componente de ferramenta"],
  field_definition: ["CampoDefinido", "campo de entrada"],
  formula: ["FormulaContrato", "formula (declarada, sem motor)"],
  inference: ["InferenciaContrato", "inferencia"],
  interpretation: ["InterpretacaoContrato", "interpretacao"],
  privacy: ["PrivacyProfile", "perfil de privacidade"],
  source: ["FonteNormativa", "fonte normativa"],
  tool: ["ToolContrato", "ferramenta"],
  state_machine: [null, "NENHUM tipo — os 7 estados nao existem no codigo"],
  route: ["RotaContrato", "rota (contrato gerado de routes)"],
  canonical_object: [null, "NENHUM — o objeto canonico nao tem tipo"],
  claim: [null, "NENHUM — claims vivem no catalogo editorial"],
  laboratory_exam: [null, "template pendente (Exames Laboratoriais)"],
  medication: [null, "template pendente (Calculadoras Trabalhistas)"],
  procedure: [null, "template pendente (SBAR / Calculadoras)"],
  protocol: [null, "template pendente (SBAR)"],
  vaccine: [null, "sem escopo declarado"],
  learning_resource: [null, "perfil UE-LTS ainda DRAFT"],
  assessment_item: [null, "perfil UE-LTS ainda DRAFT"],
  agent: [null, "src/lib/agents.ts removido como orfao"],
  applicability: ["Aplicabilidade", "aplicabilidade de template"],
  i18n: ["LocaleRegistry", "registro de locale"],
  media_asset: ["BrandAsset", "asset de marca"],
  accessibility: [null, "medido por script, sem contrato"],
  audit_evidence: [null, "scripts de evidencia, sem contrato"],
  release_gate: [null, "scripts de gate, sem contrato"],
  performance_budget: [null, "NENHUM — nao medimos orcamento de performance"],
  runtime_test: [null, "NENHUM"],
  risk_control: [null, "NENHUM"],
  safety_check: [null, "NENHUM"],
  terminology: [null, "NENHUM"],
  monitoring: [null, "NENHUM"],
  measurement: [null, "NENHUM — tipos.ts tem Band/OutputSpec, nao o schema"],
  visualization: [null, "NENHUM"],
  ui_interaction: [null, "NENHUM"],
  user_state: [null, "NENHUM"],
  relation: [null, "NENHUM"],
  projection: [null, "NENHUM"],
  design_adapter: [null, "NENHUM"],
  export_profile: [null, "NENHUM"],
  research_method: [null, "NENHUM"],
  search_index: [null, "NENHUM"],
  reference: [null, "NENHUM"],
  work_order: [null, "NENHUM"],
  task: [null, "NENHUM"],
  workflow: [null, "NENHUM"],
  device: [null, "sem escopo (mobile)"],
  advertising: [null, "sem escopo por decisao"],
  analytics_event: [null, "proibido pela emenda LGPD"],
};

/** Extrai os campos de um `export type X = { ... }`. */
function camposDoTipo(txt, nome) {
  const i = txt.indexOf(`export type ${nome} `);
  if (i < 0) return null;
  const abre = txt.indexOf("{", i);
  if (abre < 0) return null;
  let profundidade = 0, fecha = -1;
  for (let k = abre; k < txt.length; k++) {
    if (txt[k] === "{") profundidade++;
    else if (txt[k] === "}") { profundidade--; if (profundidade === 0) { fecha = k; break; } }
  }
  const corpo = txt.slice(abre + 1, fecha)
    .replace(/\/\*[\s\S]*?\*\//g, "")     // comentarios de bloco
    .replace(/\/\/.*/g, "");               // comentarios de linha
  // SO o topo. Um campo dentro de optional_context_fields[] NAO e um campo do
  // tipo — contar os dois inventava cobertura que nao existe.
  const topo = [];
  let prof = 0;
  for (const linha of corpo.split("\n")) {
    if (prof === 0) {
      const m = linha.match(/^\s*([a-z_][a-z0-9_]*)\s*[?:]/);
      if (m) topo.push(m[1]);
    }
    for (const ch of linha) {
      if (ch === "{" || ch === "[" || ch === "(") prof++;
      else if (ch === "}" || ch === "]" || ch === ")") prof--;
    }
    if (prof < 0) prof = 0;
  }
  return topo;
}

/**
 * Le o codigo e separa o que e CONSUMIDOR.
 *
 * Consumidor = codigo escrito a mao que LE o contrato. Entram o src/ e os
 * scripts — o gate le `rights`, `integridade` e `pinpoint` de verdade, entao
 * deixar script de foraFabricava "nunca lido" falso.
 *
 * Ficam de fora: o arquivo que DECLARA (o nome do campo esta escrito la) e o
 * GERADOR (que produz o artefato — gate nao pode contar o proprio output).
 */
function corpusSrc() {
  const DECLS = new Set([
    DECL,
    "src/lib/tools/types.ts",
    "src/lib/tools/catalog.ts",
    "src/lib/tools/formulas.ts",
  ]);
  const GERADORES = /^(generate-|materialize-|prerender-)/;
  let consumidor = "";
  const percorre = (dir, filtrar) => {
    if (!existsSync(dir)) return;
    for (const a of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, a.name);
      if (a.isDirectory()) { percorre(p, filtrar); continue; }
      if (!/\.(ts|tsx|mjs)$/.test(a.name)) continue;
      if (/\.test\.(ts|tsx|mjs)$/.test(a.name)) continue;
      if (!filtrar(a.name)) continue;
      consumidor += readFileSync(p, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    }
  };
  percorre("src", (n) => !DECLS.has(join("src", n)) && !n.includes("contracts.generated"));
  percorre("scripts", (n) => !GERADORES.test(n));
  return { consumidor };
}

const { consumidor } = corpusSrc();
const declTxt = readFileSync(DECL, "utf8");
const tiposTxt = readFileSync("src/lib/tools/types.ts", "utf8");
const catalogoTxt = existsSync("src/lib/tools/catalog.ts") ? readFileSync("src/lib/tools/catalog.ts", "utf8") : "";

/** Um campo e USADO se um consumidor o le como propriedade. */
const usado = (campo) => new RegExp(`[."'\`]${campo}\\b`).test(consumidor);

const schemas = readdirSync(CATALOGO).filter((f) => f.endsWith(".schema.json")).sort();
const linhas = [];
for (const arq of schemas) {
  const nome = arq.replace(".schema.json", "");
  const schema = JSON.parse(readFileSync(join(CATALOGO, arq), "utf8"));
  const req = schema.required ?? [];
  const [nossoTipo, nota] = MAPA[nome] ?? [null, "NAO MAPEADO pela auditoria"];

  let declarados = [], implementados = [], estado = "AUSENTE";
  if (nossoTipo) {
    declarados =
      camposDoTipo(declTxt, nossoTipo) ??
      camposDoTipo(tiposTxt, nossoTipo) ??
      camposDoTipo(catalogoTxt, nossoTipo) ??
      [];
    implementados = declarados.filter((c) => usado(c));
    const cobertura = req.length ? declarados.filter((c) => req.includes(c)).length / req.length : 1;
    estado = implementados.length === declarados.length && declarados.length > 0 && cobertura >= 0.9
      ? "IMPLEMENTADO"
      : implementados.length ? "PARCIAL" : "DECLARADO-MORTO";
  }

  linhas.push({
    schema: nome,
    nossoTipo: nossoTipo ?? null,
    estado,
    obrigatoriosCko: req.length,
    declarados: declarados.length,
    implementados: implementados.length,
    nuncaLidos: declarados.filter((c) => !implementados.includes(c)),
    coberturaReq: req.length ? +(declarados.filter((c) => req.includes(c)).length / req.length).toFixed(2) : null,
    nota,
  });
}

const conta = { IMPLEMENTADO: 0, PARCIAL: 0, "DECLARADO-MORTO": 0, AUSENTE: 0 };
for (const l of linhas) conta[l.estado]++;

writeFileSync("audit/cko-parity.v1.json", JSON.stringify({ gerado_em: new Date().toISOString(), totais: conta, linhas }, null, 2));

let md = `# Paridade CKO x branch-bibliotecas\n\n`;
md += `Gerado por \`scripts/audit-cko-parity.mjs\`. Nao editavel a mao.\n\n`;
md += `| Estado | Schemas |\n|---|---|\n`;
for (const [k, v] of Object.entries(conta)) md += `| **${k}** | ${v} |\n`;
md += `\n> IMPLEMENTADO = todo campo declarado e lido por um consumidor.\n`;
md += `> DECLARADO-MORTO = o campo existe no tipo e nenhum consumidor o le.\n`;
md += `> \`declarados mas nunca lidos\` e a lista do trabalho real.\n\n`;
md += `| Schema CKO | Tipo nosso | Estado | decl | impl | nunca lidos |\n|---|---|---|---|---|---|\n`;
for (const l of linhas.sort((a, b) => a.estado.localeCompare(b.estado) || a.schema.localeCompare(b.schema))) {
  md += `| \`${l.schema}\` | ${l.nossoTipo ? `\`${l.nossoTipo}\`` : "—"} | ${l.estado} | ${l.declarados} | ${l.implementados} | ${l.nuncaLidos.length ? l.nuncaLidos.map((c) => `\`${c}\``).join(", ") : "—"} |\n`;
}
writeFileSync("docs/PARIDADE-CKO.md", md);

console.log(`IMPLITADOS... nao: IMPLEMENTADOS=${conta.IMPLEMENTADO} PARCIAL=${conta.PARCIAL} DECLARADO-MORTO=${conta["DECLARADO-MORTO"]} AUSENTE=${conta.AUSENTE}  (total ${linhas.length})`);
console.log("\n--- o trabalho real: campos declarados que ninguem le ---");
for (const l of linhas.filter((x) => x.nuncaLidos.length)) {
  console.log(`  ${l.schema.padEnd(22)} ${l.nossoTipo ?? "(sem tipo)"}: ${l.nuncaLidos.join(", ")}`);
}
console.log("\n-> audit/cko-parity.v1.json · docs/PARIDADE-CKO.md");