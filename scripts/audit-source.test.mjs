/**
 * Portão do processo de source — prova de que o portão sabe falhar.
 *
 * A regra do teste: cada caso quebra UMA coisa de propósito e exige que o
 * portão acuse, nomeando a linha culpada. Portão que passa em tudo não é
 * garantia. E, antes de cada quebra, a cadeia inteira é montada sadia: um
 * portão que acusa de cadeia vazia não está provando nada.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { abrirBanco, auditar } from "./audit-source.mjs";

const rodar = promisify(execFile);
const caminhoPortao = new URL("./audit-source.mjs", import.meta.url).pathname;
const raiz = new URL("..", import.meta.url).pathname;

let db;

before(async () => {
  const aberto = await abrirBanco();
  db = aberto.db;
  assert.deepEqual(aberto.falhas, [], `migration não aplicou: ${JSON.stringify(aberto.falhas)}`);
});

after(async () => {
  await db?.close();
});

/** Solta a restrição que impede a corrupção — só para provar que o portão vê. */
async function soltarRestricao(tabela, fragmento) {
  const encontradas = await db.query(
    `select conname from pg_constraint
     where conrelid = $1::regclass and pg_get_constraintdef(oid) like $2`,
    [tabela, `%${fragmento}%`],
  );
  for (const linha of encontradas.rows) {
    await db.query(`alter table ${tabela} drop constraint "${linha.conname}"`);
  }
  return encontradas.rows.map((linha) => linha.conname);
}

/** Monta a cadeia inteira, sadia. Serve de base para cada caso. */
async function cadeiaSadia() {
  await db.query(
    `insert into intake_batch (id, source, taken_at)
     values ('lote-teste', 'homologado/apgar', '2026-10-26')`,
  );
  await db.query(
    `insert into intake_file (batch_id, path, locale, module, verdict, reason)
     values ('lote-teste', 'apgar.html', 'pt-BR', 'instrumento', 'admitir', 'Capa já governada nesta mesa.')`,
  );
  await db.query(
    `insert into kernel_order (id, title, status, approver_id, owner_id, source_ref, hash)
     values ('wo-teste', 'Pedido de teste', 'aberta', 'revisor', 'dono',
             'transversal-public.lei-12-965-2014.source',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')`,
  );
  await db.query(
    `insert into kernel_order_criterion (order_id, position, criterion)
     values ('wo-teste', 0, 'atomo-com-pinpoint')`,
  );
  await db.query(
    `insert into kernel_order_policy (order_id, package_id, rule_id)
     values ('wo-teste', 'acesso', 'admin-publica-idioma')`,
  );
  await db.query(
    `insert into kernel_validator (order_id, id, passed, note)
     values ('wo-teste', 'pinpoint', true, 'Conferido')`,
  );
  await db.query(
    `insert into kernel_manifest (order_id, status, approved_by, approved_at, hash, version)
     values ('wo-teste', 'aprovado', 'revisor', '2026-10-26T12:00:00.000Z',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '1.0.0')`,
  );
  await db.query(
    `insert into kernel_manifest_policy (order_id, policy_id)
     values ('wo-teste', 'admin-publica-idioma')`,
  );
  await db.query(
    `insert into kernel_manifest_validator (order_id, validator_id)
     values ('wo-teste', 'pinpoint')`,
  );
  await db.query(
    `insert into kernel_approval (id, order_id, approver, decision, reason, approved_at)
     values ('apr-teste', 'wo-teste', 'revisor', 'aprovado', '', '2026-10-26T12:00:00.000Z')`,
  );
  await db.query(
    `insert into policy_decision (id, package_id, rule_id, action, subject_role, effect, actor_id)
     values ('dec-teste', 'acesso', 'admin-publica-idioma', 'admitir_ordem', 'admin', 'allow', 'revisor')`,
  );
  await db.query(
    `update source_tool set published = true, updated_by = 'revisor' where slug = 'braden'`,
  );
  // A pessoa que publica tem que existir como pessoa: um processo não publica.
  await db.query(
    `insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     values ('revisor', 'Revisor', 'revisor@exemplo.test', false, now(), now())
     on conflict (id) do nothing`,
  );
  await db.query(`insert into member (user_id, role) values ('revisor', 'admin') on conflict do nothing`);
  await db.query(
    `insert into source_publication (id, slug, gate_id, policy_decision_id, evidence_ref, actor_id)
     values ('pub-teste', 'braden', 'publicar_ferramenta', 'dec-teste', 'sha256:abc', 'revisor')`,
  );
}

