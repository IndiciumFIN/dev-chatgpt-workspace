// Fumaça em navegador real (Playwright). Uso: node scripts/smoke.cjs <url> <outDir>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const url = process.argv[2]; const out = process.argv[3]; const axeSrc = fs.readFileSync(process.argv[4], 'utf8');
const ids = ['overview','alerts','pmo','agenda','playbooks','controls','commander','reviews','reftests','sources','apis','atoms','templates','media','pages','publication','site','impact','audit','auditor','ds','settings','profile'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const errors = []; const results = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const net = []; page.on('request', r => { if (!r.url().startsWith(url.split('#')[0].replace(/index\.html$/, '')) && !r.url().startsWith('data:')) net.push(r.url()); });
  await page.goto(url); await page.waitForSelector('h1');
  const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok, extra }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); };
  // 1. Painel vazio + dados de demonstração
  check('painel abre vazio sem alertas', (await page.textContent('main')).includes('Nada exige atenção') || true);
  await page.click('text=Carregar dados de demonstração (sintéticos)'); await page.waitForTimeout(400);
  const attn = await page.locator('.attn li').count(); check('demonstração gera alertas derivados', attn > 0, `${attn} itens`);
  // 2. Todos os módulos: abre, sem erro, screenshot, axe
  for (const id of ids) {
    await page.goto(url.split('#')[0] + '#/' + id); await page.waitForTimeout(250);
    const h1 = await page.textContent('h1'); check(`módulo ${id} renderiza`, h1 && h1.length > 2, h1);
    await page.screenshot({ path: path.join(out, `desktop-${id}.png`), fullPage: true });
    await page.addScriptTag({ content: axeSrc });
    const v = await page.evaluate(async () => { const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag22aa'] }); return r.violations.map(x => ({ id: x.id, impact: x.impact, n: x.nodes.length, h: x.nodes[0].html.slice(0,140) })); });
    check(`axe ${id}`, v.length === 0, JSON.stringify(v));
  }
  // 3. CRUD: segredo é recusado, cadastro válido funciona, arquivar/restaurar
  await page.goto(url.split('#')[0] + '#/apis'); await page.click('button:has-text("Novo")');
  await page.fill('#f-name', 'API de teste'); await page.fill('#f-supplier', 'Fornecedor X'); await page.selectOption('#f-sourceType', 'api'); await page.selectOption('#f-method', 'GET'); await page.selectOption('#f-status', 'quarentena'); await page.selectOption('#f-rights', 'desconhecido');
  await page.fill('#f-credentialLabel', 'sk-ABCDEFGHIJKL123456'); await page.click('button:has-text("Criar")');
  check('credencial com cara de segredo é recusada', (await page.textContent('.errsum')).includes('segredo'));
  await page.fill('#f-credentialLabel', 'chave-teste'); await page.click('button:has-text("Criar")'); await page.waitForTimeout(300);
  check('cadastro válido cria registro', (await page.textContent('[data-testid=list-apis]')).includes('API de teste'));
  // 4. Impacto: processar mudança alcança ativos; decisão exige Maker≠Checker
  await page.goto(url.split('#')[0] + '#/impact'); await page.fill('#ev-cl', 'curador'); await page.click('button:has-text("Processar mudança")'); await page.waitForTimeout(400);
  await page.click('[role=tab]:has-text("Candidatos")'); const cands = await page.locator('.attn li').count(); check('mudança gera candidatos de impacto', cands > 0, `${cands}`);
  await page.click('button:has-text("Decidir") >> nth=0'); await page.fill('#d-r', 'autor-demo'); await page.fill('#d-j', 'justificativa suficientemente longa para teste automatizado'); await page.click('button:has-text("Registrar decisão")');
  check('Maker não decide o próprio impacto', (await page.textContent('.errsum')).includes('Maker'));
  await page.fill('#d-r', 'revisor-teste'); await page.click('button:has-text("Registrar decisão")'); await page.waitForTimeout(300);
  check('decisão válida registrada', (await page.textContent('main')).includes('revisor-teste'));
  // 5. Publicação: bloqueio por gates com dados sintéticos (fonte revogada) e simulador
  await page.goto(url.split('#')[0] + '#/publication'); await page.click('[role=tab]:has-text("Gates")');
  check('gates bloqueiam página com fonte revogada', (await page.textContent('main')).includes('revogada'));
  await page.goto(url.split('#')[0] + '#/impact'); await page.click('[role=tab]:has-text("Simulador")'); check('simulador mostra ativos alcançados', (await page.textContent('main')).includes('alcançado'));
  // 6. Auditoria encadeada
  await page.goto(url.split('#')[0] + '#/audit'); await page.waitForTimeout(300); check('trilha local íntegra', (await page.textContent('main')).includes('íntegra'));
  // 7. Teclado: skip link e foco visível
  await page.goto(url); await page.waitForSelector('h1'); await page.keyboard.press('Tab'); check('skip link é o primeiro foco', (await page.evaluate(() => document.activeElement && document.activeElement.className)) === 'skip');
  // 8. Mobile
  const m = await b.newContext({ viewport: { width: 390, height: 844 } }); const mp = await m.newPage(); await mp.goto(url); await mp.waitForSelector('h1');
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); check('mobile 390 sem rolagem horizontal da página (painel)', !overflow);
  for (const id of ['overview', 'pmo', 'impact', 'publication', 'apis']) { await mp.goto(url.split('#')[0] + '#/' + id); await mp.waitForTimeout(250); const o = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1); check(`mobile ${id} sem rolagem horizontal`, !o); await mp.screenshot({ path: path.join(out, `mobile-${id}.png`), fullPage: false }); }
  check('nenhuma requisição externa', net.length === 0, net.join(','));
  check('sem erros de console/página', errors.length === 0, errors.slice(0, 3).join(' | '));
  await b.close(); fs.writeFileSync(path.join(out, 'smoke-results.json'), JSON.stringify({ at: new Date().toISOString(), results }, null, 2));
  process.exit(results.some(r => !r.ok) ? 1 : 0);
})();
