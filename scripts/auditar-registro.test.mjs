#!/usr/bin/env node
/**
 * Teste do portão do registro de escrita.
 *
 * O registro é o contrato do PMO: quem é dono de quê. Se ele cita um arquivo
 * que não existe, o mapa mente; se dois donos se sobrepõem, dois agentes
 * sobrescrevem o mesmo arquivo — que é o defeito que o registro existe para
 * impedir.
 *
 * O teste monta uma árvore temporária e roda a MESMA função de auditoria
 * sobre ela: o registro de verdade nunca é tocado.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditar, lerReservasDeArquivo } from "./auditar-registro.mjs";

const REGISTRO = new URL("../docs/entregas/REGISTRO-DE-ESCRITA.md", import.meta.url);
const tipos = (violacoes) => violacoes.map((v) => v.tipo);

/**
 * Copia o registro para um arquivo temporário e aplica a mutação.
 * A árvore real continua sendo a referência de existência: só o MAPA muda.
 */
async function registroMutado(mutacao = (t) => t) {
  const dir = await mkdtemp(join(tmpdir(), "registro-"));
  const destino = join(dir, "REGISTRO.md");
  await writeFile(destino, mutacao(await readFile(REGISTRO, "utf8")));
  return { dir, registro: destino, limpar: () => rm(dir, { recursive: true, force: true }) };
}

test("o registro real passa: toda referência existe e ninguém tem dois donos", async () => {
  const relatorio = await auditar();
  assert.equal(
    relatorio.violacoes.length,
    0,
    `violações:\n${JSON.stringify(relatorio.violacoes, null, 2)}`,
  );
  assert.ok(relatorio.referencias > 0, "o registro não referencia nada");
  assert.ok(relatorio.tarefas > 0, "o registro não tem tarefa");
});

test("as reservas do registro são pendências declaradas, e cada uma diz por quê", async () => {
  const texto = await readFile(REGISTRO, "utf8");
  const reservas = lerReservasDeArquivo(texto);
  assert.ok(reservas.length > 0, "nenhuma reserva declarada");
  for (const reserva of reservas) {
    assert.ok(reserva.motivo.length > 8, `a reserva de ${reserva.arquivo} não diz por quê`);
  }
});

test("a auditoria acusa referência que não existe", async () => {
  const { registro, limpar } = await registroMutado((texto) =>
    texto.replace(
      "| Registro e portões da CI |",
      "| Registro e portões da CI | `scripts/que-nao-existe.mjs` ·",
    ),
  );
  try {
    const relatorio = await auditar({ registro });
    assert.ok(
      tipos(relatorio.violacoes).includes("referencia-inexistente"),
      "a auditoria não acusou a referência que não existe",
    );
  } finally {
    await limpar();
  }
});

test("a auditoria acusa dois donos para o mesmo arquivo", async () => {
  // `scripts/status-projeto.mjs` já é do dono da sessão; o índice passa a
  // dizer que também é dele.
  const { registro, limpar } = await registroMutado((texto) =>
    texto.replace(
      "| Índice do banco |",
      "| Índice do banco | `scripts/status-projeto.mjs` ·",
    ),
  );
  try {
    const relatorio = await auditar({ registro });
    assert.ok(
      tipos(relatorio.violacoes).includes("dois-donos"),
      "a auditoria não acusou o arquivo com dois donos",
    );
  } finally {
    await limpar();
  }
});

test("a auditoria acusa reserva que já existe na árvore", async () => {
  const { registro, limpar } = await registroMutado((texto) =>
    texto.replace(
      "| Verificação final | `docs/entregas/REGISTRO-POR-CHAVE.md`",
      "| Verificação final | `package.json`",
    ),
  );
  try {
    const relatorio = await auditar({ registro });
    assert.ok(
      tipos(relatorio.violacoes).includes("reserva-ja-existente"),
      "a auditoria não acusou a reserva que já existe",
    );
  } finally {
    await limpar();
  }
});

test("continuação de uma reserva não vira outra reserva", async () => {
  // A entrada da 0043 tem continuação que começa com número. Se o parser
  // contasse a continuação, o 0038 apareceria reservado duas vezes.
  const { registro, limpar } = await registroMutado((texto) =>
    texto.replace(
      "                               0038 deixou para tabelas filhas)",
      "                               0038 deixou para tabelas filhas)",
    ),
  );
  try {
    const relatorio = await auditar({ registro });
    const duplicados = relatorio.violacoes.filter((v) => v.tipo === "numero-reservado-duplicado");
    assert.equal(duplicados.length, 0, `reserva contada duas vezes: ${JSON.stringify(duplicados)}`);
  } finally {
    await limpar();
  }
});

test("a auditoria acusa número de migration reservado em colisão", async () => {
  // O 0036 já existe no disco como "indice_do_banco"; reservar o mesmo número
  // para outro nome é escrever por cima de uma migration que entrou.
  const { registro, limpar } = await registroMutado((texto) =>
    texto.replace("0036  indice_do_banco", "0036  outro_nome"),
  );
  try {
    const relatorio = await auditar({ registro });
    assert.ok(
      tipos(relatorio.violacoes).includes("colisao-de-migration"),
      "a auditoria não acusou a colisão de migration",
    );
  } finally {
    await limpar();
  }
});