test("a cadeia sadia não tem violação", async () => {
  await cadeiaSadia();
  const relatorio = await auditar(db);
  assert.deepEqual(
    relatorio.violacoes,
    [],
    `violações na cadeia sadia: ${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
  assert.equal(relatorio.contagens.capturas, 1);
  assert.equal(relatorio.contagens.pedidos, 1);
  assert.equal(relatorio.contagens.manifestosAprovados, 1);
  assert.equal(relatorio.contagens.publicacoes, 1);
  assert.ok(
    relatorio.contagens.tabelasDoBanco > 0,
    "o portão conta as tabelas do banco sozinho",
  );
});

test("intake_file sem intake_batch é violação e nomeia a linha", async () => {
  await soltarRestricao("intake_file", "intake_batch");
  await db.query(
    `insert into intake_file (batch_id, path, locale, module, verdict, reason)
     values ('lote-que-nao-existe', 'braden.html', 'pt-BR', 'instrumento', 'admitir', 'Capa já governada nesta mesa.')`,
  );
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "intake-file-sem-lote");
  assert.ok(achado, `o portão não acusou o arquivo órfão: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "intake_file:lote-que-nao-existe/braden.html");
  await db.query("delete from intake_file where batch_id = 'lote-que-nao-existe'");
});

test("kernel_atom sem source_quote é violação e nomeia o átomo", async () => {
  await db.query("update kernel_atom set source_quote = null where id = 'atom-cinco'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "atom-sem-evidencia");
  assert.ok(achado, `o portão não acusou o átomo sem trecho: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "kernel_atom:atom-cinco");
  assert.match(achado.detalhe, /source_quote/);
  await db.query(
    `update kernel_atom set source_quote = 'Braden, Morse, Apgar, gotejamento e IMC têm ficha. Os outros instrumentos têm capa, sem conta.'
     where id = 'atom-cinco'`,
  );
});

test("kernel_atom sem pinpoint é violação", async () => {
  await db.query("update kernel_atom set pinpoint = null where id = 'atom-cinco'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "atom-sem-evidencia" && v.linha === "kernel_atom:atom-cinco",
  );
  assert.ok(achado, `o portão não acusou o átomo sem pinpoint: ${JSON.stringify(relatorio.violacoes)}`);
  assert.match(achado.detalhe, /pinpoint/);
  await db.query(
    `update kernel_atom set pinpoint = 'source_tool.published e tool_field' where id = 'atom-cinco'`,
  );
});

test("kernel_atom sem source_quote_sha256 é violação", async () => {
  await db.query("update kernel_atom set source_quote_sha256 = null where id = 'atom-cinco'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "atom-sem-evidencia" && v.linha === "kernel_atom:atom-cinco",
  );
  assert.ok(achado, `o portão não acusou o átomo sem hash: ${JSON.stringify(relatorio.violacoes)}`);
  assert.match(achado.detalhe, /source_quote_sha256/);
  await db.query(
    `update kernel_atom set source_quote_sha256 = '1a7a5aa1b90e72b94883fbfe07507d55fcce6966b5650f9d1ad880dcd3be917e'
     where id = 'atom-cinco'`,
  );
});

test("kernel_claim sem kernel_evidence é violação e nomeia o desdobramento", async () => {
  await db.query("delete from kernel_evidence where claim_id = 'claim-cinco-publicados'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "claim-sem-evidencia");
  assert.ok(achado, `o portão não acusou o desdobramento sem evidência: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "kernel_claim:claim-cinco-publicados");
  await db.query(
    `insert into kernel_evidence (id, claim_id, kind, locator, note, reference)
     values ('ev-cinco', 'claim-cinco-publicados', 'migration', 'migrations/0023_stored_sheets.sql', 'A ficha gravada é a dos cinco.', 'migrations/0023_stored_sheets.sql')`,
  );
});

test("kernel_manifest aprovado pelo kernel é violação", async () => {
  await soltarRestricao("kernel_manifest", "approved_by");
  await db.query(
    `insert into kernel_order (id, title, status, approver_id, owner_id)
     values ('wo-kernel', 'Aprovado pelo kernel', 'aberta', 'revisor', 'dono')`,
  );
  await db.query(
    `insert into kernel_manifest (order_id, status, approved_by, approved_at, hash)
     values ('wo-kernel', 'aprovado', 'kernel', '2026-10-26T12:00:00.000Z',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')`,
  );
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "manifesto-sem-aprovacao-independente" && v.linha === "kernel_manifest:wo-kernel",
  );
  assert.ok(achado, `o portão não acusou o manifesto do kernel: ${JSON.stringify(relatorio.violacoes)}`);
  assert.match(achado.detalhe, /kernel/);
  await db.query("delete from kernel_manifest where order_id = 'wo-kernel'");
  await db.query("delete from kernel_order where id = 'wo-kernel'");
});

