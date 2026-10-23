#!/usr/bin/env node
/**
 * Runner da suíte de testes.
 *
 * Existia um bug aqui: o script de `npm test` encadeava as duas metades com
 * `&&`. A primeira metade (os testes em scripts/) termina com 17 falhas
 * pré-existentes, então o `&&` cortava a execução e a segunda metade — que é
 * onde ficam os testes do motor clínico — nunca rodava. O projeto acreditava
 * não ter teste de motor porque o encadeamento o pulava em silêncio.
 *
 * Aqui as duas metades rodam SEMPRE, e o código de saída é 1 se qualquer uma
 * falhar. Nenhum resultado é engolido.
 */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";


/** Todo *.test.ts em src/, em ordem estavel. Sem lista manual para manter. */
function discoverTests() {
  const out = [];
  (function walk(dir) {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name === "node_modules") continue;
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".test.ts") || e.name.endsWith(".test.tsx")) out.push(p);
    }
  })("src");
  if (!out.length) throw new Error("nenhum teste encontrado em src/ — glob quebrado?");
  return out;
}

const SUITES = [
  {
    name: "scripts",
    args: ["--test", "scripts/**/*.test.mjs"],
  },
  {
    name: "src",
    args: [
      "--experimental-strip-types",
      "--import",
      "./scripts/alias-hook.mjs",
      "--test",
      // Descoberto, nao listado. A lista era manual e um teste novo ficava
      // invisivel ate alguem lembrar de editar este arquivo — exatamente o modo
      // de falha que os contratos vieram remover. O glob ja e o que a suite de
      // scripts usa; aqui nao havia motivo para ser diferente.
      ...discoverTests(),
    ],
  },
];

const tally = (out) => {
  const pick = (key) => {
    const m = out.match(new RegExp(`^# ${key} (\\d+)$`, "m"));
    return m ? Number(m[1]) : 0;
  };
  return { tests: pick("tests"), pass: pick("pass"), fail: pick("fail") };
};

let total = { tests: 0, pass: 0, fail: 0 };
let failed = false;

for (const suite of SUITES) {
  process.stdout.write(`\n=== ${suite.name} ===\n`);
  const run = spawnSync(process.execPath, suite.args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  process.stdout.write(run.stdout ?? "");
  if (run.stderr) process.stderr.write(run.stderr);
  const t = tally(run.stdout ?? "");
  total.tests += t.tests;
  total.pass += t.pass;
  total.fail += t.fail;
  process.stdout.write(`--- ${suite.name}: ${t.pass}/${t.tests} pass, ${t.fail} fail\n`);
  if (run.status !== 0) failed = true;
}

process.stdout.write(
  `\n=== TOTAL: ${total.pass}/${total.tests} pass, ${total.fail} fail ===\n` +
    `As duas metades SEMPRE rodam. Um falha nao esconde a outra.\n`,
);

process.exitCode = failed ? 1 : 0;