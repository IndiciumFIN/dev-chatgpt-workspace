#!/usr/bin/env node
// Gerador determinístico do esqueleto CE (Experience Platform + catálogo de serviços).
// Regra: o CATÁLOGO é a verdade. O código gerado é sempre CANDIDATE_HOLD — nunca PASS.
// Usage: node scripts/generate-skeleton.mjs [--check]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'catalog/service-catalog.v1.json'), 'utf8'));
const registry = JSON.parse(readFileSync(resolve(ROOT, 'catalog/capability-registry.candidate.v0.1.json'), 'utf8'));

const banner = `// Gerado por scripts/generate-skeleton.mjs a partir de catalog/service-catalog.v1.json.
// NÃO EDITAR À MÃO — edita o catálogo e regenera.
// Fonte: ${catalog.authority.value} · ${catalog.status} · nenhuma autorização de execução.
`;

const files = new Map();
const put = (p, content) => files.set(p, content);

for (const family of catalog.families) {
  for (const service of family.services) {
    const base = `src/families/${family.id}/${service.id}`;
    put(`${base}/contract.ts`, `${banner}
export type ServiceStatus = 'CANDIDATE_HOLD' | 'ADMITTED' | 'RETIRED';

/** Contrato lógico de ${service.title} (família ${family.title}, camada ${family.layer}). */
export interface ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract {
  readonly serviceId: '${family.id}.${service.id}';
  readonly title: string;
  readonly layer: '${family.layer}';
  readonly status: ServiceStatus;
  /** Evidência de execução. null enquanto não existir run com hash, data e registo. */
  readonly evidence: string | null;
}

export const ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract = {
  serviceId: '${family.id}.${service.id}',
  title: '${service.title.replace(/'/g, "\\'")}',
  layer: '${family.layer}',
  status: 'CANDIDATE_HOLD',
  evidence: null,
} as const;
`);
    put(`${base}/index.ts`, `${banner}
import { ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract } from './contract';

/**
 * ${service.title} — esqueleto declarado, NÃO implementado.
 * Qualquer chamada tem de falhar de forma explícita até existir admissão + evidência.
 */
export function ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}(): typeof ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract {
  if (${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract.status !== 'ADMITTED') {
    throw new Error('NOT_IMPLEMENTED_CANDIDATE_HOLD: ${family.id}.${service.id} — requer admissão (WO/OPA/Kernel) e evidência.');
  }
  return ${service.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Contract;
}
`);
  }
  put(`src/families/${family.id}/${family.id}.test.ts`, `${banner}
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const family = ${JSON.stringify(family, null, 2)};

test('família ${family.id}: todos os serviços existem e estão em HOLD sem evidência', () => {
  assert.ok(family.services.length > 0);
  for (const service of family.services) {
    assert.equal(service.status, 'CANDIDATE_HOLD', service.id);
    const path = new URL(\`./\${service.id}/contract.ts\`, import.meta.url);
    const source = readFileSync(path, 'utf8');
    assert.match(source, /status: 'CANDIDATE_HOLD'/);
    assert.match(source, /evidence: null/);
  }
});
`);
}

for (const familyId of registry.families) {
  const caps = registry.capabilities.filter((c) => c.family === familyId);
  put(`src/capabilities/${familyId.toLowerCase().replace(/_/g, '-')}.ts`, `${banner}
export type CapabilityDeclaration = {
  readonly capabilityId: string;
  readonly name: string;
  readonly family: string;
  readonly status: 'CANDIDATE';
  readonly kind: string;
  readonly guestSupport: string;
  readonly authenticatedSupport: string;
  readonly accessibilityContract: string;
  readonly telemetryContract: string;
};

/** ${caps.length} capabilities declaradas na família ${familyId}. Fonte: registo candidato da PR #21. */
export const ${familyId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CAPABILITIES: readonly CapabilityDeclaration[] = ${JSON.stringify(
    caps.map((c) => ({
      capabilityId: c.capability_id,
      name: c.name,
      family: c.family,
      status: 'CANDIDATE',
      kind: c.kind,
      guestSupport: c.guest_support,
      authenticatedSupport: c.authenticated_support,
      accessibilityContract: c.accessibility_contract,
      telemetryContract: c.telemetry_contract,
    })),
    null,
    2,
  )};
`);
  put(`src/capabilities/${familyId.toLowerCase().replace(/_/g, '-')}.test.ts`, `${banner}
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ${familyId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CAPABILITIES } from './${familyId.toLowerCase().replace(/_/g, '-')}.ts';

test('família de capabilities ${familyId}: declaradas, CANDIDATE, com contrato de acessibilidade e telemetria', () => {
  assert.ok(${familyId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CAPABILITIES.length > 0);
  for (const cap of ${familyId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CAPABILITIES) {
    assert.equal(cap.status, 'CANDIDATE');
    assert.equal(cap.accessibilityContract, 'REQUIRED');
    assert.equal(cap.telemetryContract, 'REQUIRED');
  }
});
`);
}

let written = 0;
let unchanged = 0;
for (const [rel, content] of files) {
  const abs = resolve(ROOT, rel);
  if (checkOnly) {
    if (!existsSync(abs) || readFileSync(abs, 'utf8') !== content) {
      console.error(`DRIFT: ${rel} ausente ou diferente do gerado.`);
      process.exitCode = 1;
    }
    continue;
  }
  mkdirSync(dirname(abs), { recursive: true });
  if (existsSync(abs) && readFileSync(abs, 'utf8') === content) { unchanged++; continue; }
  writeFileSync(abs, content, 'utf8');
  written++;
}

const familyCount = catalog.families.length;
const serviceCount = catalog.families.reduce((n, f) => n + f.services.length, 0);
if (!checkOnly) {
  console.log(`esqueleto CE: ${familyCount} famílias · ${serviceCount} serviços · ${registry.capabilities.length} capabilities`);
  console.log(`ficheiros escritos: ${written} · inalterados: ${unchanged}`);
} else {
  console.log(process.exitCode ? 'DRIFT DETECTADO' : 'esqueleto CE: sem drift');
}
