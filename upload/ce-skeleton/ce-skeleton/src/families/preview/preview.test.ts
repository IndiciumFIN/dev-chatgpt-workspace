// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "preview",
  "title": "Preview",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "quick-preview",
      "title": "Quick Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "detail-preview",
      "title": "Detail Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "drawer-preview",
      "title": "Drawer Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "modal-preview",
      "title": "Modal Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "source-preview",
      "title": "Source Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "reference-preview",
      "title": "Reference Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "asset-preview",
      "title": "Asset Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "document-preview",
      "title": "Document Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "output-preview",
      "title": "Output Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "print-preview",
      "title": "Print Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "responsive-preview",
      "title": "Responsive Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "diff-preview",
      "title": "Diff Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "version-preview",
      "title": "Version Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "before-after-preview",
      "title": "Before/After Preview",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    }
  ]
};

test('família preview: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
