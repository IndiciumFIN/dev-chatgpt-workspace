#!/usr/bin/env node
/**
 * CE PR32 — public browser negative scenarios against current running app.
 * Only disposable local PGlite, auth explicitly off; no production URL, credentials
 * or patient data. This is NOT a clinical/RBAC approval or an E2E admin test.
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

if (process.env.DATABASE_URL?.trim()) throw Error("REMOTE_DB_NOT_ALLOWED");
if (process.env.VITE_AUTH_ENABLED !== "false") throw Error("AUTH_OFF_TEST_ONLY");
if (process.env.CE_ADMIN_E2E_FIXTURE === "true") throw Error("ADMIN_FIXTURE_NOT_ALLOWED");
const base = new URL(process.env.CE_PR32_E2E_URL || "http://127.0.0.1:4174");
if (!["127.0.0.1", "localhost"].includes(base.hostname) || base.username || base.password) {
  throw Error("LOCALHOST_ONLY");
}
const browser = await chromium.launch({ headless: true });
const report = {
  protocol: "CE.PR32.BROWSER.NEGATIVE.v1",
  environment: "LOCAL_PGLITE_AUTH_OFF",
  routes: [],
  clinical_publication_authorized: false,
  first_admin_rbac_runtime: "NOT_TESTED",
  visual_parity: "NOT_TESTED",
  reviewer_approval: false
};
const target = (path) => new URL(path, base).href;
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const go = async (path) => {
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on("pageerror", onError);
  const response = await page.goto(target(path), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator("body").waitFor({ timeout: 15000 });
  const text = await page.locator("body").innerText();
  page.off("pageerror", onError);
  const status = response?.status() ?? 0;
  if (errors.length) throw Error(path + ": browser JS errors: " + errors.join(" / "));
  if (status >= 500 || status === 0) throw Error(path + ": HTTP " + status);
  return { status, text };
};
try {
  const login = await go("/login");
  assert.match(login.text, /A autenticação não está habilitada neste ambiente/);
  assert.equal(await page.locator(".login-panel form").count(), 0, "auth-off rendered a sign-in form");
  report.routes.push({ path: "/login", status: login.status, verdict: "AUTH_OFF_PANEL_VISIBLE" });

  // No CI admin fixture or real session: the restricted shells must not render.
  // These are local auth-off negatives, NOT proof of real-user RBAC.
  for (const path of ["/admin", "/assinante"]) {
    const attempted = await go(path);
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 20000 });
    assert.equal(await page.locator(".area-app, .admin-main").count(), 0,
      path + ": protected area exposed without an authorized user");
    report.routes.push({ path, status: attempted.status,
      verdict: "AUTH_OFF_PROTECTED_AREA_NOT_RENDERED" });
  }

  // Public editorial pages must never offer a toggle that exposes held drafts.
  const editorial = await go("/curiosidades");
  assert.equal(editorial.status, 200, "public editorial route must be available");
  assert.match(editorial.text, /Curiosidades de Enfermagem/);
  assert.doesNotMatch(editorial.text, /Processo de Enfermagem segundo a Resolução Cofen nº 736\/2024/,
    "held normative fact FF-009 rendered on a public route");
  assert.doesNotMatch(editorial.text, /Curiosidade 11 — a curar/,
    "placeholder candidate was visible on the public route");
  assert.equal(await page.getByText("Só publicados", { exact: true }).count(), 0,
    "public editorial filter can disclose CANDIDATE/HOLD");
  report.routes.push({ path: "/curiosidades", status: editorial.status,
    verdict: "PUBLIC_EDITORIAL_RELEASED_ONLY" });

  const home = await go("/kids");
  assert.match(home.text, /Status: CANDIDATE/);
  assert.match(home.text, /aguardando curadoria humana/);
  report.routes.push({ path: "/kids", status: home.status, verdict: "CANDIDATE_NOT_CLAIMED_LIVE" });

  const section = await go("/kids/historias");
  assert.match(section.text, /Seção de conteúdo da Vila do Cuidado/);
  report.routes.push({ path: "/kids/historias", status: section.status, verdict: "PLACEHOLDER_VISIBLE" });

  // A known candidate-only slug must not render the real clinical calculator.
  // 404/Not Found are accepted only when no clinical UI is present.
  for (const slug of ["aldrete", "exames-laboratoriais"]) {
    const path = "/ferramentas/" + slug;
    const result = await go(path);
    const notFound = result.status === 404 || /not found|não encontrada|não encontrado|404/i.test(result.text);
    const clinicalUI = await page.locator(".tool-page").count();
    assert.ok(notFound, path + ": candidate route is not an observable 404");
    assert.equal(clinicalUI, 0, path + ": candidate rendered a form/clinical tool");
    report.routes.push({ path, status: result.status, verdict: "CANDIDATE_NOT_PUBLISHED_IN_LOCAL_PGLITE" });
  }
  report.status = "PASS_LOCAL_NEGATIVE_BROWSER_ONLY";
  console.log("CE_PR32_BROWSER_NEGATIVE " + JSON.stringify(report));
} catch (error) {
  report.status = "FAIL";
  report.error = String(error?.message || error);
  console.error("CE_PR32_BROWSER_NEGATIVE " + JSON.stringify(report));
  process.exitCode = 1;
} finally {
  mkdirSync("audit-evidence/ce-pr32-browser", { recursive: true });
  writeFileSync("audit-evidence/ce-pr32-browser/verdict.json", JSON.stringify(report, null, 2) + "\n");
  await page.close();
  await browser.close();
}
