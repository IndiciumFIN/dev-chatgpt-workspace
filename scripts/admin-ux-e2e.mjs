#!/usr/bin/env node
/** True-browser preview smoke, run against a local Vite server in GitHub Actions. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base = process.env.ADMIN_E2E_BASE_URL || 'http://127.0.0.1:4173';
mkdirSync('audit-evidence/admin-ux', { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/admin`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Centro de administração' }).waitFor();
  await page.getByRole('heading', { name: 'Visão geral' }).waitFor();
  await page.screenshot({ path: 'audit-evidence/admin-ux/01-overview-desktop.png', fullPage: true });
  await page.getByRole('button', { name: /Conteúdos/ }).click();
  await page.locator('#admin-tool-title').fill('Escala de Braden · prévia de teste');
  await page.getByRole('radio', { name: 'Assinante' }).check();
  await page.getByRole('heading', { name: 'Escala de Braden · prévia de teste' }).waitFor();
  await page.screenshot({ path: 'audit-evidence/admin-ux/02-conteudos-rascunho-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Salvar rascunho' }).click();
  await page.getByRole('button', { name: /Publicação/ }).click();
  await page.getByRole('checkbox', { name: /Entendo que esta publicação/ }).check();
  await page.getByRole('button', { name: /Publicar rascunho salvo/ }).click();
  await page.getByText('Projeção LOCAL publicada.').waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Conteúdos/ }).click();
  await page.getByRole('radio', { name: 'Publicado local' }).check();
  await page.getByRole('heading', { name: 'Escala de Braden · prévia de teste' }).waitFor();
  await page.screenshot({ path: 'audit-evidence/admin-ux/03-conteudos-publicado-desktop.png', fullPage: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(`${base}/admin`, { waitUntil: 'networkidle' });
  await mobile.getByRole('heading', { name: 'Centro de administração' }).waitFor();
  await mobile.screenshot({ path: 'audit-evidence/admin-ux/04-overview-mobile.png', fullPage: true });
  if (errors.length) throw new Error('JavaScript errors in admin browser: ' + errors.join('; '));
  console.log('PASS ADMIN E2E: desktop, edição, persistência, publicação local, usuário assinante, mobile; 4 capturas.');
} finally { await browser.close(); }
