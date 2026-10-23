/**
 * Leitura deterministica do catalogo e da governanca em runtime.
 * Nunca aceitar regex/texto/stale dump como fonte alternativa: sem dump valido,
 * geracao e gate param com erro. Cada invocacao usa arquivo temporario isolado.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export function loadToolContracts(root = process.cwd()) {
  const dir = mkdtempSync(join(tmpdir(), "ce-tool-contracts-"));
  const dump = join(dir, "runtime.json");
  try {
    execFileSync(process.execPath, [
      "--experimental-strip-types", "--import", "./scripts/alias-hook.mjs", "-e",
      "import('./scripts/read-tool-contracts.ts').then(()=>process.exit(0)).catch(e=>{process.stderr.write(String(e));process.exit(1)})",
    ], { encoding: "utf8", cwd: root, stdio: ["ignore", "ignore", "pipe"],
      env: { ...process.env, TOOL_CONTRACTS_DUMP: dump } });
    const result = JSON.parse(readFileSync(dump, "utf8"));
    for (const key of ["tools", "fontes", "bindings", "campos", "camposContexto"]) {
      if (!Array.isArray(result?.[key])) throw new Error(`runtime sem colecao valida: ${key}`);
    }
    if (result.tools.length === 0 || result.tools.some((t) => !t || typeof t.slug !== "string" || !t.slug)) {
      throw new Error("runtime sem lista valida de ferramentas");
    }
    if (new Set(result.tools.map((t) => t.slug)).size !== result.tools.length) {
      throw new Error("slugs duplicados no catalogo runtime");
    }
    return result;
  } catch (cause) {
    throw new Error("HOLD: dump runtime de ferramentas indisponivel/invalido; abortando sem fallback", { cause });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
