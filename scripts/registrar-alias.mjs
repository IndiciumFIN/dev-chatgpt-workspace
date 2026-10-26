// @ts-check
/**
 * Registra o hook de alias (`@/` → `src/`) no carregador de módulos.
 * Uso: `node --import ./scripts/registrar-alias.mjs ...`
 *
 * O hook sozinho não basta: `--import` executa o arquivo, mas quem instala a
 * resolução é `register()`. Sem este arquivo, um teste que importe `@/lib/...`
 * morre com ERR_MODULE_NOT_FOUND — e a causa parece ser do teste, não do
 * alias.
 */
import { register } from "node:module";

register(new URL("./alias-hook.mjs", import.meta.url));
