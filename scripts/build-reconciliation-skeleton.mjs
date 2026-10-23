import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const timestamp = '2026-10-19';
const output = join(root, 'audit', 'baseline', 'v0.1.0');
const skip = new Set(['audit']);
function files(directory = root) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((item) => directory !== root || !skip.has(item.name))
    .flatMap((item) => {
      const path = join(directory, item.name);
      return item.isDirectory() ? files(path) : [path];
    });
}
const entries = files().map((path) => {
  const bytes = readFileSync(path);
  const name = relative(root, path).replaceAll('\\', '/');
  const area = name.startsWith('src/routes/') ? 'route' :
    name.startsWith('src/components/') ? 'component' :
    name.startsWith('src/lib/') ? 'library' :
    name.startsWith('src/content/') ? 'content' :
    name.startsWith('public/') ? 'public-asset' :
    name.startsWith('migrations/') ? 'migration' :
    name.startsWith('scripts/') ? 'tooling' : 'workspace';
  return {
    path: name,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    area,
    status: 'UNREVIEWED',
    destination: null,
    relatedFinds: [],
    contractId: null,
    action: 'KEEP_IN_PLACE',
  };
}).sort((a, b) => a.path.localeCompare(b.path));
const addedWorkFiles = new Set([
  'docs/AUDITORIA_BACKUP_20261019.md',
  'docs/RECONCILIATION_SKELETON_v0.1.0.md',
  'scripts/audit-static.mjs',
  'scripts/build-reconciliation-skeleton.mjs',
]);
const source = entries.filter((item) => !addedWorkFiles.has(item.path));
const manifest = {
  schemaVersion: '0.1.0',
  baselineDate: timestamp,
  source: 'user-supplied partially homologated public ecosystem backup',
  authority: 'THIS_BACKUP_ONLY',
  githubCrosswalk: 'DEFERRED_BY_OWNER',
  snapshotFileCount: source.length,
  provenance: 'unzip-verified original backup; no delete or move',
  records: source,
};
const routeRegistry = {
  schemaVersion: '0.1.0',
  mode: 'INVENTORY_ONLY',
  sourceOfTruth: 'admin-publication-registry-target',
  routeFiles: entries.filter((entry) => entry.area === 'route').map((entry) => ({ file: entry.path, templateId: null, publicationId: null, status: 'UNMAPPED' })),
};
const contractRegistry = {
  schemaVersion: '0.1.0',
  mode: 'INVENTORY_ONLY',
  contractSource: 'src/lib/template-contract.ts',
  families: ['home', 'secao', 'artigo', 'guia', 'biblioteca', 'norma', 'ferramenta', 'editorial', 'area', 'aviso', 'entrada'],
  parityPolicy: 'same family + same version => same required slots; variants explicitly declared',
  routeAssociations: 'UNVERIFIED',
};
mkdirSync(output, { recursive: true });
for (const [name, object] of [['file-register.json', manifest], ['route-register.json', routeRegistry], ['template-register.json', contractRegistry]]) {
  writeFileSync(join(output, name), JSON.stringify(object, null, 2) + '\n');
}
process.stdout.write(JSON.stringify({ baseline: 'v0.1.0', snapshotFiles: source.length, routeFiles: routeRegistry.routeFiles.length, sha256: createHash('sha256').update(JSON.stringify(source)).digest('hex') }) + '\n');
