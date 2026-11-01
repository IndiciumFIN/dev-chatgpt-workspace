// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "localization",
  "title": "Localization",
  "layer": "CROSS_CUTTING",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "locale-registry",
      "title": "Locale Registry",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "translation-workflow",
      "title": "Translation Workflow",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "bcp47",
      "title": "BCP47",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "jurisdiction-localization",
      "title": "Jurisdiction Localization",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "terminology-localization",
      "title": "Terminology Localization",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "content-variant-service",
      "title": "Content Variant Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "regional-projection",
      "title": "Regional Projection",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    }
  ]
};

test('família localization: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
