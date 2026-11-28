#!/usr/bin/env node
/** Confere a mesa que /admin abre hoje. Não procura a tela antiga. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base = process.env.ADMIN_E2E_BASE_URL || 'http://127.0.0.1:4173';
mkdirSync('audit-evidence/admin-ux', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Visão geral' }).waitFor({ timeout: 60000 });
  // Fail closed with a screenshot and useful page diagnostics rather than an
  // opaque locator.click 30-second timeout. Do not fake logged-in admin state.
  const card = page.locator('button.mod-card', { hasText: 'Produtos e ferramentas' });
  try {
    await card.waitFor({ state: 'visible', timeout: 20000 });
  } catch (error) {
    await page.screenshot({ path: 'audit-evidence/admin-ux/98-admin-loading-failure.png', fullPage: true });
    const detail = await page.locator('.admin-main').innerText().catch(() => 'admin-main not rendered');
    console.error('ADMIN_E2E_BLOCKED: expected module was not visible; rendered admin text:', detail.slice(0, 2400));
    console.error('ADMIN_E2E_JS_ERRORS:', errors.join('; ').slice(0, 1200));
    throw error;
  }
  // Persist the overview and actual selected module as independent evidence.
  await page.screenshot({ path: 'audit-evidence/admin-ux/00-visao-geral-desktop.png', fullPage: true });
  await card.click();
  await page.getByRole('heading', { name: 'Produtos e ferramentas' }).waitFor({ timeout: 60000 });
  await page.screenshot({ path: 'audit-evidence/admin-ux/00-visao-desktop.png', fullPage: true });
  if (await page.locator('.admin-main .err').count()) {
    throw new Error('ADMIN_E2E_DESKTOP_ERROR: ' + (await page.locator('.admin-main .err').innerText()));
  }
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
  await mobile.getByRole('heading', { name: 'Visão geral' }).waitFor({ timeout: 60000 });
  await mobile.locator('button.mod-card', { hasText: 'Produtos e ferramentas' }).waitFor({ state: 'attached', timeout: 20000 });
  await mobile.screenshot({ path: 'audit-evidence/admin-ux/01-visao-mobile.png', fullPage: true });
  const launcher = mobile.locator('button.admin-launch');
  await launcher.waitFor({ state: 'visible', timeout: 5000 });
  await launcher.click();
  const dialog = mobile.locator('dialog.admin-dialog');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  await mobile.screenshot({ path: 'audit-evidence/admin-ux/02-menu-mobile.png', fullPage: true });
  await dialog.locator('button.admin-tree-item', { hasText: 'Produtos e ferramentas' }).click();
  await mobile.getByRole('heading', { name: 'Produtos e ferramentas' }).waitFor({ timeout: 20000 });
  if (await dialog.isVisible()) throw new Error('ADMIN_E2E_MOBILE_DIALOG_NOT_CLOSED_AFTER_SELECTION');
  await mobile.screenshot({ path: 'audit-evidence/admin-ux/03-modulo-mobile.png', fullPage: true });
  await launcher.click();
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  await mobile.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  const focusReturned = await launcher.evaluate((el) => document.activeElement === el);
  if (!focusReturned) throw new Error('ADMIN_E2E_MOBILE_FOCUS_DID_NOT_RETURN_TO_MENU_TRIGGER');
  if (await mobile.locator('.admin-main .err').count()) {
    throw new Error('ADMIN_E2E_MOBILE_ERROR: ' + (await mobile.locator('.admin-main .err').innerText()));
  }
  // Confere o Builder na rota administrativa ATIVA, não somente em /oficina-local.
  await mobile.locator('button.admin-launch').click();
  await dialog.waitFor({state:'visible',timeout:5000});
  await dialog.locator('button.admin-tree-item',{hasText:'Design system e interfaces'}).click();
  await mobile.getByRole('heading',{name:'Design system e interfaces'}).waitFor({timeout:20000});
  await mobile.locator('.admin-tabs button',{hasText:'Builder'}).click();
  const builder=mobile.locator('section.ce-admin-tbuilder[aria-label="Builder visual por templates"]');
  await builder.waitFor({state:'visible',timeout:10000});
  await builder.locator('.ce-admin-tbuilder__fields input').nth(1).fill('Teste de prévia local');
  await builder.locator('.ce-admin-tbuilder__actions button').first().click();
  await builder.locator('[role="status"]').filter({hasText:'Rascunho salvo somente neste navegador.'}).waitFor({timeout:7000});
  if(await builder.getByText('Publicação bloqueada').count()!==1) throw new Error('BUILDER_PUBLICATION_GUARD_MISSING');
  if(await mobile.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)) throw new Error('BUILDER_MOBILE_HORIZONTAL_OVERFLOW');
  await mobile.screenshot({path:'audit-evidence/admin-ux/04-builder-mobile.png',fullPage:true});
  if (errors.length) throw new Error('JavaScript errors in admin browser: ' + errors.join('; '));
  console.log('PASS ADMIN E2E: overview, module navigation, modal Escape/focus, desktop and mobile evidence.');
} finally { await browser.close(); }
