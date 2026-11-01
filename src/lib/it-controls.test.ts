import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { patientStorage } from "./component-contract.ts";
import { assertAdminRole, assertProductionAuth } from "./publish-guard.ts";

test("as migrations não guardam lista nem JSON", async () => {
  const names = (await readdir(new URL("../../migrations/", import.meta.url))).filter((name) => name.endsWith(".sql"));
  for (const name of names) {
    const sql = await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8");
    // A string literal containing a JSON Schema filepath is not a JSON column.
    // Strip comments and SQL single-quoted values before checking real type tokens.
    const body = sql.replace(/--.*$/gm, "").replace(/'(?:''|[^'])*'/g, "''");
    assert.equal(/\bjsonb?\b/i.test(body), false, name);
    if (/create table/i.test(body)) assert.match(body, /primary key/i);
  }
  // A regra é sobre o SCHEMA, não sobre o texto de cada migration: uma
  // migration pode criar uma coluna de lista e a seguinte tirá-la. O que
  // não pode é o schema final guardar lista nem JSON. Conferir o texto de
  // todas as migrations erraria a transição e não pegaria o schema.
  const db = new PGlite();
  for (const name of names.sort()) {
    await db.exec(await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  }
  const colunas = await db.query(
    `select table_name, column_name, data_type from information_schema.columns
     where table_schema = 'public' and data_type in ('ARRAY', 'json', 'jsonb')`,
  );
  assert.deepEqual(colunas.rows, []);
});

test("aplicar as migrations duas vezes não duplica o processo", async () => {
  const db = new PGlite();
  const names = (await readdir(new URL("../../migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  const files = await Promise.all(names.map(async (name) => readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8")));
  for (const sql of files) await db.exec(sql);
  for (const sql of files) await db.exec(sql);
  const rows = await db.query("select id from process");
  assert.equal(rows.rows.length, 3);
  const settings = await db.query("select key from process_setting");
  assert.equal(settings.rows.length, 4);
});

test("só o administrador passa e a publicação com autenticação desligada não grava", () => {
  assert.throws(() => assertAdminRole("subscriber"), /administrador/);
  assert.doesNotThrow(() => assertAdminRole("admin"));
  assert.throws(() => assertProductionAuth({ VERCEL: "1", VITE_AUTH_ENABLED: "false" }), /desligada/);
  assert.doesNotThrow(() => assertProductionAuth({ VERCEL: "1", VITE_AUTH_ENABLED: "true" }));
  assert.doesNotThrow(() => assertProductionAuth({ VITE_AUTH_ENABLED: "false" }));
});

test("paciente não tem armazenamento e o navegador só guarda preferência", async () => {
  assert.equal(patientStorage, "nenhum");
  const chrome = await readFile(new URL("./chrome.tsx", import.meta.url), "utf8");
  const keys = [...new Set([...chrome.matchAll(/localStorage\.setItem\("([^"]+)"/g)].map((match) => match[1]))].sort();
  assert.deepEqual(keys, ["cde-consent", "cde-contrast", "cde-dyslexia", "cde-focus", "cde-font", "cde-locale", "cde-theme"]);
});

test("a gravação usa o usuário da sessão, não um id vindo do cliente", async () => {
  const source = await readFile(new URL("./source.functions.ts", import.meta.url), "utf8");
  // The current implementation uses the session-bound admin middleware and
  // updates the known source_tool row, rather than the removed saveSheetTx helper.
  const save = source.slice(source.indexOf("export const saveTool ="), source.indexOf("export const setMemberRole ="));
  assert.match(save, /\.middleware\(\[authMiddleware\]\)/);
  assert.match(save, /requireAdmin\(sql, context\.userId\)/);
  assert.match(save, /where slug = \$\{data\.slug\}/);
  assert.doesNotMatch(save, /\b(?:data\.userId|userId:\s*data\.userId)\b/);
});

test("o formulário da ferramenta marca obrigatório, erro e rótulo", async () => {
  const form = await readFile(new URL("../components/tools/clinical-form.tsx", import.meta.url), "utf8");
  assert.match(form, /aria-required="true"/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /<fieldset/);
  assert.match(form, /<legend>/);
  const shell = await readFile(new URL("../components/site/shell.tsx", import.meta.url), "utf8");
  assert.match(shell, /className="skip-link"/);
  assert.match(shell, /aria-label=\{chrome\.t\("search"\)\}/);
});

test("toda tabela da migration está na prova de 2FN e 3FN", async () => {
  const names = (await readdir(new URL("../../migrations/", import.meta.url))).filter((name) => name.endsWith(".sql"));
  const tables = new Set<string>();
  for (const name of names) {
    const sql = await readFile(new URL(`../../migrations/${name}`, import.meta.url), "utf8");
    for (const match of sql.matchAll(/create table if not exists "?(\w+)"?/gi)) tables.add(match[1]);
  }
  const proof = await readFile(new URL("../../it-book/docs/normalizacao.md", import.meta.url), "utf8");
  for (const table of tables) assert.match(proof, new RegExp(`\\| ${table} \\|`));
  assert.match(proof, /2FN: em chave composta/);
  assert.match(proof, /3FN: nenhuma coluna fora da chave/);
  assert.match(proof, /Não houve divisão/);
});
