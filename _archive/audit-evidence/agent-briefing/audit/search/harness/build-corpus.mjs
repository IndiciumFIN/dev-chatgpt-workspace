// Empacota os modulos REAIS do projeto com esbuild e roda a sonda de indice.
// Nada e escrito em src/ ou scripts/: so le.
import { build } from "esbuild";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = "/workspace/project_audit/v271";
const OUT = resolve(HERE, "out");
mkdirSync(OUT, { recursive: true });

const entry = resolve(HERE, "corpus-entry.ts");
const runner = resolve(HERE, "corpus-runner.ts");
const bundle = resolve(OUT, "corpus.bundle.mjs");

await build({
  entryPoints: [runner],
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  outfile: bundle,
  alias: { "@": resolve(PROJECT, "src") },
  define: {
    "import.meta.env": JSON.stringify({ MODE: "production", DEV: false, PROD: true, SSR: false }),
    "import.meta.env.MODE": JSON.stringify("production"),
  },
  logLevel: "warning",
  external: ["react", "react-dom", "@tanstack/react-router"],
});

const mod = await import(pathToFileURL(bundle).href);
writeFileSync(resolve(OUT, "corpus.json"), JSON.stringify({ ...mod.REPORT, probe: mod.PROBE }, null, 2));
console.log("corpus.json written ->", resolve(OUT, "corpus.json"));
console.log("counts:", JSON.stringify(mod.REPORT.counts, null, 2).slice(0, 1200));
console.log("\nprobe:");
for (const p of mod.PROBE) {
  console.log(
    `  ${p.term.padEnd(12)} findByQuery=${JSON.stringify(p.findByQuery)}  fallbackCount=${p.fallbackCount} -> ${p.fallbackMatches.map((m) => m.title).join(" | ")}`,
  );
}
void entry;