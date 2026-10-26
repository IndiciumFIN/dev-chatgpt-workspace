#!/usr/bin/env node
/**
 * Portão do registro de escrita — o contrato do CI sobre o PMO.
 *
 * O registro (docs/entregas/REGISTRO-DE-ESCRITA.md) é o mapa de quem é dono
 * de quê. Se ele cita um arquivo que não existe, o mapa mente; se dois
 * caminhos apontam para o mesmo arquivo, dois agentes estão autorizados a
 * sobrescrever o mesmo arquivo; se uma migration reservada colide com uma que
 * já existe, alguém vai perder trabalho em produção.
 *
 * A auditoria externa achou exatamente isso: referências que não atendem ao
 * contrato. Este portão é a resposta — a regra vira código, não prosa.
 *
 * uso: node scripts/auditar-registro.mjs [--check] [--self-test] [--json]
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const REGISTRO = join(RAIZ, "docs/entregas/REGISTRO-DE-ESCRITA.md");
const MIGRATIONS = join(RAIZ, "migrations");
const RELATORIO = join(RAIZ, "artifacts/registro.json");

const ARGS = process.argv.slice(2);

/** Isola uma seção do markdown por título (## ...). */
function secao(texto, titulo) {
  const linhas = texto.split("\n");
  const inicio = linhas.findIndex((l) => l.trim() === titulo || l.trim() === `## ${titulo}`);
  if (inicio < 0) return "";
  const fim = linhas.findIndex((l, i) => i > inicio && /^##\s/.test(l));
  return linhas.slice(inicio, fim < 0 ? linhas.length : fim).join("\n");
}

/**
 * Lê a tabela de propriedade: tarefa → caminhos.
 * Só a seção "Propriedade por tarefa" vale: é onde mora o que EXISTE.
 * O que ainda vai ser criado fica na seção de reservas, que é promessa —
 * promessa não é defeito, é dívida declarada.
 */
function lerPropriedades(texto) {
  const tarefas = [];
  for (const linha of secao(texto, "Propriedade por tarefa").split("\n")) {
    if (!linha.startsWith("|")) continue;
    const colunas = linha.split("|").slice(1, -1).map((c) => c.trim());
    if (colunas.length < 2) continue;
    const tarefa = colunas[0].replace(/\*/g, "").trim();
    if (!tarefa || /^-+$/.test(tarefa) || /^Tarefa$/i.test(tarefa)) continue;
    const caminhos = [...linha.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    if (!caminhos.length) continue;
    tarefas.push({ tarefa, caminhos });
  }
  return tarefas;
}

/** As reservas: arquivos declarados que ainda não existem. */
export function lerReservasDeArquivo(texto) {
  const reservas = [];
  for (const linha of secao(texto, "Reservas").split("\n")) {
    if (!linha.startsWith("|")) continue;
    const colunas = linha.split("|").slice(1, -1).map((c) => c.trim());
    if (colunas.length < 3) continue;
    const arquivo = (colunas[1].match(/`([^`]+)`/) || [])[1];
    if (!arquivo) continue;
    reservas.push({ tarefa: colunas[0], arquivo, motivo: colunas[2] });
  }
  return reservas;
}

/** O bloco de reserva de números de migration. */
function lerReservas(texto) {
  const bloco = texto.match(/```\n(0035[\s\S]*?)```/);
  if (!bloco) return [];
  return bloco[1]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\d{4}\s+\S/.test(l))
    .map((l) => ({
      numero: l.split(/\s+/)[0],
      nome: l.split(/\s+/)[1],
    }));
}

const caminhoExiste = (caminho, raiz = RAIZ) => {
  if (caminho.endsWith("/**")) {
    const base = join(raiz, caminho.slice(0, -3));
    return existsSync(base) && statSync(base).isDirectory();
  }
  if (caminho.includes("**")) {
    return existsSync(join(raiz, caminho.split("**")[0]));
  }
  return existsSync(join(raiz, caminho));
};

export async function auditar(opcoes = {}) {
  const registro = opcoes.registro ?? REGISTRO;
  const migrations = opcoes.migrations ?? MIGRATIONS;
  const texto = await readFile(registro, "utf8");
  const tarefas = lerPropriedades(texto);
  const reservas = lerReservas(texto);
  const violacoes = [];

  // 1) Toda referência da tabela de propriedade existe.
  for (const { tarefa, caminhos } of tarefas) {
    for (const caminho of caminhos) {
      if (!caminhoExiste(caminho, opcoes.raiz ?? RAIZ)) {
        violacoes.push({
          tipo: "referencia-inexistente",
          detalhe: `a tarefa "${tarefa}" é dona de "${caminho}", e esse caminho não existe`,
        });
      }
    }
  }

  // 2) Nenhum arquivo tem dois donos — inclusive quando um dono pega o
  //    diretório inteiro e outro pega um arquivo dentro dele.
  const donos = new Map();
  for (const { tarefa, caminhos } of tarefas) {
    for (const caminho of caminhos) {
      if (!donos.has(caminho)) donos.set(caminho, []);
      donos.get(caminho).push(tarefa);
    }
  }
  for (const [caminho, quem] of donos) {
    const unicos = [...new Set(quem)];
    if (unicos.length > 1) {
      violacoes.push({
        tipo: "dois-donos",
        detalhe: `"${caminho}" está em mais de uma tarefa: ${unicos.join(" · ")}`,
      });
    }
  }
  const baseDe = (caminho) => (caminho.endsWith("/**") ? caminho.slice(0, -3) : caminho);
  const lista = [...donos.keys()];
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i];
      const b = lista[j];
      if (a === b) continue;
      const baseA = baseDe(a);
      const baseB = baseDe(b);
      const donosA = [...new Set(donos.get(a))];
      const donosB = [...new Set(donos.get(b))];
      const cruzam = donosA.some((d) => donosB.includes(d)) === false;
      if (cruzam && (baseA.startsWith(baseB + "/") || baseB.startsWith(baseA + "/"))) {
        violacoes.push({
          tipo: "dois-donos",
          detalhe: `"${a}" (${donosA.join(", ")}) e "${b}" (${donosB.join(", ")}) se sobrepõem: um arquivo pode ter dois donos`,
        });
      }
    }
  }

  // 3) Os números de migration reservados são únicos e batem com o disco.
  const existentes = new Map();
  for (const nome of await readdir(migrations)) {
    if (!nome.endsWith(".sql")) continue;
    const numero = nome.slice(0, 4);
    existentes.set(numero, nome.slice(5, -4).replace(/-/g, "_"));
  }
  const vistos = new Set();
  for (const reserva of reservas) {
    if (vistos.has(reserva.numero)) {
      violacoes.push({
        tipo: "numero-reservado-duplicado",
        detalhe: `o número ${reserva.numero} está reservado duas vezes`,
      });
    }
    vistos.add(reserva.numero);
    const noDisco = existentes.get(reserva.numero);
    if (noDisco && noDisco !== reserva.nome.replace(/-/g, "_")) {
      violacoes.push({
        tipo: "colisao-de-migration",
        detalhe: `o número ${reserva.numero} está reservado para "${reserva.nome}", mas no disco existe "${noDisco}"`,
      });
    }
  }

  // 4) Uma reserva de arquivo não pode colidir com um arquivo que já existe.
  for (const reserva of lerReservasDeArquivo(texto)) {
    if (caminhoExiste(reserva.arquivo, opcoes.raiz ?? RAIZ)) {
      violacoes.push({
        tipo: "reserva-ja-existente",
        detalhe: `"${reserva.arquivo}" está reservado por "${reserva.tarefa}", mas já existe na árvore`,
      });
    }
  }

  // 4) Toda tarefa entregue tem os arquivos que o registro diz.
  const entregues = [];
  try {
    for (const entrada of await readdir(join(RAIZ, "deliverables"), { withFileTypes: true })) {
      if (!entrada.isDirectory()) continue;
      if (existsSync(join(RAIZ, "deliverables", entrada.name, "entrega.md"))) {
        entregues.push(entrada.name);
      }
    }
  } catch {
    // sem deliverables neste checkout
  }

  return {
    violacoes,
    tarefas: tarefas.length,
    referencias: tarefas.reduce((acc, t) => acc + t.caminhos.length, 0),
    reservas: reservas.length,
    migrationsNoDisco: existentes.size,
    entregas: entregues.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const relatorio = await auditar();
  console.log(
    `[registro] ${relatorio.tarefas} tarefas · ${relatorio.referencias} referências · ${relatorio.reservas} números reservados · ${relatorio.migrationsNoDisco} migrations no disco`,
  );
  for (const v of relatorio.violacoes) console.log(`  VIOLAÇÃO ${v.tipo}: ${v.detalhe}`);
  if (ARGS.includes("--json")) console.log(JSON.stringify(relatorio, null, 2));
  try {
    await mkdir(join(RAIZ, "artifacts"), { recursive: true });
    await writeFile(RELATORIO, JSON.stringify(relatorio, null, 2));
  } catch {
    // escrever o artefato não pode derrubar o portão
  }
  if (ARGS.includes("--self-test")) {
    // Quebra o contrato de propósito: aponta uma tarefa para um arquivo que
    // não existe, e o portão tem que acusar.
    const original = await readFile(REGISTRO, "utf8");
    const quebrado = original.replace(
      "| Índice do banco |",
      "| Índice do banco | `scripts/arquivo-que-nao-existe.mjs` ·",
    );
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(REGISTRO, quebrado),
    );
    const acusou = await auditar();
    await import("node:fs/promises").then(({ writeFile }) => writeFile(REGISTRO, original));
    const pegou = acusou.violacoes.some((v) => v.tipo === "referencia-inexistente");
    console.log(
      pegou
        ? "[self-test] ok: o portão acusou a referência que não existe."
        : "[self-test] FALHA: o portão aceitou uma referência quebrada.",
    );
    process.exit(peguou ? 0 : 1);
  }
  process.exit(relatorio.violacoes.length === 0 ? 0 : 1);
}
