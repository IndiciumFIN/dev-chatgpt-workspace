#!/usr/bin/env node
/**
 * Testes do corrector de links do espelho.
 *
 * Fixtures sintéticos, independentes do estado do repo: um corrector que só
 * passa porque os ficheiros do repo estão onde se espera não é um corrector.
 * O teste-chave é o **fail-closed**: depois de reescrever, se sobrar um destino
 * por resolver, o script tem de reprovar (exit 1), não dizer "feito".
 *
 *   node --test scripts/fix-espelho-links.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, "fix-espelho-links.mjs");

/** espelho sintético: 1 hub em catalog/ + 1 item em catalog/assets/ */
function sandbox({ comAcervo = true, comNavegacao = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), "espelho-"));
  const cat = join(root, "public/bibliotecas/catalog");
  const assets = join(root, "public/bibliotecas/assets/anatomia");
  mkdirSync(join(cat, "assets"), { recursive: true });
  mkdirSync(assets, { recursive: true });

  if (comAcervo) writeFileSync(join(assets, "modelo.avif"), "avif");
  if (comNavegacao) writeFileSync(join(cat, "anatomia.html"), "<html>hub</html>");
  writeFileSync(join(cat, "index.html"), "<html>indice</html>");
  // item page: nomeada por SLUG (como no espelho real: 00-hero-ferimento.html),
  // com a CATEGORIA dentro do uri (como no espelho real: <cat>/<f>.avif)
  writeFileSync(join(cat, "assets", "00-modelo.html"),
    '<html><img src="anatomia/modelo.avif"><a href="index.html">idx</a><a href="anatomia.html">cat</a></html>');
  writeFileSync(join(cat, "hub.html"),
    '<html><img src="assets/anatomia/modelo.avif"></html>');
  return root;
}

function run(root, args = []) {
  const r = spawnSync(process.execPath, [SCRIPT, "--root", root, "--json", ...args], { encoding: "utf8" });
  let data = null;
  try { data = JSON.parse(r.stdout); } catch { /* stderr-only */ }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, data };
}

test("sem espelho: reprova com a nota (não é aprovação)", () => {
  const root = mkdtempSync(join(tmpdir(), "espelho-vazio-"));
  try {
    const r = run(root);
    assert.equal(r.status, 1);
    assert.equal(r.data?.status, "ESPELHO_ABSENTE");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("dry-run: conta as ligações quebradas e reescreve as resolvíveis, sem escrever", () => {
  const root = sandbox();
  try {
    const antes = readFileSync(join(root, "public/bibliotecas/catalog/assets/00-modelo.html"), "utf8");
    const r = run(root);
    assert.equal(r.status, 0);
    assert.equal(r.data.status, "PLANO");
    assert.equal(r.data.aplicado, false);
    assert.ok(r.data.ligacoesQuebradasAntes >= 3, `esperava >=3 quebradas, obtive ${r.data.ligacoesQuebradasAntes}`);
    assert.equal(r.data.ligacoesPorResolverDepois, 0);
    assert.equal(r.data.porRegra["R-AVIF-ITEM"], 1);
    assert.equal(r.data.porRegra["R-NAV"], 2);
    assert.equal(r.data.porRegra["R-ASSET-HUB"], 1);
    // nada foi escrito
    assert.equal(readFileSync(join(root, "public/bibliotecas/catalog/assets/00-modelo.html"), "utf8"), antes);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("--apply: escreve e deixa todas as ligações a resolver", () => {
  const root = sandbox();
  try {
    const r = run(root, ["--apply"]);
    assert.equal(r.status, 0);
    assert.equal(r.data.status, "APLICADO");
    assert.equal(r.data.ligacoesPorResolverDepois, 0);
    const item = readFileSync(join(root, "public/bibliotecas/catalog/assets/00-modelo.html"), "utf8");
    assert.match(item, /src="\.\.\/\.\.\/assets\/anatomia\/modelo\.avif"/);
    assert.match(item, /href="\.\.\/index\.html"/);
    assert.match(item, /href="\.\.\/anatomia\.html"/);
    const hub = readFileSync(join(root, "public/bibliotecas/catalog/hub.html"), "utf8");
    assert.match(hub, /src="\.\.\/assets\/anatomia\/modelo\.avif"/);
    // idempotente: uma segunda passagem não tem nada para reescrever
    const r2 = run(root);
    assert.equal(r2.data.ligacoesQuebradasAntes, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fail-closed: sem o activo de destino, a correcção não pode resolver e o script reprova", () => {
  const root = sandbox({ comAcervo: false, comNavegacao: false });
  try {
    const r = run(root, ["--apply"]);
    assert.equal(r.status, 1, "devia reprovar: há ligações que não têm destino");
    assert.equal(r.data.status, "REPROVADO");
    assert.ok(r.data.ligacoesPorResolverDepois > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("não toca em links externos nem em âncoras", () => {
  const root = sandbox();
  try {
    writeFileSync(join(root, "public/bibliotecas/catalog/hub.html"),
      '<html><a href="https://exemplo.test/x">ext</a><a href="#top">anc</a>' +
      '<a href="mailto:a@b.test">mail</a><img src="assets/anatomia/modelo.avif"></html>');
    const r = run(root, ["--apply"]);
    assert.equal(r.status, 0);
    const hub = readFileSync(join(root, "public/bibliotecas/catalog/hub.html"), "utf8");
    assert.match(hub, /href="https:\/\/exemplo\.test\/x"/);
    assert.match(hub, /href="#top"/);
    assert.match(hub, /href="mailto:a@b\.test"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
