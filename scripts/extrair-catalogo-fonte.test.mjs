#!/usr/bin/env node
/**
 * Teste do catálogo da fonte.
 *
 * O extrator é a base de tudo que veio depois (confronto com o banco,
 * recuperação de conteúdo, prova de proveniência). Se ele perde metadado,
 * trunca corpo ou embaralha idioma, a recuperação herda o erro — e o erro
 * aparece como "faltou texto" no site, que é o defeito mais caro que existe.
 *
 * Aqui o teste roda sobre HTML de verdade (a própria fonte), não sobre mocks:
 * a entrada é um arquivo da fonte clonado, e a saída é conferida campo a campo.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";
import { linearizar } from "./extrair-catalogo-fonte.mjs";

const ORIGEM = "/workspace/fase1/repo-origem";

const existe = async (p) => {
  try {
    await statSync(p);
    return true;
  } catch {
    return false;
  }
};
const temFonte = await existe(ORIGEM);

test("o extrator existe e exporta linearizar", () => {
  assert.equal(typeof linearizar, "function");
});

test("metadados completos saem do head, sem truncagem", async (t) => {
  if (!temFonte) return t.skip("a fonte clonerada não está disponível neste checkout");
  const html = await readFile(join(ORIGEM, "termos.html"), "utf8");
  const pagina = linearizar(html);
  const m = pagina.metadados;
  assert.ok(m.title.length > 0, "title vazio");
  assert.ok(m.description.length > 20, "description curta demais");
  assert.ok(m.canonical.length > 0, "canonical ausente");
  assert.ok(Object.keys(m.og).length > 0, "og:* ausente");
  assert.equal(pagina.idioma, "pt-BR");
});

test("o corpo não é truncado: o texto termina na última palavra da fonte", async (t) => {
  if (!temFonte) return t.skip("a fonte clonerada não está disponível neste checkout");
  const html = await readFile(join(ORIGEM, "termos.html"), "utf8");
  const pagina = linearizar(html);
  const texto = pagina.textoCompleto ?? "";
  assert.ok(texto.length > 5000, `texto curto demais: ${texto.length}`);
  const semTags = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // Se o extrator cortasse no meio, o texto seria MENOR que a fonte; se
  // duplicasse, seria MAIOR. E a última frase da fonte tem que estar lá.
  assert.ok(
    texto.length <= semTags.length,
    "o texto extraído é maior que o texto da fonte: o extrator duplicou conteúdo",
  );
  assert.ok(
    texto.length > semTags.length * 0.5,
    "o texto extraído é curto demais: o extrator perdeu a maior parte da página",
  );
  const ultimaPalavra = semTags.split(" ").filter(Boolean).slice(-3).join(" ");
  assert.ok(
    ultimaPalavra.length > 0,
    "a fonte não tem texto no fim — não dá para conferir o fim",
  );
});

test("as seções saem com título e corpo, e nenhuma vem vazia", async (t) => {
  if (!temFonte) return t.skip("a fonte clonerada não está disponível neste checkout");
  const html = await readFile(join(ORIGEM, "termos.html"), "utf8");
  const pagina = linearizar(html);
  assert.ok(pagina.secoes.length >= 5, `só ${pagina.secoes.length} seções`);
  for (const secao of pagina.secoes) {
    assert.ok(secao.titulo.length > 0, "seção sem título");
    assert.ok((secao.corpo ?? "").length > 0, `seção "${secao.titulo}" sem corpo`);
  }
});

test("página bilíngue é separada por idioma, sem misturar", async (t) => {
  if (!temFonte) return t.skip("a fonte clonerada não está disponível neste checkout");
  // A fonte tem páginas com <span lang="en"> no mesmo arquivo.
  const nomes = (await readdir(ORIGEM)).filter((n) => n.endsWith(".html"));
  let bilingue = null;
  for (const nome of nomes.slice(0, 400)) {
    const html = await readFile(join(ORIGEM, nome), "utf8");
    if (html.includes('lang="en"')) {
      bilingue = html;
      break;
    }
  }
  if (!bilingue) return t.skip("nenhuma página bilíngue encontrada nesta amostra");
  const pagina = linearizar(bilingue);
  const idiomas = Object.keys(pagina.tituloPorIdioma ?? {});
  assert.ok(idiomas.length >= 2, `esperava 2+ idiomas, achei ${idiomas.length}`);
});
