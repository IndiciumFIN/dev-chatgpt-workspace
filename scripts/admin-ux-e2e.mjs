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
  await page.locator('button.mod-card', { hasText: 'Produtos e ferramentas' }).click();
  await page.getByRole('heading', { name: 'Produtos e ferramentas' }).waitFor({ timeout: 60000 });
  await page.screenshot({ path: 'audit-evidence/admin-ux/00-visao-desktop.png', fullPage: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
  await mobile.getByRole('heading', { name: 'Visão geral' }).waitFor({ timeout: 60000 });
  await mobile.screenshot({ path: 'audit-evidence/admin-ux/01-visao-mobile.png', fullPage: true });
  if (errors.length) throw new Error('JavaScript errors in admin browser: ' + errors.join('; '));
  console.log('PASS ADMIN E2E: visão geral no desktop e no mobile.');
} finally { await browser.close(); }
