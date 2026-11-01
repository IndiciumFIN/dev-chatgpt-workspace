// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "learning",
  "title": "Learning",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "course-registry",
      "title": "Course Registry",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "course-offering-service",
      "title": "Course Offering Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "trail-composer",
      "title": "Trail Composer",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "learning-resource-service",
      "title": "Learning Resource Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "credential-service",
      "title": "Credential Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "assessment-service",
      "title": "Assessment Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "quiz-service",
      "title": "Quiz Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "question-bank",
      "title": "Question Bank",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "simulation-service",
      "title": "Simulation Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "progress-service",
      "title": "Progress Service",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "learning-recommendation",
      "title": "Learning Recommendation",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    }
  ]
};

test('família learning: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