test("kernel_manifest aprovado pelo dono do pedido é violação", async () => {
  await db.query(
    `insert into kernel_order (id, title, status, approver_id, owner_id)
     values ('wo-dono', 'Aprovado pelo dono', 'aberta', 'revisor', 'dono')`,
  );
  await db.query(
    `insert into kernel_manifest (order_id, status, approved_by, approved_at, hash)
     values ('wo-dono', 'aprovado', 'dono', '2026-10-26T12:00:00.000Z',
             'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')`,
  );
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "manifesto-sem-aprovacao-independente" && v.linha === "kernel_manifest:wo-dono",
  );
  assert.ok(achado, `o portão não acusou a autoaprovação: ${JSON.stringify(relatorio.violacoes)}`);
  assert.match(achado.detalhe, /dono/);
  await db.query("delete from kernel_manifest where order_id = 'wo-dono'");
  await db.query("delete from kernel_order where id = 'wo-dono'");
});

test("manifesto aprovado sem registro de aprovação que case é violação", async () => {
  await db.query("delete from kernel_approval where order_id = 'wo-teste'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "manifesto-sem-aprovacao-independente" && v.linha === "kernel_manifest:wo-teste",
  );
  assert.ok(achado, `o portão não acusou o manifesto sem registro: ${JSON.stringify(relatorio.violacoes)}`);
  assert.match(achado.detalhe, /registro de aprovação/);
  await db.query(
    `insert into kernel_approval (id, order_id, approver, decision, reason, approved_at)
     values ('apr-teste', 'wo-teste', 'revisor', 'aprovado', '', '2026-10-26T12:00:00.000Z')`,
  );
});

