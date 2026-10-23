/**
 * Gate de frescor dos artefatos gerados.
 *
 * Os contratos, o indice de artigos e o indice de contratos sao DERIVADOS do
 * codigo. Versiona-los sem provar que batem com o codigo e a forma exata de
 * um contrato escrito a mao mentir no dia seguinte: alguem muda o codigo, o
 * JSON antigo continua no disco, e o gate de cobertura passa porque le o
 * arquivo velho.
 *
 * Este gate REGENERA num diretorio temporario e compara. Se o que esta no
 * disco difere do que o codigo produz, reprova e diz o que difere.
 *
 *   node scripts/check-generated-fresh.mjs
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

let falhas = 0;
const check = (nome, ok, detalhe) => {
  if (!ok) falhas++;
  console.log(`${ok ? "PASS" : "FAIL"} ${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/**
 * O contrato e gerado por `generate-entity-contracts.mjs`, que escreve em
 * disco. Regenerar direto sobrescreveria o arquivo — e ai nao daria para
 * comparar. Por isso o script roda com um prefixo de saida temporario.
 */
const ALVOS = [
  { arquivo: "contracts/entities/clinical-tools.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/routes.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/components.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/design-tokens.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/chrome-bands.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/brand-assets.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
  { arquivo: "contracts/entities/articles.v1.json", gerador: "scripts/generate-entity-contracts.mjs" },
];

// O gerador aceita um prefixo de saida; quando nao aceita, comparamos o
// conteudo depois de regerar sobre uma copia.
const tmp = mkdtempSync(join(tmpdir(), "cke-fresh-"));
const antes = new Map();
for (const a of ALVOS) if (existsSync(a.arquivo)) antes.set(a.arquivo, sha(a.arquivo));

// backup dos arquivos, regeracao, comparacao, restauracao
const backup = new Map();
for (const a of ALVOS) if (existsSync(a.arquivo)) backup.set(a.arquivo, readFileSync(a.arquivo));

let regenerou = true;
try {
  execFileSync(process.execPath, ["scripts/generate-entity-contracts.mjs"], { stdio: "ignore" });
} catch {
  regenerou = false;
}

for (const a of ALVOS) {
  if (!existsSync(a.arquivo)) { check(`gerado presente: ${a.arquivo}`, false, "nao existe apos regenerar"); continue; }
  const agora = sha(a.arquivo);
  const era = antes.get(a.arquivo);
  check(`gerado bate com o codigo: ${a.arquivo.split("/").pop()}`, era === agora,
    era === undefined ? "nao existia antes" : era === agora ? "identico" : "DIVERGENTE do que esta no disco");
}

// restaura: o gate nao pode deixar o disco diferente do que estava
for (const [p, buf] of backup) writeFileSync(p, buf);

rmSync(tmp, { recursive: true, force: true });

check("geracao de contratos roda sem erro", regenerou, regenerou ? "" : "o gerador falhou");

const resumo = falhas === 0 ? "tudo fresco" : `${falhas} verificacao(oes) falharam`;
console.log(`\nFrescor dos gerados: ${resumo}`);
process.exit(falhas === 0 ? 0 : 1);
