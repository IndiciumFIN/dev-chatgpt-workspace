// Registra o resolver de alias `@/*` → `src/*` para o runner de testes do Node.
import { register } from "node:module";
register("./alias-resolver.mjs", import.meta.url);
