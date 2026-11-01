// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "contexto",
  "title": "Contexto",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "audience",
      "title": "Audience",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "persona",
      "title": "Persona",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "device",
      "title": "Device",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "locale",
      "title": "Locale",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "jurisdiction",
      "title": "Jurisdiction",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "subscription",
      "title": "Subscription",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "accessibility-profile",
      "title": "Accessibility profile",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "emergency-study-professional-mode",
      "title": "Emergency/Study/Professional mode",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    }
  ]
};

test('família contexto: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
