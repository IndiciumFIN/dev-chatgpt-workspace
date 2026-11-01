/**
 * Idempotência da 0036: aplica as migrations, aplica a 0036 de novo e confere
 * que o dicionário não mudou (contagens e conteúdo das 67 linhas).
 */
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const nomes = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
const db = new PGlite();
for (const nome of nomes) await db.exec(await readFile(new URL(nome, dir), "utf8"));

const antes = await db.query(
  "select name, layer_id, primary_key, purpose, links, label from schema_entity order by name",
);
const camadasAntes = await db.query("select id, label, position from schema_layer order by id");
const colunasAntes = await db.query("select entity, name from schema_column order by entity, name");
const specsAntes = await db.query("select id, status, approved_by, approved_at from data_specification order by id");

// Segunda passagem da 0036: tem de rodar sem erro e não pode mexer em nada.
const sql0036 = await readFile(new URL("0036_indice_do_banco.sql", dir), "utf8");
try {
  await db.exec(sql0036);
  console.log("segunda passagem da 0036: rodou sem erro");
} catch (erro) {
  console.log("segunda passagem da 0036: ERRO ->", String(erro.message).slice(0, 200));
  await db.close();
  process.exit(1);
}

const depois = await db.query(
  "select name, layer_id, primary_key, purpose, links, label from schema_entity order by name",
);
const camadasDepois = await db.query("select id, label, position from schema_layer order by id");
const colunasDepois = await db.query("select entity, name from schema_column order by entity, name");
const specsDepois = await db.query("select id, status, approved_by, approved_at from data_specification order by id");

const iguais = (a, b) => JSON.stringify(a.rows) === JSON.stringify(b.rows);
console.log("schema_entity inalterado:", iguais(antes, depois));
console.log("schema_layer inalterado:", iguais(camadasAntes, camadasDepois));
console.log("schema_column inalterado:", iguais(colunasAntes, colunasDepois));
console.log("data_specification inalterado:", iguais(specsAntes, specsDepois));

// Nada de aprovação automática: nenhuma linha nova pode estar aprovada.
const aprovadas = await db.query(
  "select id, status, approved_by, approved_at from data_specification where status = 'aprovado'",
);
console.log("data_specification aprovadas:", JSON.stringify(aprovadas.rows));
const novas = await db.query(
  "select id, entity, characteristic, status, approved_by, approved_at from data_specification where entity = 'schema_entity'",
);
console.log("linha nova de data_specification:", JSON.stringify(novas.rows));
await db.close();
