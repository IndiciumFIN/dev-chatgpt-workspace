import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), 'utf8');
function walk(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const name = `${dir}/${e.name}`;
    return e.isDirectory() ? walk(name) : [name];
  });
}
const routes = walk('src/routes').filter((f) => f.endsWith('.tsx'));
const tools = [...read('src/lib/tools/catalog.ts').matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const sitemap = [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const unique = (xs) => [...new Set(xs)];
const duplicates = (xs) => unique(xs.filter((x, i) => xs.indexOf(x) !== i));
const missingTools = unique(tools.map((s) => `/ferramentas/${s}`).filter((path) => !sitemap.includes(path)));

// O sitemap tem que cobrir TUDO que `publicPaths()` declara — nao so as
// ferramentas. `public/sitemap.xml` era escrito a mao e por isso nao tinha
// `/blog/*` nem as 16 secoes institucionais: 17 URLs reais, alcancaveis e
// indexaveis, invisiveis para o buscador. O arquivo agora e gerado por
// `scripts/generate-sitemap.mjs`; este check existe para que ele nunca volte
// a divergir do codigo.
const articleSlugs = [...read('src/lib/content/articles/index.ts').matchAll(/^\s{2}"([a-z0-9-]+)":/gm)].map((m) => m[1]);
const sectionSlugs = [...read('src/lib/sections.ts').matchAll(/^\s{2}"([a-z0-9-]+)":/gm)].map((m) => m[1]);
const expectedPaths = unique([
  '/',
  ...articleSlugs.map((s) => `/blog/${s}`),
  ...sectionSlugs.map((s) => `/secao/${s}`),
  ...tools.map((s) => `/ferramentas/${s}`),
]);
const missingFromSitemap = expectedPaths.filter((path) => !sitemap.includes(path));
const source = read('src/lib/source.functions.ts');
const publicRoute = read('src/routes/ferramentas.$slug.tsx');
const subscriberRoute = read('src/routes/assinante.ferramentas.$slug.tsx');
const checks = [
  { id: 'zip-source-routes-present', pass: routes.length > 0, detail: routes.length },
  { id: 'tool-slug-uniqueness', pass: duplicates(tools).length === 0, detail: duplicates(tools) },
  { id: 'sitemap-uniqueness', pass: duplicates(sitemap).length === 0, detail: duplicates(sitemap) },
  { id: 'sitemap-covers-tools', pass: missingTools.length === 0, detail: missingTools },
  { id: 'sitemap-covers-every-public-path', pass: missingFromSitemap.length === 0, detail: missingFromSitemap },
  { id: 'no-publish-on-catalog-error', pass: !publicRoute.includes('readCatalog().catch(() => null)'), detail: 'Fail-closed on source unavailable' },
  { id: 'subscriber-no-publish-on-catalog-error', pass: !subscriberRoute.includes('readCatalog().catch(() => null)'), detail: 'Subscriber also fails closed' },
  { id: 'admin-controls-clinical-content', pass: /criteria|fields|references/.test(source.slice(source.indexOf('export const saveTool'))), detail: 'Source owns full clinical document' },
  { id: 'separated-migration-build', pass: !/"build":\s*"[^"]*db:migrate/.test(read('package.json')), detail: 'Build does not automatically mutate database' },
  { id: 'has-structured-template-contracts', pass: existsSync(join(root, 'src/lib/template-contract.ts')), detail: 'Contract declaration exists (usage not proven)' },
  { id: 'has-tool-engine-unit-tests', pass: walk('src').some((p) => /tools\/.*\.test\./.test(p)), detail: 'Clinical boundary tests exist' },
  { id: 'has-runtime-visual-evidence', pass: existsSync(join(root, 'audit-evidence/visual')), detail: 'Actual screenshots available' },
];
const result = { source: 'offline backup', files: walk('src').length + walk('public').length, routes: routes.length, tools: tools.length, sitemapUrls: sitemap.length, checks, passed: checks.filter((x) => x.pass).length, failed: checks.filter((x) => !x.pass).length };
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
if (result.failed) process.exitCode = 1;
