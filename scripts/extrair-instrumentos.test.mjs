import { test } from "node:test";
import assert from "node:assert/strict";
import { extrair } from "./extrair-instrumentos.mjs";

/**
 * O extrator só pode afirmar o que está na página. Se um teste passar com
 * dado inventado, o gate inteiro mente — e a OS proíbe faixa inventada.
 */

const paginaEscala = `<!doctype html><html lang="pt-BR"><head>
<title>Escala de Teste - X</title>
<meta name="description" content="Lead da página de teste." />
</head><body>
<h1>Escala de Teste</h1>
<script>
const ITENS_TESTE = [
{
id: "primeiro", label: "1. Primeiro Fator", max: 3,
desc: "Descrição do primeiro fator.",
opts: [
{ val: "", text: "Selecione..." },
{ val: 1, text: "1 - Ruim" },
{ val: 2, text: "2 - Médio" },
{ val: 3, text: "3 - Nenhum Problema Aparente" }
]
},
{
id: "segundo", label: "2. Segundo Fator", max: 2,
desc: "Descrição do segundo fator.",
opts: [
{ val: -1, text: "Selecione..." },
{ val: 0, text: "Ausente (0 pts)" },
{ val: 2, text: "Presente (2 pts)" }
]
}
];
</script>
<h3> Referência Científica </h3>
<p>BRADEN, B.; BERGSTROM, N. A conceptual schema for the study of pressure sores.</p>
</body></html>`;

test("extrai os critérios e as opções da página, sem o placeholder", () => {
  const r = extrair(paginaEscala, "teste");
  assert.equal(r.archetype, "escala-criterios");
  assert.equal(r.criteria.length, 2);
  assert.deepEqual(r.criteria.map((c) => c.id), ["primeiro", "segundo"]);
  assert.equal(r.criteria[0].max, 3);
  assert.equal(r.criteria[0].label, "Primeiro Fator");
  // o placeholder textual ("Selecione...") não entra como opção
  assert.deepEqual(r.criteria[0].choices.map((c) => c.value), [1, 2, 3]);
  // o placeholder numérico (-1) também não entra
  assert.deepEqual(r.criteria[1].choices.map((c) => c.value), [0, 2]);
  // "Nenhum Problema Aparente" é uma opção real, não placeholder
  assert.ok(r.criteria[0].choices.some((c) => /Nenhum Problema/.test(c.label)));
});

test("o título e o resumo saem da página, não de um padrão fixo", () => {
  const r = extrair(paginaEscala, "teste");
  assert.equal(r.title, "Escala de Teste");
  assert.equal(r.lead, "Lead da página de teste.");
});

test("a referência entra com o texto literal da origem", () => {
  const r = extrair(paginaEscala, "teste");
  assert.equal(r.references.length, 1);
  assert.match(r.references[0], /BRADEN/);
});

test("a faixa nunca é inventada: sai como pendência explícita", () => {
  const r = extrair(paginaEscala, "teste");
  assert.equal(r.bands.length, 0);
  assert.ok(r.missing.some((m) => /bands/.test(m)));
});

test("página sem instrumento não ganha conteúdo inventado", () => {
  const r = extrair(
    "<!doctype html><html><head><title>Blog</title></head><body><h1>Notícia</h1><p>Texto.</p></body></html>",
    "blog",
  );
  assert.equal(r.archetype, null);
  assert.equal(r.criteria.length, 0);
  assert.equal(r.fields.length, 0);
  assert.ok(r.missing.some((m) => /arquetipo/.test(m)));
});
