/**
 * Portão do DERBY — prova de que o portão sabe falhar.
 *
 * A regra do teste: cada caso quebra UMA coisa de propósito e exige que o
 * portão acuse, nomeando a coluna. Portão que passa em tudo não é garantia.
 *
 * E a regra do contrato: a lista de colunas e estados que o portão exige é a
 * mesma que a migration preenche — conferida nos DOIS sentidos. Se alguém
 * trocar uma sem a outra, o teste acusa. Contrato escrito à mão mente;
 * contrato amarrado ao código não.
 *
 * E a regra do desenho: o vazio estrutural só é estrutural porque alguém
 * DECLAROU que é, com a razão. Sem declaração, o vazio é pendência e o portão
 * acusa. Declaração que não bate com o banco é violação (a lista apodrece
 * em silêncio se ninguém olhar).
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import {
  abrirBanco,
  auditar,
  portao,
  parseArgumentos,
  COLUNAS_ALVO,
  ESTADOS_ALVO,
  COLUNAS_CAMINHO,
  DECLARACOES_ESTRUTURAIS,
  MARCADOR,
  RESPONSAVEL,
} from "./preencher-derby.mjs";

const caminhoPortao = new URL("./preencher-derby.mjs", import.meta.url).pathname;
const caminhoMigrations = new URL("../migrations/", import.meta.url);

/** Roda o portão como processo: o código de saída vem sempre, mesmo no acerto. */
function rodarPortao(argumentos) {
  const resultado = spawnSync("node", [caminhoPortao, ...argumentos], {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  });
  return {
    status: resultado.status,
    saida: `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`,
  };
}

let db;

before(async () => {
  const aberto = await abrirBanco();
  db = aberto.db;
});

after(async () => {
  await db?.close();
});

/** Quebra uma coisa, mede, e desfaz explicitamente. Sem depender de rollback. */
async function comQuebrado(quebra, desfaz, medicao) {
  await quebra();
  try {
    return await medicao();
  } finally {
    await desfaz();
  }
}

/* ─────────────────────────── o estado bom ─────────────────────────── */

