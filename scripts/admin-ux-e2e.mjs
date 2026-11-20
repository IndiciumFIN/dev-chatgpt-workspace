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
  if (errors.length) throw new Error('JavaScript errors in admin browser: ' + errors.join('; '));
  console.log('PASS ADMIN E2E: overview, module navigation, modal Escape/focus, desktop and mobile evidence.');
} finally { await browser.close(); }
