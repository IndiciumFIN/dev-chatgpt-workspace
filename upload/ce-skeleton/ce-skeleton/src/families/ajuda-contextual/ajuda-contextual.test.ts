// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "ajuda-contextual",
  "title": "Ajuda contextual",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "tooltip",
      "title": "Tooltip",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "popover",
      "title": "Popover",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "info-hint",
      "title": "Info Hint",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "inline-help",
      "title": "Inline Help",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "field-help",
      "title": "Field Help",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "formula-help",
      "title": "Formula Help",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "definition",
      "title": "Definition",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "glossary-lookup",
      "title": "Glossary Lookup",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "por-que-estou-vendo-isso",
      "title": "“Por que estou vendo isso?”",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "source-evidence-hint",
      "title": "Source/Evidence Hint",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "warning-explanation",
      "title": "Warning Explanation",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "example",
      "title": "Example",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "guided-help",
      "title": "Guided Help",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    }
  ]
};

test('família ajuda-contextual: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
