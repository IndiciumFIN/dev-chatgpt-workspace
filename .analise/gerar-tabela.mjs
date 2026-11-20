/**
 * Gera a tabela do entregável: 67 linhas com tabela, camada, nome de uso,
 * finalidade e origem da derivação. Os dados vêm do que está em código agora
 * (src/lib/banco/indice.ts) e do dump medido do schema (.analise/tabelas.json).
 */
import { readFile, readdir, writeFile } from "node:fs/promises";

const tabelas = JSON.parse(await readFile(new URL("tabelas.json", import.meta.url), "utf8"));
const textoIndice = await readFile(new URL("../src/lib/banco/indice.ts", import.meta.url), "utf8");

const entradas = new Map();
for (const bloco of textoIndice.matchAll(
  /\{\s*name: "([a-z0-9_]+)",\s*label: "([^"]*)",\s*camada: "([^"]*)",\s*purpose: "([^"]*)",\s*primaryKey: "([^"]*)",/g,
)) {
  entradas.set(bloco[1], { label: bloco[2], camada: bloco[3], purpose: bloco[4], primaryKey: bloco[5] });
}

// De onde veio cada tabela: a migration que a cria.
const dir = new URL("../migrations/", import.meta.url);
const arquivos = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
const origem = new Map();
for (const arquivo of arquivos) {
  const sql = await readFile(new URL(arquivo, dir), "utf8");
  for (const tabela of Object.keys(tabelas)) {
    if (new RegExp(`create table if not exists "?${tabela}"?\\s*\\(`, "i").test(sql)) {
      const lista = origem.get(tabela) ?? [];
      lista.push(arquivo);
      origem.set(tabela, lista);
    }
  }
}

/** As colunas que carregam o sentido da tabela — a base da finalidade. */
const semSenso = (coluna) =>
  /^(id|.*_id|.*_key|.*_at|.*_sha1|.*_sha256|sha1|sha256|caminho|path)$/i.test(coluna) ||
  /^(is_|has_|created|updated|revisado|aprovado|.*_required|.*_human)$/i.test(coluna);

const linhas = [];
for (const tabela of Object.keys(tabelas)) {
  const entrada = entradas.get(tabela);
  const info = tabelas[tabela];
  const pk = info.chaves.find((c) => c.def.startsWith("PRIMARY KEY"));
  const colunas = info.colunas.map((c) => c.split(" ")[0]);
  const portadoras = colunas.filter((c) => !semSenso(c));
  const onde = (origem.get(tabela) ?? ["?"]).join(" e ");
  const chave = pk ? pk.cols.join(" + ") : "sem chave primária no DDL";
  const origemTexto =
    `DDL ${onde} — PK medida: ${chave}` +
    (info.fks.length ? `; ${info.fks.length} FK medida(s)` : "; sem FK") +
    `; colunas que carregam o sentido: ${portadoras.join(", ")}`;
  linhas.push(
    `| \`${tabela}\` | ${entrada.camada} | ${entrada.label} | ${entrada.purpose} | ${origemTexto} |`,
  );
}

const cabecalho = [
  "| tabela | camada | nome de uso | finalidade | origem da derivação |",
  "|---|---|---|---|---|",
];
await writeFile(new URL("tabela-67.md", import.meta.url), `${[...cabecalho, ...linhas].join("\n")}\n`);
console.log("linhas:", linhas.length);
