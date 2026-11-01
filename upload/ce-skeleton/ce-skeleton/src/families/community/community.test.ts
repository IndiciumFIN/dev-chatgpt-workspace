// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "community",
  "title": "Community",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "identity-aware-profile",
      "title": "Identity-aware Profile",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "networking",
      "title": "Networking",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "mentoring",
      "title": "Mentoring",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "groups",
      "title": "Groups",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "squads",
      "title": "Squads",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "forum",
      "title": "Forum",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "comments",
      "title": "Comments",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "reactions",
      "title": "Reactions",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "moderation",
      "title": "Moderation",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "abuse-report",
      "title": "Abuse Report",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "block-mute",
      "title": "Block/Mute",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    },
    {
      "id": "reputation",
      "title": "Reputation",
      "status": "CANDIDATE_HOLD",
      "kind": "LOGICAL_SERVICE"
    }
  ]
};

test('família community: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
