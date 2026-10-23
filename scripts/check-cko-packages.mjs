/**
 * Gate de integridade dos pacotes CKO vendorizados.
 *
 * Os pacotes em `contracts/cko-*` sao de terceiros. Versiona-los (em vez de
 * puxar por rede) e uma escolha de PRODUTO: quem abre o repositorio nao
 * precisa de hash, de rede nem de fetch para rodar a auditoria de paridade.
 *
 * A garantia nao vem da ausencia de commit — vem deste gate. Cada arquivo
 * e conferido contra o SHA256 que o proprio pacote declara, e os pacotes que
 * nao trazem checksum recebem um manifesto pfixado no repositorio.
 *
 * Divergencia reprova. Alguem que mexeu no pacote vendorizado sem querer
 * descobre no gate, nao em seis meses depois.
 *
 *   node scripts/check-cko-packages.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const PACOTES = [
  "contracts/cko-skeleton",
  "contracts/cko-bibliotecas",
  "contracts/cko-tokens",
  "contracts/cko-editorial",
  "contracts/cko-skeletons",
];

/** Manifesto pfixado, para os pacotes que nao trazem checksum proprio. */
const PINADOS = JSON.parse(readFileSync("registers/governance/cko-package-manifest.v1.json", "utf8"));

function sha256(arquivo) {
  return createHash("sha256").update(readFileSync(arquivo)).digest("hex");
}

function listaArquivos(raiz) {
  const out = [];
  const percorre = (dir) => {
    for (const a of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, a.name);
      if (a.isDirectory()) percorre(p);
      else if (a.isFile()) out.push(p);
    }
  };
  if (existsSync(raiz)) percorre(raiz);
  return out.sort();
}

let falhas = 0;
const check = (nome, ok, detalhe) => {
  if (!ok) falhas++;
  console.log(`${ok ? "PASS" : "FAIL"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

// ── 1. cada pacote tem um manifesto declarado ───────────────────────────────
for (const pkg of PACOTES) {
  const existe = existsSync(pkg);
  check(`pacote presente: ${pkg}`, existe, existe ? "" : "pasta ausente");
}

// ── 2. o checksum declarado bate com o arquivo em disco ─────────────────────
let conferidos = 0, divergentes = 0, ausentes = 0;
for (const pkg of PACOTES) {
  const sumsPath = join(pkg, "SHA256SUMS.json");
  if (!existsSync(sumsPath)) continue;
  const { files } = JSON.parse(readFileSync(sumsPath, "utf8"));
  for (const item of files) {
    const alvo = join(pkg, item.file);
    if (!existsSync(alvo)) { ausentes++; continue; }
    conferidos++;
    if (sha256(alvo) !== item.sha256) { divergentes++; console.log(`    DIVERGENTE: ${alvo}`); }
  }
}
check("checksums declarados conferem", divergentes === 0 && ausentes === 0,
  `${conferidos} conferidos · ${divergentes} divergentes · ${ausentes} ausentes`);

// ── 3. os pacotes sem checksum proprio batem com o manifesto pfixado ───────
let pfixadosOk = 0, pfixadosRuins = 0;
for (const [pkg, esperado] of Object.entries(PINADOS.pacotes ?? {})) {
  for (const [rel, hash] of Object.entries(esperado.arquivos ?? {})) {
    const alvo = join(pkg, rel);
    if (!existsSync(alvo)) { pfixadosRuins++; console.log(`    AUSENTE: ${alvo}`); continue; }
    if (sha256(alvo) !== hash) { pfixadosRuins++; console.log(`    DIVERGENTE: ${alvo}`); }
    else pfixadosOk++;
  }
}
check("manifesto pfixado dos pacotes sem checksum confere", pfixadosRuins === 0,
  `${pfixadosOk} conferidos · ${pfixadosRuins} problemas`);

// ── 4. nenhum arquivo sobrou sem estar no manifesto ────────────────────────
const orfaos = [];
for (const pkg of PACOTES) {
  const declarado = new Set();
  const sumsPath = join(pkg, "SHA256SUMS.json");
  if (existsSync(sumsPath)) for (const i of JSON.parse(readFileSync(sumsPath, "utf8")).files) declarado.add(i.file);
  const pinado = PINADOS.pacotes?.[pkg]?.arquivos ?? {};
  for (const rel of Object.keys(pinado)) declarado.add(rel);
  for (const abs of listaArquivos(pkg)) {
    const rel = relative(pkg, abs).split("\\").join("/");
    if (rel === "SHA256SUMS.json") continue;
    if (!declarado.has(rel)) orfaos.push(`${pkg}/${rel}`);
  }
}
check("nenhum arquivo de pacote fora do manifesto", orfaos.length === 0,
  orfaos.length ? `orfaos: ${orfaos.slice(0, 5).join(", ")}${orfaos.length > 5 ? ` (+${orfaos.length - 5})` : ""}` : "tudo declarado");

const resumo = falhas === 0 ? "tudo consistente" : String(falhas) + " verificacao(oes) falharam";
console.log("\nIntegridade dos pacotes CKO: " + resumo);
process.exit(falhas === 0 ? 0 : 1);
