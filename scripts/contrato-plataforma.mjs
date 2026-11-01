// @ts-check
/**
 * O contrato da plataforma (`.grok/`: skills, referências, app-env.json) não é
 * versionado — vem do sandbox. Dentro da plataforma ele existe e os testes
 * rodam inteiros; fora dela, o arquivo não está no checkout.
 *
 * A saída honesta para fora da plataforma não é "passar" nem "falhar por um
 * motivo errado": é **pular com o motivo escrito**, para que ninguém leia um
 * vermelho de arquivo ausente como defeito do produto — e para que, dentro da
 * plataforma, o teste volte a valer sem ninguém mexer nele.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTRATO_DIR = ".grok";

/** A raiz do checkout (o diretório que guarda `scripts/`). */
export function projectRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

/**
 * O contrato da plataforma está neste checkout?
 * @param {string[]} [rel] caminhos que precisam existir (relativos à raiz)
 */
export function contratoDaPlataforma(rel = []) {
  if (!existsSync(join(projectRoot(), CONTRATO_DIR))) return false;
  // O diretório `.grok/` pode existir sem os arquivos: o preview cria a pasta
  // para o log. O que decide é o ARQUIVO pedido, não a pasta.
  return rel.every((r) => existsSync(join(projectRoot(), r)));
}

/**
 * Pula o teste quando o contrato da plataforma não está no checkout.
 * @param {import("node:test").TestContext} t
 * @param {string} oQue
 * @param {string[]} [rel] caminhos que precisam existir (relativos à raiz)
 * @returns {boolean} true quando o teste deve seguir
 */
export function semContratoDaPlataforma(t, oQue, rel = []) {
  if (contratoDaPlataforma(rel)) return false;
  t.skip(
    `contrato da plataforma (${CONTRATO_DIR}/) ausente neste checkout — ${oQue} só pode ser medido dentro da plataforma`,
  );
  return true;
}
