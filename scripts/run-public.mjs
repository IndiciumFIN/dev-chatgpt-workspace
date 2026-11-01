import { register } from "node:module";

register(new URL("./alias-hook.mjs", import.meta.url));
await import("./seed-public.mjs");
