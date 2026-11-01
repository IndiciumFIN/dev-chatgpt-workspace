// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: PROPOSED · CANDIDATE_HOLD · nenhuma autorização de execução.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = {
  "id": "outputs",
  "title": "Outputs",
  "layer": "DOMAIN",
  "status": "CANDIDATE_HOLD",
  "classification_source": "derived_from_owner_blueprint",
  "services": [
    {
      "id": "html",
      "title": "HTML",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "pdf",
      "title": "PDF",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "print",
      "title": "Print",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "docx",
      "title": "DOCX",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "pptx",
      "title": "PPTX",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "xlsx",
      "title": "XLSX",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "csv",
      "title": "CSV",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "json",
      "title": "JSON",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "markdown",
      "title": "Markdown",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "image",
      "title": "Image",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "clipboard",
      "title": "Clipboard",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "qr",
      "title": "QR",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "email",
      "title": "Email",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "social",
      "title": "Social",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "api-payload",
      "title": "API payload",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    },
    {
      "id": "offline-package",
      "title": "Offline Package",
      "status": "CANDIDATE_HOLD",
      "kind": "EXPERIENCE_CAPABILITY_GROUP"
    }
  ]
};

test('família outputs: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(`./${service.id}/contract.ts`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
