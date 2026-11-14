#!/usr/bin/env node
/**
 * Admin E2E for the canonical seven-group sidebar and 22-module hierarchy.
 * Exercises real desktop/mobile navigation, not the retired mod-card layout.
 * Only reads/opens the local UI; no remote administrative mutation or deploy.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";

const base = process.env.ADMIN_E2E_BASE_URL || "http://127.0.0.1:4173";
mkdirSync("audit-evidence/admin-ux", { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function assertHeading(page, expected) {
  const heading = page.locator(".ce-admin-toolbar h2");
  await heading.waitFor({ timeout: 60000 });
  assert.equal((await heading.textContent())?.trim(), expected);
}

try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  desktop.on("pageerror", (error) => errors.push("desktop: " + error.message));
  await desktop.goto(base + "/admin", { waitUntil: "domcontentloaded" });
  await desktop.getByRole("heading", { name: "Centro de administração" }).waitFor({ timeout: 60000 });
  const desktopNav = desktop.getByRole("navigation", { name: "Módulos da administração" });
  await desktopNav.getByRole("button", { name: "Visão geral" }).click();
  await assertHeading(desktop, "Visão geral");
  await desktop.screenshot({ path: "audit-evidence/admin-ux/00-visao-desktop.png", fullPage: true });

  await desktopNav.locator('[data-admin-group="G04"] button.ce-admin-tree-group-button').click();
  await desktopNav.locator('button[data-admin-module="M08"]').click();
  await assertHeading(desktop, "Conteúdos");
  await desktop.getByRole("heading", { name: "Catálogo de instrumentos" }).waitFor();
  await desktop.screenshot({ path: "audit-evidence/admin-ux/00b-instrumentos-desktop.png", fullPage: true });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  mobile.on("pageerror", (error) => errors.push("mobile: " + error.message));
  await mobile.goto(base + "/admin", { waitUntil: "domcontentloaded" });
  await mobile.getByRole("heading", { name: "Centro de administração" }).waitFor({ timeout: 60000 });
  await mobile.locator("button.ce-admin-mobile-launch").click();
  let dialog = mobile.getByRole("dialog", { name: "Acesso rápido da administração" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Visão geral" }).click();
  await assertHeading(mobile, "Visão geral");
  await mobile.screenshot({ path: "audit-evidence/admin-ux/01-visao-mobile.png", fullPage: true });

  await mobile.locator("button.ce-admin-mobile-launch").click();
  dialog = mobile.getByRole("dialog", { name: "Acesso rápido da administração" });
  await dialog.waitFor();
  await dialog.locator('[data-admin-group="G04"] button.ce-admin-tree-group-button').click();
  await dialog.locator('button[data-admin-module="M08"]').click();
  await assertHeading(mobile, "Conteúdos");
  await mobile.getByRole("heading", { name: "Catálogo de instrumentos" }).waitFor();
  await mobile.screenshot({ path: "audit-evidence/admin-ux/01b-instrumentos-mobile.png", fullPage: true });

  assert.deepEqual(errors, [], "Admin browser must have no uncaught errors");
  console.log("PASS ADMIN E2E: overview + M08 via real sidebar on desktop and mobile.");
} finally {
  await browser.close();
}