test("policy_decision sem regra correspondente é violação", async () => {
  await db.query(
    `insert into policy_decision (id, package_id, rule_id, action, subject_role, effect, actor_id)
     values ('dec-fantasma', 'acesso', 'regra-que-nao-existe', 'publicar_idioma', 'admin', 'allow', 'revisor')`,
  );
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "decisao-sem-regra");
  assert.ok(achado, `o portão não acusou a decisão sem regra: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "policy_decision:dec-fantasma");
  await db.query("delete from policy_decision where id = 'dec-fantasma'");
});

test("decisão de negação sem regra não é violação: negar por falta de regra é a norma", async () => {
  await db.query(
    `insert into policy_decision (id, package_id, rule_id, action, subject_role, effect, actor_id)
     values ('dec-negada', 'acesso', null, 'publicar_idioma', 'agente', 'deny', 'agente-1')`,
  );
  const relatorio = await auditar(db);
  assert.ok(
    !relatorio.violacoes.some((v) => v.linha === "policy_decision:dec-negada"),
    `a negação por falta de regra não pode ser violação: ${JSON.stringify(relatorio.violacoes)}`,
  );
  await db.query("delete from policy_decision where id = 'dec-negada'");
});

test("instrumento publicado sem passar pelo portão é violação", async () => {
  await db.query("delete from source_publication where slug = 'braden'");
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "instrumento-sem-portao");
  assert.ok(achado, `o portão não acusou o instrumento sem portão: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "source_tool:braden");
  await db.query(
    `insert into source_publication (id, slug, gate_id, policy_decision_id, evidence_ref, actor_id)
     values ('pub-teste', 'braden', 'publicar_ferramenta', 'dec-teste', 'sha256:abc', 'revisor')`,
  );
});

test("publicação que cita portão inexistente é violação", async () => {
  await db.query(
    `insert into source_publication (id, slug, gate_id, policy_decision_id, evidence_ref, actor_id)
     values ('pub-fantasma', 'apgar', 'portao-que-nao-existe', 'dec-teste', 'sha256:abc', 'revisor')`,
  );
  const relatorio = await auditar(db);
  const achado = relatorio.violacoes.find((v) => v.tipo === "publicacao-com-portao-desconhecido");
  assert.ok(achado, `o portão não acusou o portão fantasma: ${JSON.stringify(relatorio.violacoes)}`);
  assert.equal(achado.linha, "source_publication:pub-fantasma");
  await db.query("delete from source_publication where id = 'pub-fantasma'");
});

test("o portão dá a mesma resposta quando roda duas vezes", async () => {
  const primeira = await rodar("node", [caminhoPortao, "--json"], { cwd: raiz });
  const segunda = await rodar("node", [caminhoPortao, "--json"], { cwd: raiz });
  const relatorioDe = (saida) => JSON.parse(saida.slice(saida.indexOf("{")));
  assert.deepEqual(
    relatorioDe(primeira.stdout).violacoes,
    relatorioDe(segunda.stdout).violacoes,
    "duas execuções do portão têm que dar o mesmo resultado",
  );
  assert.deepEqual(
    relatorioDe(primeira.stdout).contagens,
    relatorioDe(segunda.stdout).contagens,
    "duas execuções do portão têm que contar o mesmo",
  );
});

test("o --self-test corrompe uma linha e o portão a nomeia", async () => {
  const resultado = await rodar("node", [caminhoPortao, "--self-test"], { cwd: raiz }).catch(
    (erro) => erro,
  );
  const saida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
  assert.match(saida, /self-test.*ok/i, `o self-test não se provou:\n${saida}`);
  assert.match(saida, /kernel_atom:/, `o self-test não nomeou a linha quebrada:\n${saida}`);
  assert.match(saida, /VIOLAÇÃO/, `o self-test não imprimiu a violação:\n${saida}`);
});

