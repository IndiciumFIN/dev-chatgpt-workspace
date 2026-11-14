// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "configuracoes",
  "title": "Configurações",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "global-settings",
      "title": "Global Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "user-preferences",
      "title": "User Preferences",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "workspace-settings",
      "title": "Workspace Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "module-settings",
      "title": "Module Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "view-settings",
      "title": "View Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "search-settings",
      "title": "Search Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "notification-settings",
      "title": "Notification Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "privacy-settings",
      "title": "Privacy Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "accessibility-settings",
      "title": "Accessibility Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "output-settings",
      "title": "Output Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "offline-settings",
      "title": "Offline Settings",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "language-locale",
      "title": "Language/Locale",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "density",
      "title": "Density",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "default-view",
      "title": "Default View",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    }
  ]
};

test('família configuracoes: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
