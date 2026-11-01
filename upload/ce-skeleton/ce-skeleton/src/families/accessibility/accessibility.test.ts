// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "accessibility",
  "title": "Accessibility",
  "layer": "CROSS_CUTTING",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "accessibility-rules",
      "title": "Accessibility Rules",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "alternative-text",
      "title": "Alternative Text",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "reading-mode",
      "title": "Reading Mode",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "keyboard-contract",
      "title": "Keyboard Contract",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "contrast-validation",
      "title": "Contrast Validation",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "vlibras-integration",
      "title": "VLibras Integration",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "accessible-output-validator",
      "title": "Accessible Output Validator",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    }
  ]
};

test('família accessibility: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