test("no estado bom, o portão não acusa nada", async () => {
  const relatorio = await auditar(db);
  assert.deepEqual(
    relatorio.violacoes,
    [],
    `violações no estado bom: ${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
});

test("toda pendência tem dono: alvo ou declaração com razão", async () => {
  const relatorio = await auditar(db);
  assert.deepEqual(
    relatorio.semDeclaracao,
    [],
    `pendência sem declaração: ${JSON.stringify(relatorio.semDeclaracao, null, 2)}`,
  );
  for (const p of relatorio.estruturais) {
    assert.ok(
      p.razao && p.razao.length > 20,
      `${p.tabela}.${p.coluna} está declarada sem razão que sustente a declaração`,
    );
  }
  for (const [chave, razao] of Object.entries(DECLARACOES_ESTRUTURAIS)) {
    assert.ok(
      typeof razao === "string" && razao.length > 20,
      `a declaração de ${chave} não tem razão`,
    );
  }
});

/* ─────────────────── o contrato, conferido nos dois sentidos ─────────────────── */

const migrationsDoDono = ["0037_preencher_derby.sql", "0041_passa_de_aprovacao.sql"];

async function textoDasMigrations(nomes) {
  const textos = [];
  for (const nome of nomes) {
    textos.push(await readFile(new URL(nome, caminhoMigrations), "utf8"));
  }
  return textos.join("\n");
}

/** Comandos SQL, um por ";" — como o portão e o teste conversam com o banco. */
function comandos(texto) {
  return texto.split(";").map((comando) => comando.toLowerCase());
}

test("o contrato é conferido nos dois sentidos: portão→migration", async () => {
  const migration = await textoDasMigrations(migrationsDoDono);
  const cmds = comandos(migration);
  // Um comando conta quando a tabela e a coluna aparecem no MESMO comando.
  const falaSobre = (tabela, coluna) =>
    cmds.some(
      (comando) =>
        comando.includes(tabela.toLowerCase()) && comando.includes(coluna.toLowerCase()),
    );
  for (const [tabela, coluna] of COLUNAS_ALVO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige ${tabela}.${coluna} e nenhuma migration preenche`,
    );
  }
  for (const [tabela, coluna, valor] of ESTADOS_ALVO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige o estado de ${tabela}.${coluna} e nenhuma migration mexe nele`,
    );
    assert.ok(
      cmds.some(
        (comando) =>
          comando.includes(tabela.toLowerCase()) &&
          comando.includes(coluna.toLowerCase()) &&
          comando.includes(valor.toLowerCase()),
      ),
      `o portão exige que ${tabela}.${coluna} saia de "${valor}" e nenhuma migration menciona esse estado`,
    );
  }
  for (const [tabela, coluna] of COLUNAS_CAMINHO) {
    assert.ok(
      falaSobre(tabela, coluna),
      `o portão exige ${tabela}.${coluna} e nenhuma migration mexe nela`,
    );
  }
});

test("o contrato é conferido nos dois sentidos: migration→portão", async () => {
  const migration = await textoDasMigrations(migrationsDoDono);
  const cmds = comandos(migration);
  // Toda coluna que a migration marca com o marcador (ou com o responsável
  // da normalização) tem que ser vigiada pelo portão. Se a migration marca
  // uma coluna que o portão não vê, o portão tem um buraco.
  const marcadas = new Set();
  for (const comando of cmds) {
    const set = comando.match(/update\s+([a-z_]+)\s+set\s+(.*)$/);
    if (!set) continue;
    const [, tabela, atribuicoes] = set;
    for (const atribuicao of atribuicoes.matchAll(/([a-z_]+)\s*=\s*'([^']*)'/g)) {
      const valor = atribuicao[2].toLowerCase();
      if (valor === "derby" || valor === "derby-normalizacao") {
        marcadas.add(`${tabela}.${atribuicao[1]}`);
      }
    }
  }
  assert.ok(marcadas.size > 0, "nenhuma coluna marcada encontrada — o teste não está provando nada");
  for (const chave of marcadas) {
    const [tabela, coluna] = chave.split(".");
    assert.ok(
      COLUNAS_ALVO.some(([t, c]) => t === tabela && c === coluna),
      `a migration marca ${chave} e o portão não vigia essa coluna — buraco no portão`,
    );
  }
  // E o estado: toda tabela que a migration tira de um estado pendente tem que
  // estar na lista de estados do portão.
  for (const comando of cmds) {
    const set = comando.match(/update\s+([a-z_]+)\s+set\s+([a-z_]+)\s*=\s*'([^']*)'(.*)$/);
    if (!set) continue;
    const [, tabela, , valor, resto] = set;
    const pendente = ["rascunho", "candidato"].find(
      (estado) => resto.includes(`status = '${estado}'`),
    );
    if (!pendente) continue;
    assert.ok(
      ESTADOS_ALVO.some(([t, c, v]) => t === tabela && c === "status" && v === pendente),
      `a migration tira ${tabela}.status de "${pendente}" e o portão não vigia esse estado`,
    );
  }
});

/* ─────────────────────────── o portão falha e nomeia ─────────────────────────── */

test("campo pendente sem DERBY: o portão acusa e nomeia a coluna", async () => {
  const original = await db.query("select version from source_tool where slug = 'braden'");
  const valorOriginal = original.rows[0].version;
  let violacoes = [];
  await comQuebrado(
    () => db.query("update source_tool set version = '' where slug = 'braden'"),
    () => db.query("update source_tool set version = $1 where slug = 'braden'", [valorOriginal]),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tabela === "source_tool" && v.coluna === "version");
  assert.ok(achado, `o portão não acusou source_tool.version: ${JSON.stringify(violacoes)}`);
  assert.equal(achado.tipo, "pendencia-nao-preenchida");
  const depois = await db.query("select version from source_tool where slug = 'braden'");
  assert.equal(depois.rows[0].version, valorOriginal, "o teardown não restaurou o valor");
});

test("rascunho é pendência legítima, não uma falha de autorização", async () => {
 const report=await auditar(db);
 assert.ok(report.estados.some(x=>x.tabela==="content_text"&&x.estado==="rascunho"),"a migration de correção deve restaurar revisão pendente");
 assert.ok(!report.violacoes.some(x=>x.tipo==="estado-retido"&&x.tabela==="content_text"));
});

test("autor técnico sintético é rejeitado como aprovador", async () => {
 const found=await db.query("select id, admitted_by from kernel_atom order by id limit 1");
 const {id,admitted_by}=found.rows[0];
 await comQuebrado(
  ()=>db.query("update kernel_atom set admitted_by = 'derby-normalizacao' where id = $1",[id]),
  ()=>db.query("update kernel_atom set admitted_by = $1 where id = $2",[admitted_by,id]),
  async ()=>{
   const report=await auditar(db);
   assert.ok(report.violacoes.some(x=>x.tipo==="autoridade-sintetica"&&x.tabela==="kernel_atom"),"autor técnico não pode assinar admissão");
  },
 );
});

test("título que é caminho: o portão acusa", async () => {
  const original = await db.query(
    "select title from content_text where slug = 'missao' and locale = 'pt-BR'",
  );
  const valorOriginal = original.rows[0].title;
  let violacoes = [];
  await comQuebrado(
    () => db.query("update content_text set title = '/caminho/errado' where slug = 'missao' and locale = 'pt-BR'"),
    () => db.query("update content_text set title = $1 where slug = 'missao' and locale = 'pt-BR'", [valorOriginal]),
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find((v) => v.tipo === "valor-caminho" && v.tabela === "content_text");
  assert.ok(achado, `o portão não acusou o caminho: ${JSON.stringify(violacoes)}`);
});

/* ─────────────── o desenho declarado: sem declaração, é pendência ─────────────── */

test("coluna nova com pendência e sem declaração: o portão acusa", async () => {
  // Mutação real no schema: uma coluna que ninguém declarou é pendência,
  // mesmo que a coluna vizinha esteja preenchida. A desculpa estatística
  // ("o irmão tem valor, logo é discriminador") não passa.
  let violacoes = [];
  await comQuebrado(
    async () => {
      await db.query("alter table content_text add column coluna_inexistente text");
      await db.query("update content_text set coluna_inexistente = ''");
    },
    async () => {
      await db.query("alter table content_text drop column coluna_inexistente");
    },
    async () => {
      violacoes = (await auditar(db)).violacoes;
    },
  );
  const achado = violacoes.find(
    (v) => v.tipo === "pendencia-sem-declaracao" && v.coluna === "coluna_inexistente",
  );
  assert.ok(achado, `o portão aceitou pendência sem declaração: ${JSON.stringify(violacoes)}`);
  assert.match(achado.detalhe, /declar/i);
});

test("declaração obsoleta: o portão acusa (a lista não apodrece em silêncio)", async () => {
  // Uma declaração que aponta para uma coluna sem pendência é lixo na lista.
  const relatorio = await auditar(db, {
    declaracoes: { ...DECLARACOES_ESTRUTURAIS, "source_tool.title": "coluna que não tem pendência nenhuma" },
  });
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "declaracao-obsoleta" && v.coluna === "title",
  );
  assert.ok(achado, `o portão aceitou declaração obsoleta: ${JSON.stringify(relatorio.violacoes)}`);
});

test("declaração em conflito com a lista de alvos: o portão acusa", async () => {
  const relatorio = await auditar(db, {
    declaracoes: { ...DECLARACOES_ESTRUTURAIS, "source_tool.version": "não pode ser as duas coisas" },
  });
  const achado = relatorio.violacoes.find(
    (v) => v.tipo === "declaracao-conflita" && v.coluna === "version",
  );
  assert.ok(achado, `o portão aceitou a contradição: ${JSON.stringify(relatorio.violacoes)}`);
});

/* ─────────────────────────── nada fica retido ─────────────────────────── */

test("pendências reais permanecem identificáveis e não contam como aprovação", async () => {
 const report=await auditar(db);
 assert.ok(report.estados.length>0,"a correção deve reter candidatos sem aprovação humana");
 assert.ok(report.estados.some(x=>x.estado==="candidato"||x.estado==="rascunho"));
 assert.ok(!report.violacoes.some(x=>x.tipo==="estado-retido"),"estado pendente por si só não é defeito");
});

test("o marcador DERBY é o que está no campo, não um valor inventado", async () => {
  const contagem = await db.query(
    `select
       (select count(*)::int from source_tool where version = $1) as version,
       (select count(*)::int from source_tool where evidence = $1) as evidence,
       (select count(*)::int from source_tool where band_from = $1) as band_from`,
    [MARCADOR],
  );
  const linha = contagem.rows[0];
  assert.equal(linha.version, 82, "todo instrumento tem versão declarada");
  assert.equal(linha.evidence, 82, "todo instrumento tem evidência declarada");
  assert.equal(linha.band_from, 82, "todo instrumento tem a faixa declarada");
});

test("o idioma tem nome: o rótulo nunca é o próprio código", async () => {
  const ecoados = await db.query("select id, label from locale where label = id");
  assert.deepEqual(ecoados.rows, [], `idioma com rótulo-eco: ${JSON.stringify(ecoados.rows)}`);
  const nomes = await db.query("select count(*)::int as n from locale where label is not null and btrim(label) <> ''");
  assert.equal(nomes.rows[0].n, 31, "todo idioma tem nome");
});

/* ─────────────────────────── a linha de comando ─────────────────────────── */

test("o --self-test falha e nomeia a coluna que quebrou", () => {
  const { status, saida } = rodarPortao(["--self-test"]);
  assert.equal(status, 0, `o self-test não se provou:\n${saida}`);
  assert.match(saida, /self-test.*ok/i, `o self-test não se provou:\n${saida}`);
  assert.match(saida, /version/, `o self-test não nomeou a coluna quebrada:\n${saida}`);
  assert.match(saida, /coluna_do_self_test/, `o self-test não provou a coluna sem declaração:\n${saida}`);
});

test("o --check sai com 0 quando o banco está normalizado", () => {
  // spawnSync devolve o código de saída também quando o processo termina bem.
  const { status, saida } = rodarPortao(["--check"]);
  assert.equal(status, 0, `o --check acusou o banco bom:\n${saida}`);
  assert.doesNotMatch(saida, /VIOLAÇÃO/, `o banco bom acusou violação:\n${saida}`);
});

test("o --check sai com 1 e nomeia tabela e coluna quando o campo é limpo", async () => {
  // O mesmo caminho que o --check da linha de comando usa: sem atalho.
  const { db: bancoQuebrado } = await abrirBanco();
  try {
    await bancoQuebrado.query("update source_tool set version = '' where slug = 'braden'");
    const { relatorio, codigo } = await portao(bancoQuebrado);
    assert.equal(codigo, 1, "o portão tem que sair com 1 quando há campo pendente vazio");
    const achado = relatorio.violacoes.find(
      (v) => v.tabela === "source_tool" && v.coluna === "version",
    );
    assert.ok(achado, `o portão não nomeou a coluna: ${JSON.stringify(relatorio.violacoes)}`);
    assert.match(achado.detalhe, /source_tool/);
    assert.match(achado.detalhe, /version/);
  } finally {
    await bancoQuebrado.close();
  }
});

test("modo desconhecido é erro, não silêncio", () => {
  const { erro } = parseArgumentos(["--inventado"]);
  assert.match(erro, /modo desconhecido: --inventado/);
  assert.equal(parseArgumentos(["--check", "--json"]).erro, undefined);
  assert.equal(parseArgumentos([]).erro, undefined);
});
