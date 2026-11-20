/**
 * Conferência das 67 entradas: o que o dicionário afirma contra o que o schema diz.
 * Compara chave primária e chaves estrangeiras reais (medidas no PGlite) com o que
 * está escrito em src/lib/banco/indice.ts e em migrations/0036_indice_do_banco.sql.
 */
import { readFile, writeFile } from "node:fs/promises";

const tabelas = JSON.parse(await readFile(new URL("tabelas.json", import.meta.url), "utf8"));

/** Lê as entradas do índice em código. */
const textoIndice = await readFile(new URL("../src/lib/banco/indice.ts", import.meta.url), "utf8");
const entradas = new Map();
for (const bloco of textoIndice.matchAll(
  /\{\s*name: "([a-z0-9_]+)",\s*label: "([^"]*)",\s*camada: "([^"]*)",\s*purpose: "([^"]*)",\s*primaryKey: "([^"]*)",\s*produto: "([^"]*)",\s*admin: ([^,]+),?\s*\}/g,
)) {
  entradas.set(bloco[1], {
    name: bloco[1],
    label: bloco[2],
    camada: bloco[3],
    purpose: bloco[4],
    primaryKey: bloco[5],
    produto: bloco[6],
    admin: bloco[7].trim(),
  });
}

/** Lê as linhas do dicionário na migration. */
const textoSql = await readFile(new URL("../migrations/0036_indice_do_banco.sql", import.meta.url), "utf8");
const linhas = new Map();
const blocoInsert = textoSql.slice(textoSql.indexOf("insert into schema_entity (name, layer_id"));
for (const linha of blocoInsert.split("\n")) {
  const achado = linha.match(
    /^ {2}\('([a-z0-9_]+)', '([a-z]+)', '([^']*)', '([^']*)', '([^']*)', '([^']*)'\),?$/,
  );
  if (achado) {
    linhas.set(achado[1], {
      name: achado[1],
      camada: achado[2],
      primaryKey: achado[3],
      purpose: achado[4],
      links: achado[5],
      label: achado[6],
    });
  }
}

const problemas = [];
const relatorio = [];

