/** Isola o statement que falha: monta o schema mínimo e executa só a 0036. */
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const sql = await readFile(new URL("../migrations/0036_indice_do_banco.sql", import.meta.url), "utf8");
const db = new PGlite();
await db.exec(`
  create table schema_layer (id text primary key, label text not null, position integer not null check (position > 0));
  create table schema_entity (name text primary key, layer_id text not null references schema_layer (id), primary_key text not null, purpose text not null, links text not null default '');
  create table schema_column (entity text not null, name text not null, data_type text not null, required boolean not null, key_part boolean not null, ref_entity text, definition text not null, syntax text not null, unit text, primary key (entity, name));
  create table data_specification (id text primary key, entity text not null, characteristic text not null, definition text not null, syntax text not null, unit text, required boolean not null, owner_role text not null, source text not null, status text not null default 'rascunho' check (status in ('rascunho','aprovado')), approved_by text, approved_at timestamptz, unique (entity, characteristic));
`);

const ini = sql.indexOf("insert into schema_entity (name, layer_id");
const fim = sql.indexOf(";", sql.indexOf("on conflict (name) do update set")) + 1;
const statement = sql.slice(ini, fim);
try {
  await db.exec(statement);
  console.log("statement 1: ok");
} catch (erro) {
  console.log("statement 1 FALHOU:", String(erro.message).slice(0, 200));
  // Recorta a instrução para achar a linha culpada.
  const linhas = statement.split("\n");
  for (let i = 0; i < linhas.length; i += 1) {
    const uma = `insert into schema_entity (name, layer_id, primary_key, purpose, links, label) values\n${linhas[i]}\non conflict (name) do nothing;`;
    try {
      await db.exec(uma);
    } catch (erro2) {
      console.log("  linha culpada:", i + 1, JSON.stringify(linhas[i]).slice(0, 200), "->", String(erro2.message).slice(0, 80));
    }
  }
}
await db.close();
