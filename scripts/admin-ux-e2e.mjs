#!/usr/bin/env node
/**
 * NCOS admin UX E2E. /admin mounts AdminDesk (connected source);
 * /oficina-local mounts AdminConsole (isolated local preview).
 * Never substitute the local preview as evidence of source/database readiness.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
const base = process.env.ADMIN_E2E_BASE_URL || "http://127.0.0.1:4173";
mkdirSync("audit-evidence/admin-ux", { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
const observe = (page, area) => page.on("pageerror", e => errors.push(area + ": " + e.message));

try {
  // Connected admin. A header/navigation smoke test is NOT a database check.
  const source = await browser.newPage({
    viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce",
  });
  observe(source, "connected-admin");
  await source.goto(base + "/admin", { waitUntil: "domcontentloaded" });
  await source.getByRole("heading", { name: "Visão geral", exact: true }).waitFor({ timeout: 60000 });
  const connectedNav = source.locator("aside.admin-side nav.admin-tree");
  await connectedNav.getByRole("button", { name: "Produtos e ferramentas", exact: true }).click();
  console.log("ADMIN_CONNECTED_DEBUG", JSON.stringify({
    url: source.url(),
    headings: (await source.locator("h1,h2").allTextContents()).slice(0,20),
    status: (await source.locator(".admin-main .err").allTextContents()).slice(0,3),
    uncaught: errors.slice(0,3),
  }));
  await source.getByRole("heading", { name: "Produtos e ferramentas", exact: true }).waitFor();
  const state = await source.locator(".admin-main").innerText();
  if (/Lendo o banco|erro|falha de banco|database disabled/i.test(state)) {
    console.warn("HOLD_ADMIN_DB: admin navigation rendered; data readiness must pass separate isolation/database gate.");
  }
  await source.screenshot({ path: "audit-evidence/admin-ux/00-admin-connected-desktop.png", fullPage: true });

  // New local-only console: separate route and independent visual assertions.
  const preview = await browser.newPage({
    viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce",
  });
  observe(preview, "local-preview");
  await preview.goto(base + "/oficina-local", { waitUntil: "domcontentloaded" });
  await preview.getByRole("heading", { name: "Centro de administração" }).waitFor({ timeout: 60000 });
  const desktopNav = preview.getByRole("navigation", { name: "Módulos da administração", exact: true });
  await desktopNav.getByRole("button", { name: "Visão geral" }).click();
  await preview.locator(".ce-admin-toolbar h2").getByText("Visão geral", { exact: true }).waitFor();
  await desktopNav.locator('[data-admin-group="G04"] button.ce-admin-tree-group-button').click();
  await desktopNav.locator('button[data-admin-module="M08"]').click();
  await preview.locator(".ce-admin-toolbar h2").getByText("Conteúdos", { exact: true }).waitFor();
  await preview.getByRole("heading", { name: "Catálogo de instrumentos" }).waitFor();
  await preview.screenshot({ path: "audit-evidence/admin-ux/01-oficina-desktop.png", fullPage: true });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2, reducedMotion: "reduce",
  });
  observe(mobile, "local-mobile");
  await mobile.goto(base + "/oficina-local", { waitUntil: "domcontentloaded" });
  await mobile.getByRole("heading", { name: "Centro de administração" }).waitFor({ timeout: 60000 });
  await mobile.locator("button.ce-admin-mobile-launch").click();
  const dialog = mobile.getByRole("dialog", { name: "Acesso rápido da administração" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Visão geral" }).click();
  await mobile.locator(".ce-admin-toolbar h2").getByText("Visão geral", { exact: true }).waitFor();
  await mobile.locator("button.ce-admin-mobile-launch").click();
  await dialog.waitFor();
  await dialog.locator('[data-admin-group="G04"] button.ce-admin-tree-group-button').click();
  await dialog.locator('button[data-admin-module="M08"]').click();
  await mobile.locator(".ce-admin-toolbar h2").getByText("Conteúdos", { exact: true }).waitFor();
  await mobile.getByRole("heading", { name: "Catálogo de instrumentos" }).waitFor();
  await mobile.screenshot({ path: "audit-evidence/admin-ux/02-oficina-mobile.png", fullPage: true });

  assert.deepEqual(errors, [], "Uncaught errors in admin browser");
  console.log("PASS_ADMIN_NAV: /admin desktop; /oficina-local desktop and mobile.");
  console.log("NOT_VERIFIED_ADMIN_DB: integration and persistence require the isolation and RLS/RBAC gates.");
} finally {
  await browser.close();
}
