#!/usr/bin/env node
/** Real browser evidence only. Never substitutes generated/mock images for screenshots. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.env.CDE_VISUAL_ORIGIN ?? 'http://127.0.0.1:8080';
const url = new URL(target);
if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.protocol !== 'http:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  console.error('BLOCK: visual testing must target a local HTTP origin only');
  process.exit(2);
}
const out = path.join(root, 'audit', 'visual', 'current');
const targets = [
  { id: 'public', pathname: '/' },
  { id: 'admin', pathname: '/admin' },
  { id: 'subscriber', pathname: '/assinante' },
];
const viewports = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'tablet', width: 834, height: 1112 },
  { id: 'mobile', width: 390, height: 844 },
];
const result = { schemaVersion: 2, timestamp: new Date().toISOString(), source: 'real chromium browser', origin: url.origin, captures: [], errors: [], verdict: 'FAIL' };
await mkdir(out, { recursive: true });
let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  for (const vp of viewports) {
    for (const route of targets) {
      const page = await context.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const pathname = `${route.id}-${vp.id}.png`;
      try {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const runtimeErrors = [];
        const consoleErrors = [];
        page.on('pageerror', e => runtimeErrors.push(String(e)));
        page.on('console', message => {
          if (message.type() === 'error') consoleErrors.push(message.text());
        });
        const response = await page.goto(new URL(route.pathname, url.origin).href, { waitUntil: 'networkidle', timeout: 20000 });
        if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
        const rendered = await page.evaluate(() => ({
          title: document.title,
          textLength: (document.body?.innerText ?? '').trim().length,
          visibleElements: [...document.querySelectorAll('main, h1, h2, [role=main]')].filter(el => { const r=el.getBoundingClientRect(); const css=getComputedStyle(el); return r.width > 0 && r.height > 0 && css.visibility !== 'hidden' && css.display !== 'none'; }).length,
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        }));
        if (rendered.textLength < 20 || rendered.visibleElements < 1) throw new Error(`EMPTY_OR_UNVERIFIED_RENDER ${JSON.stringify(rendered)}`);
        if (runtimeErrors.length) throw new Error(`RUNTIME_ERRORS ${JSON.stringify(runtimeErrors)}`);
        if (consoleErrors.length) throw new Error(`CONSOLE_ERRORS ${JSON.stringify(consoleErrors)}`);
        if (rendered.horizontalOverflow) throw new Error(`HORIZONTAL_OVERFLOW ${JSON.stringify(rendered)}`);
        await page.screenshot({ path: path.join(out, pathname), fullPage: true, animations: 'disabled' });
        const bytes = await readFile(path.join(out, pathname));
        result.captures.push({ route: route.pathname, viewport: vp, file: pathname, status: response.status(), rendered, runtimeErrors, consoleErrors, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      } catch (e) {
        result.errors.push({ route: route.pathname, viewport: vp.id, error: String(e) });
      } finally { await page.close(); }
    }
  }
  await context.close();
} catch (e) {
  result.errors.push({ stage: 'browser startup', error: String(e) });
} finally {
  if (browser) await browser.close();
  result.verdict = result.captures.length === targets.length * viewports.length && result.errors.length === 0 ? 'CAPTURED_REVIEW_REQUIRED' : 'FAIL';
  await writeFile(path.join(out, 'evidence.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, captures: result.captures.length, expected: 9, errors: result.errors.length, report: path.relative(root, path.join(out, 'evidence.json')) }));
}
if (result.verdict === 'FAIL') process.exitCode = 1;