test("o portão sai com erro quando o banco está violado", async () => {
  // O portão abre o schema dele. Para medir o código de saída quando há
  // violação, o portão roda numa cópia da árvore com uma migration quebrada.
  const temporario = join(
    raiz,
    ".audit-source-fixture",
  );
  await rm(temporario, { recursive: true, force: true });
  await mkdir(join(temporario, "scripts"), { recursive: true });
  await mkdir(join(temporario, "migrations"), { recursive: true });
  await copyFile(caminhoPortao, join(temporario, "scripts", "audit-source.mjs"));
  const migrations = (await readdir(join(raiz, "migrations"))).filter((nome) => nome.endsWith(".sql"));
  for (const nome of migrations) {
    await copyFile(join(raiz, "migrations", nome), join(temporario, "migrations", nome));
  }
  await writeFile(
    join(temporario, "migrations", "0099_quebra.sql"),
    `alter table intake_file drop constraint if exists intake_file_batch_id_fkey;
     insert into intake_file (batch_id, path, locale, module, verdict, reason)
     values ('lote-fantasma', 'braden.html', 'pt-BR', 'instrumento', 'admitir', 'Capa já governada nesta mesa.');`,
  );
  try {
    const resultado = await rodar("node", [join(temporario, "scripts", "audit-source.mjs")], {
      cwd: temporario,
    }).catch((erro) => erro);
    assert.equal(resultado.code, 1, `o portão tinha que falhar:\n${resultado.stdout}`);
    assert.match(
      `${resultado.stdout ?? ""}`,
      /VIOLAÇÃO intake_file:lote-fantasma/,
      `o portão tinha que nomear a linha culpada:\n${resultado.stdout}`,
    );
  } finally {
    await rm(temporario, { recursive: true, force: true });
  }
});

/* ------------------------------------------------------------------ *
 * OPA policy tests use the existing Rego fixture and native OPA tests.
 * No parallel, stale JSON fixture can impersonate governance evidence.
 * The separate CI job executes `opa test --fail-on-empty` with the actual engine.
 * ------------------------------------------------------------------ */

const arquivoRego = new URL("../contracts/cko-governance/opa/kernel_admission.rego", import.meta.url);
const arquivoTesteRego = new URL("../contracts/cko-governance/opa/kernel_admission_test.rego", import.meta.url);

test("a política OPA é deny-by-default", async () => {
  const rego = await readFile(arquivoRego, "utf8");
  assert.match(rego, /default\s+allow\s*:=\s*false/);
  assert.doesNotMatch(rego, /default\s+allow\s*:=\s*true|allow\s*:=\s*true/);
});

test("o fixture Rego vigente exige todos os blocos e o vínculo independente", async () => {
  const rego = await readFile(arquivoTesteRego, "utf8");
  assert.match(rego, /fixture\s*:=\s*\{/);
  for (const bloco of ["work_order", "manifest", "policy", "validator_results", "approval", "execution"]) {
    assert.ok(rego.includes('"' + bloco + '":'), "Missing actual Rego fixture block: " + bloco);
  }
  assert.match(rego, /"requested":\s*false/);
  assert.match(rego, /"owner":\s*"maker"/);
  assert.match(rego, /"approver":\s*"reviewer"/);
  assert.match(rego, /"bundle_signature_verified":\s*true/);
  assert.match(rego, /"evidence_ref":\s*"evidence:\/\//);
});

test("todos os motivos de negação obrigatórios existem na política OPA", async () => {
  const rego = await readFile(arquivoRego, "utf8");
  const expected = [
    "no_valid_policy_or_evidence",
    "missing_independent_approval",
    "unsigned_policy_bundle",
    "no_validators",
    "execution_not_authorized_here",
  ];
  const reasons = [...rego.matchAll(/deny_reason contains "([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(reasons.slice().sort(), expected.slice().sort());
});

test("a suíte Rego real cobre admissão, negação, separação e evidências", async () => {
  const rego = await readFile(arquivoTesteRego, "utf8");
  const tests = [...rego.matchAll(/^test_([a-z0-9_]+)\s+if\s*\{/gm)].map(m => m[1]);
  for (const required of [
    "admits_complete_scoped_candidate",
    "defaults_to_deny_without_input",
    "fails_without_source",
    "fails_when_self_approved",
    "fails_without_independent_approval",
    "fails_for_unsigned_bundle",
    "fails_for_missing_validators",
    "fails_for_duplicate_validator_results",
    "fails_for_failed_validator",
    "fails_for_execution_request",
    "fails_when_human_approval_timestamp_differs_from_manifest",
    "fails_when_approval_timestamp_is_absent",
  ]) {
    assert.ok(tests.includes(required), "Missing real OPA test: "+required);
  }
});