for (const [tabela, info] of Object.entries(tabelas)) {
  const entrada = entradas.get(tabela);
  const linha = linhas.get(tabela);
  if (!entrada) problemas.push(`${tabela}: sem entrada em src/lib/banco/indice.ts`);
  if (!linha) problemas.push(`${tabela}: sem linha em migrations/0036_indice_do_banco.sql`);
  if (!entrada || !linha) continue;

  if (entrada.label !== linha.label) {
    problemas.push(`${tabela}: label divergente (índice "${entrada.label}" × dicionário "${linha.label}")`);
  }
  if (entrada.camada !== linha.camada) {
    problemas.push(`${tabela}: camada divergente (índice "${entrada.camada}" × dicionário "${linha.camada}")`);
  }
  if (entrada.purpose !== linha.purpose) {
    problemas.push(`${tabela}: finalidade divergente entre índice e dicionário`);
  }
  if (entrada.primaryKey !== linha.primaryKey) {
    problemas.push(`${tabela}: chave primária divergente entre índice e dicionário`);
  }

  // Chave primária real, medida.
  const pk = info.chaves.find((c) => c.def.startsWith("PRIMARY KEY"));
  const colunasPk = pk ? pk.cols : null;
  const esperada = colunasPk ? colunasPk.join(" + ") : null;
  const escrita = entrada.primaryKey.replace(/,/g, " + ").trim();
  if (esperada === null) {
    if (!/sem chave|padrão/.test(escrita)) {
      problemas.push(`${tabela}: não tem chave primária no DDL e o dicionário afirma "${escrita}"`);
    }
  } else {
    const normaliza = (t) =>
      t
        .replace(/\s+/g, " ")
        .replace(/,\s*/g, " + ")
        .replace(/\s*\+\s*/g, " + ")
        .toLowerCase();
    if (normaliza(escrita) !== normaliza(esperada)) {
      problemas.push(`${tabela}: chave primária escrita "${escrita}" × medida "${esperada}"`);
    }
  }

  // Chaves estrangeiras: todo o "a → b.c" declarado tem que existir como FK real,
  // e toda FK real tem que estar declarada.
  const fksReais = info.fks.map((f) => {
    const m = f.match(/FOREIGN KEY \(([^)]*)\) REFERENCES ([a-z0-9_]+)\(([^)]*)\)/i);
    return m ? { col: m[1].replace(/"/g, ""), alvo: m[2], colAlvo: m[3].replace(/"/g, "") } : null;
  }).filter(Boolean);
  const declarados = linha.links
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const m = t.match(/^([a-z0-9_]+) → ([a-z0-9_]+)\.([a-z0-9_]+)$/);
      return m ? { col: m[1], alvo: m[2], colAlvo: m[3] } : { bruto: t };
    });
  for (const d of declarados) {
    if (d.bruto) {
      problemas.push(`${tabela}: vínculo escrito fora do formato "coluna → tabela.coluna": "${d.bruto}"`);
      continue;
    }
    const existe = fksReais.some(
      (fk) => fk.col === d.col && fk.alvo === d.alvo && fk.colAlvo === d.colAlvo,
    );
    if (!existe) {
      problemas.push(`${tabela}: vínculo declarado "${d.col} → ${d.alvo}.${d.colAlvo}" não existe como FK no DDL`);
    }
  }
  for (const fk of fksReais) {
    const declarado = declarados.some(
      (d) => d.col === fk.col && d.alvo === fk.alvo && d.colAlvo === fk.colAlvo,
    );
    if (!declarado) {
      problemas.push(`${tabela}: FK real "${fk.col} → ${fk.alvo}.${fk.colAlvo}" não está no dicionário`);
    }
  }

  // Finalidade: uma coluna "portadora de sentido" é a que não é identificador,
  // chave estrangeira, carimbo de tempo, boolean ou impressão digital. Sem
  // nenhuma delas, a finalidade não sai do schema: a resposta é "por derivar".
  const semSenso = (coluna) =>
    /^(id|.*_id|.*_key|.*_at|.*_sha1|.*_sha256|sha1|sha256|caminho|path)$/i.test(coluna) ||
    /^(is_|has_|created|updated|revisado|aprovado|.*_required|.*_human)$/i.test(coluna);
  const portadoras = info.colunas
    .map((c) => c.split(" ")[0])
    .filter((c) => !semSenso(c));
  if (portadoras.length === 0 && !/por derivar/.test(entrada.purpose)) {
    problemas.push(`${tabela}: sem coluna portadora de sentido no DDL e a finalidade não diz "por derivar"`);
  }

  relatorio.push({
    tabela,
    camada: entrada.camada,
    label: entrada.label,
    produto: entrada.produto,
    primaryKey: entrada.primaryKey,
    pkReal: colunasPk ? colunasPk.join(" + ") : "(sem PK)",
    linhas: info.linhas,
    colunas: info.colunas.length,
    fks: fksReais.length,
    finalidade: entrada.purpose,
    colunasPortadoras: portadoras,
  });
}

console.log("tabelas conferidas:", relatorio.length);
console.log("problemas:", problemas.length);
for (const p of problemas) console.log("  !!", p);
console.log("\n--- por camada ---");
const porCamada = {};
for (const r of relatorio) porCamada[r.camada] = (porCamada[r.camada] || 0) + 1;
console.log(porCamada);
console.log("\n--- por prefixo de nome ---");
const porPrefixo = {};
for (const r of relatorio) {
  const p = r.tabela.split("_")[0];
  porPrefixo[p] = (porPrefixo[p] || 0) + 1;
}
console.log(porPrefixo);
console.log("\n--- sem coluna portadora de sentido (finalidade por derivar) ---");
let semPortadora = 0;
for (const r of relatorio) if (r.colunasPortadoras.length === 0) { semPortadora += 1; console.log(" ", r.tabela, "→", r.finalidade); }
console.log("tabelas sem coluna portadora:", semPortadora);
console.log("\n--- contagem de colunas portadoras por tabela (amostra) ---");
for (const r of relatorio.slice(0, 8)) console.log(" ", r.tabela, "→", r.colunasPortadoras.join(", "));
await writeFile(new URL("conferido.json", import.meta.url), JSON.stringify({ relatorio, problemas }, null, 2));
