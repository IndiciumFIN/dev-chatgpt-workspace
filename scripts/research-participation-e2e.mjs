#!/usr/bin/env node
import { chromium } from "playwright";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const base = process.env.RESEARCH_E2E_BASE_URL || "http://127.0.0.1:4173";
const out = "audit-evidence/research-participation";
mkdirSync(out, { recursive: true });

const evidence = {
  schemaVersion: "1.0.0",
  candidate: "WO-RES-PART-001",
  origin: base,
  runAt: new Date().toISOString(),
  verdict: "FAIL",
  checks: [],
  captures: [],
  runtimeErrors: [],
};

function check(id, ok, detail = "") {
  evidence.checks.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} RESEARCH E2E: ${id}${detail ? ` — ${detail}` : ""}`);
  if (!ok) throw new Error(`${id}: ${detail || "failed"}`);
}

async function capture(page, name) {
  const file = `${out}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
  const bytes = readFileSync(file);
  evidence.captures.push({
    file,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
  });
}

async function assertNoHorizontalOverflow(page, id) {
  const state = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  check(id, state.scrollWidth <= state.innerWidth + 2, JSON.stringify(state));
}

async function assertInteractiveAccessibility(page) {
  const issues = await page.locator(".ce-research input,.ce-research select,.ce-research textarea,.ce-research button").evaluateAll((els) =>
    els.filter((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (el instanceof HTMLButtonElement) return !(el.textContent || "").trim() && !el.getAttribute("aria-label");
      const labels = "labels" in el ? el.labels : null;
      return !labels?.length && !el.getAttribute("aria-label");
    }).map((el) => el.outerHTML.slice(0, 180)),
  );
  check("interactive-controls-have-accessible-name", issues.length === 0, issues.join(" | "));
  const undersized = await page.locator(".ce-research-nav button,.ce-research-btn").evaluateAll((els) =>
    els.filter((el) => el.getBoundingClientRect().height < 44).map((el) => ({
      text: (el.textContent || "").trim().slice(0, 50),
      height: Math.round(el.getBoundingClientRect().height),
    })),
  );
  check("primary-targets-min-44px", undersized.length === 0, JSON.stringify(undersized));
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  page.on("pageerror", (error) => evidence.runtimeErrors.push({ viewport: "desktop", error: error.message }));

  await page.goto(`${base}/secao/pesquisa`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Research Hub", level: 1 }).waitFor();
  check("candidate-route-renders", true);

  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  check("candidate-route-noindex", robots === "noindex, nofollow", String(robots));

  await assertNoHorizontalOverflow(page, "desktop-no-horizontal-overflow");
  await assertInteractiveAccessibility(page);
  await capture(page, "00-overview-1440");

  await page.getByRole("button", { name: /Studio de pesquisa/ }).click();
  await page.getByLabel("Título do projeto").fill("Pesquisa candidata sobre participação e experiência de enfermagem");
  await page.getByLabel("Pergunta de pesquisa").fill("Como participantes descrevem prioridades para melhorar transparência, escuta e devolutiva?");
  await page.getByLabel("Objetivo").fill("Testar a jornada candidata e sua governança sem promover conclusão oficial.");
  await page.getByLabel("Desenho").fill("método misto candidato");
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Studio de pesquisa/ }).click();
  check(
    "studio-draft-persists-local",
    (await page.getByLabel("Título do projeto").inputValue()).startsWith("Pesquisa candidata"),
  );

  await page.getByRole("button", { name: /Escuta cidadã/ }).click();
  await page.getByLabel("Local da experiência").selectOption({ label: "Hospital público" });
  await page.getByLabel(/Comentário opcional/).fill("Meu contato é teste@example.com para retorno.");
  await page.getByRole("button", { name: "Enviar ao laboratório candidato" }).click();
  await page.getByText("Não inclua e-mail, CPF ou telefone.").waitFor();
  check("direct-identifier-rejected-in-real-flow", true);

  await page.getByLabel(/Comentário opcional/).fill("A comunicação sobre canais de participação poderia ser mais simples e rastreável.");
  await page.getByLabel("Segurança do paciente").check();
  await page.getByRole("button", { name: "Enviar ao laboratório candidato" }).click();
  await page.getByText("Contribuição recebida no candidato local.").waitFor();
  check("citizen-pulse-submitted", true);

  await page.getByRole("button", { name: /Propostas e cocriação/ }).click();
  await page.getByLabel("Título").fill("Devolutiva rastreável para cada ciclo");
  await page.getByLabel("Problema").fill("Participantes podem não saber se uma contribuição foi apenas recebida, analisada ou encaminhada.");
  await page.getByLabel("Proposta").fill("Exibir uma linha de devolutiva com estados candidatos e exigir evidência antes de qualquer estado oficial.");
  await page.getByRole("button", { name: "Propor" }).click();
  await page.getByText("Proposta recebida.").waitFor();
  await page.getByRole("button", { name: /^Apoio 0$/ }).first().click();
  await page.getByRole("button", { name: /^Apoio 1$/ }).first().waitFor();
  check("proposal-and-reaction-flow", true);
  await capture(page, "01-proposals-1440");

  await page.getByRole("button", { name: /Consenso/ }).click();
  await page.getByRole("button", { name: /^Concordo · 0$/ }).first().click();
  await page.getByRole("button", { name: /^Concordo · 1$/ }).first().waitFor();
  check("consensus-flow", true);

  await page.getByRole("button", { name: /Visão geral/ }).click();
  await page.getByText("1", { exact: true }).first().waitFor();
  await capture(page, "02-overview-after-flow-1440");

  await page.keyboard.press("Tab");
  const tag = await page.evaluate(() => document.activeElement?.tagName);
  check("keyboard-focus-enters-interactive-control", ["A","BUTTON","INPUT","SELECT","TEXTAREA"].includes(tag || ""), String(tag));

  for (const vp of [
    { id: "1024", width: 1024, height: 900 },
    { id: "768", width: 768, height: 1024 },
    { id: "360", width: 360, height: 800 },
  ]) {
    const p = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
    p.on("pageerror", (error) => evidence.runtimeErrors.push({ viewport: vp.id, error: error.message }));
    await p.goto(`${base}/secao/pesquisa#participacao`, { waitUntil: "networkidle" });
    await p.getByRole("heading", { name: "Research Hub", level: 1 }).waitFor();
    await assertNoHorizontalOverflow(p, `${vp.id}-no-horizontal-overflow`);
    await capture(p, `03-participation-${vp.id}`);
    await p.close();
  }

  check("no-browser-runtime-errors", evidence.runtimeErrors.length === 0, JSON.stringify(evidence.runtimeErrors));
  evidence.verdict = "PASS";
  console.log("PASS RESEARCH E2E: journeys, negative validation, local draft, participation, proposal, consensus, keyboard, 360/768/1024/1440.");
} catch (error) {
  evidence.failure = String(error?.stack || error);
  console.error(evidence.failure);
  process.exitCode = 1;
} finally {
  writeFileSync(`${out}/evidence.json`, JSON.stringify(evidence, null, 2) + "\n");
  await browser.close();
}
