import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const routeDir = join(root, 'src/routes');
const files = readdirSync(routeDir).filter((name) => name.endsWith('.tsx'));
const snippets = new Map(files.map((name) => [name, readFileSync(join(routeDir, name), 'utf8')]));
const routeDefs = [...snippets].map(([file, content]) => ({ file, route: content.match(/createFileRoute\(\s*['"]([^'"]+)['"]\s*\)/)?.[1] ?? null }));
const routeSet = new Set(routeDefs.map((r) => r.route).filter(Boolean));
const links = [];
for (const [name, content] of snippets) {
  for (const match of content.matchAll(/<Link\s+to="([^"]+)"/g)) links.push({ source: name, to: match[1] });
}
const missing = links.filter((link) => !routeSet.has(link.to) && !['/', '/ferramentas/$slug', '/secao/$slug', '/modelos/$id'].includes(link.to));
const contractSource = readFileSync(join(root, 'src/lib/template-contract.ts'), 'utf8');
const familyNames = [...contractSource.matchAll(/^\s{2}([a-z]+): \{ hero:/gm)].map((m) => m[1]);
const unassigned = routeDefs.filter((r) => r.route && !['/institucional', '/modelos', '/assinante', '/admin', '/conta', '/login', '/pacote', '/sistema', '/sessao', '/'].includes(r.route)).map((r) => ({ ...r, templateBindingStatus: 'NOT_VERIFIED' }));
const report = {
  source: 'backup-only',
  status: 'PARTIAL_STATIC_ANALYSIS',
  routes: routeDefs.length,
  literalLinks: links.length,
  unresolvedLiteralLinks: missing,
  templateFamilies: familyNames,
  routeTemplateAssignments: unassigned,
  note: 'Dynamic destinations, CMS/localStorage routes, scroll hash anchors, redirects and runtime rendering require separate tests.',
};
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
if (missing.length) process.exitCode = 1;
