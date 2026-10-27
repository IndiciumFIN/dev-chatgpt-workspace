#!/usr/bin/env node
/**
 * Testes determinísticos do contrato de conteúdo de Curiosidades.
 * Executar: node --experimental-strip-types scripts/test-curiosidades-model.mjs
 */
import assert from "node:assert/strict";
import {
  CURIOSITY_BLOCK_TYPES, curiosityReferenceNumbers, curiosityToc,
  mayPublishCuriosity, validateCuriosityContent, normalizeFaqParagraphs,
} from "../src/lib/content/curiosidades/model.ts";

assert.equal(CURIOSITY_BLOCK_TYPES.length, 10);
assert.deepEqual(normalizeFaqParagraphs("Resposta isolada"), ["Resposta isolada"]);
assert.deepEqual(normalizeFaqParagraphs(["P1", 1, "P2"]), ["P1", "P2"]);
assert.deepEqual(normalizeFaqParagraphs(null), []);
const page = {
  slug: "artigo-exemplo",
  title: "Artigo de teste",
  hero_lead: "Material de validação, sem publicação",
  seo_description: "Conteúdo sintético de teste",
  category: "history",
  intro: { lead: "Exemplo" },
  sections: [
    {
      id: "s1", title: "Seção", paragraphs: ["Texto sintético."], sources: ["SRC-TEST"],
      components: CURIOSITY_BLOCK_TYPES.map((type) => ({
        type, text: "Texto do bloco",
        items: type === "faq" ? [{ q: "Pergunta?", paragraphs: ["Resposta."] }] : [{ title: "Item", text: "Texto" }],
      })),
    },
  ],
  references: [{ id: "SRC-TEST" }], related_slugs: [],
};
const row = { slug: page.slug, title: page.title, content_status: "NEEDS_REVIEW", content_json: page };
const source = { source_id: "SRC-TEST", title: "Fonte de teste", url: "https://example.org" };
const sources = new Map([[source.source_id, source]]);
const gates = {
  editorialApproved: true, sourceValidated: true, rightsCleared: true,
  mediaCleared: true, accessibilityPassed: true, visualPassed: true, ownerApproved: true,
};

assert.deepEqual(validateCuriosityContent(row, sources), [], "Contrato sintético correto deve validar");
assert.equal(mayPublishCuriosity(row, sources, gates), false, "NEEDS_REVIEW jamais publica");
assert.equal(mayPublishCuriosity({ ...row, content_status: "BLOCKED_SOURCE" }, sources, gates), false);
assert.equal(mayPublishCuriosity({ ...row, content_status: "APPROVED" }, sources, { ...gates, ownerApproved: false }), false);
assert.equal(mayPublishCuriosity({ ...row, content_status: "APPROVED" }, sources, gates), true);
assert.equal(curiosityReferenceNumbers(page).get("SRC-TEST"), 1);
assert.deepEqual(curiosityToc(page).map((x) => x.id), ["introducao", "s1", "referencias"]);

const unknown = {
  ...row, content_json: {
    ...page, sections: [{ ...page.sections[0], components: [{ type: "unknown" }] }],
  },
};
assert(validateCuriosityContent(unknown, sources).some((x) => x.startsWith("UNSUPPORTED_COMPONENT:")));
assert.equal(mayPublishCuriosity({ ...unknown, content_status: "APPROVED" }, sources, gates), false);
assert(validateCuriosityContent(row, new Map()).some((x) => x.startsWith("SOURCE_NOT_FOUND:")));
assert(validateCuriosityContent({
  ...row, content_json: { ...page, sections: [...page.sections, page.sections[0]] },
}, sources).some((x) => x.startsWith("DUPLICATE_OR_INVALID_SECTION:")));

console.log(JSON.stringify({ status: "PASS_MODEL", blockTypes: 10, cases: 11, scope: "synthetic-fixture", contentPublication: "NOT_AUTHORIZED" }));
