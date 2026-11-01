// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "match-intelligence",
  "title": "Match & Intelligence",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "universal-match-engine",
      "title": "Universal Match Engine",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "skill-matching",
      "title": "Skill Matching",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "opportunity-matching",
      "title": "Opportunity Matching",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "course-matching",
      "title": "Course Matching",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "trail-matching",
      "title": "Trail Matching",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "mentor-matching",
      "title": "Mentor Matching",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "eligibility-engine",
      "title": "Eligibility Engine",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "explainability-service",
      "title": "Explainability Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    }
  ]
};

test('família match-intelligence: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
