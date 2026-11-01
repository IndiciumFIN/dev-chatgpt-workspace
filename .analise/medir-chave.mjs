/**
 * Mede a chave primária e as ligações declaradas de TODAS as tabelas do dicionário
 * contra o DDL do banco. Serve para decidir se o portão pode exigir que a chave
 * declarada seja a chave real — e para não exigir uma regra que o próprio dicionário
 * violaria.
 */
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const db = new PGlite();
for (const nome of (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort()) {
  await db.exec(await readFile(new URL(nome, dir), "utf8"));
}

const entidades = await db.query("select name, primary_key, links, layer_id, label, purpose from schema_entity order by name");
const tabelas = await db.query(
  `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where c.relkind = 'r' and n.nspname = 'public' order by c.relname`,
);
const nomes = new Set(tabelas.rows.map((t) => t.name));

const pks = new Map();
{
  const q = await db.query(
    `select c.relname as name, a.attname as col
     from pg_constraint con
     join pg_class c on c.oid = con.conrelid
     join pg_namespace n on n.oid = c.relnamespace
     join pg_attribute a on a.attrelid = c.oid and a.attnum = any(con.conkey)
     where con.contype = 'p' and n.nspname = 'public'
     order by c.relname, array_position(con.conkey, a.attnum)`,
  );
  for (const linha of q.rows) {
    const lista = pks.get(linha.name) ?? [];
    lista.push(linha.col);
    pks.set(linha.name, lista);
  }
}

const fks = new Map();
for (const t of tabelas.rows) {
  const q = await db.query(
    `select a.attname as col, fc.relname as alvo, fa.attname as col_alvo
     from pg_constraint con
     join pg_class c on c.oid = con.conrelid
     join pg_namespace n on n.oid = c.relnamespace
     join pg_class fc on fc.oid = con.confrelid
     join pg_attribute a on a.attrelid = c.oid and a.attnum = any(con.conkey)
     join pg_attribute fa on fa.attrelid = fc.oid and fa.attnum = any(con.confkey)
     where con.conrelid = $1::regclass and con.contype = 'f' and n.nspname = 'public'`,
    [t.name],
  );
  fks.set(t.name, q.rows.map((r) => `${r.col} → ${r.alvo}.${r.col_alvo}`));
}

/** Compara a chave declarada com a chave real, sem distinguir ordem de vírgula ou "+". */
const normaliza = (t) =>
  String(t)
    .split(/[,+]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .join("+");

let chaveDivergente = 0;
let chaveInventada = 0;
let finalidadeVazia = 0;
const relatorio = [];
for (const e of entidades.rows) {
  const real = pks.get(e.name);
  const declarada = normaliza(e.primary_key);
  let estado = "ok";
  if (!real || real.length === 0) {
    if (!/sem/.test(String(e.primary_key).toLowerCase())) {
      estado = "chave-inventada";
      chaveInventada += 1;
    }
  } else if (declarada !== normaliza(real.join("+"))) {
    estado = "chave-divergente";
    chaveDivergente += 1;
  }
  if (!String(e.purpose ?? "").trim()) {
    estado = estado === "ok" ? "finalidade-vazia" : `${estado}+finalidade-vazia`;
    finalidadeVazia += 1;
  }
  if (estado !== "ok") {
    relatorio.push({
      tabela: e.name,
      estado,
      primary_key: e.primary_key,
      pk_real: real && real.length ? real.join(" + ") : "(sem PK no DDL)",
    });
  }
}

console.log("entidades:", entidades.rows.length);
console.log("tabelas públicas:", nomes.size);
console.log("chave divergente:", chaveDivergente);
console.log("chave inventada:", chaveInventada);
console.log("finalidade vazia:", finalidadeVazia);
console.log("\n--- fora do estado bom ---");
for (const r of relatorio) console.log(" ", r.tabela, "|", r.estado, "| declarado:", r.primary_key, "| real:", r.pk_real);

// Ligações declaradas x FK reais
let ligaDivergente = 0;
const ligaRelatorio = [];
for (const e of entidades.rows) {
  const declaradas = String(e.links ?? "")
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/\s*→\s*/, " → ").replace(/\s*\.\s*/, "."));
  const reais = (fks.get(e.name) ?? []).map((t) => t.replace(/\s*→\s*/, " → ").replace(/\s*\.\s*/, "."));
  const soDeclarado = declaradas.filter((d) => !reais.includes(d));
  const soReal = reais.filter((r) => !declaradas.includes(r));
  if (soDeclarado.length || soReal.length) {
    ligaDivergente += 1;
    ligaRelatorio.push({ tabela: e.name, soDeclarado, soReal });
  }
}
console.log("\nentidades com ligação divergente:", ligaDivergente, "de", entidades.rows.length);
for (const r of ligaRelatorio.slice(0, 40)) {
  console.log(" ", r.tabela, "| só declarado:", JSON.stringify(r.soDeclarado), "| só real:", JSON.stringify(r.soReal));
}
await db.close();
