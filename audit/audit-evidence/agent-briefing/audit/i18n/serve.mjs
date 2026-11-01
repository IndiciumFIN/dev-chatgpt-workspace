/**
 * Servidor de medição: assets estáticos do build nitro + handler SSR.
 * Existe porque `vite preview` não sobe com o preset `vercel` ("Cannot load nitro
 * build info") e `npx srvx --static` ignora a flag nesta versão. Servir os dois
 * pela mesma porta é o que faz a página HIDRATAR — sem JS não há seletor de
 * idioma, nem `dir=rtl`, nem persistência. Medir o HTML cru seria mentira.
 *
 * NÃO escreve em src/ nem scripts/. Só lê o build.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const OUT = "/workspace/project_audit/v271/.vercel/output";
const STATIC = path.join(OUT, "static");
const ENTRY = path.join(OUT, "functions/__server.func/index.mjs");
const PORT = Number(process.env.PORT ?? 4190);

const entry = await import(`file://${ENTRY}`);
// O bundle vercel expoe `{ fetch(req, context) }`, nao uma funcao solta.
const handler = typeof entry.default === "function" ? entry.default : entry.default?.fetch?.bind(entry.default);

const TYPES = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

function tryStatic(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  if (clean.includes("..")) return null;
  let file = path.join(STATIC, clean);
  if (!file.startsWith(STATIC)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return null;
  return file;
}

const server = http.createServer(async (req, res) => {
  try {
    const file = tryStatic(req.url ?? "/");
    if (file) {
      const type = TYPES[path.extname(file)] ?? "application/octet-stream";
      const immutable = file.includes(`${path.sep}assets${path.sep}`);
      res.writeHead(200, {
        "content-type": type,
        "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
      });
      fs.createReadStream(file).pipe(res);
      return;
    }
    const host = req.headers.host ?? `127.0.0.1:${PORT}`;
    const url = new URL(req.url ?? "/", `http://${host}`);
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
    const request = new Request(url.href, {
      method: req.method,
      headers: req.headers,
      body,
      duplex: body ? "half" : undefined,
    });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    if (response.body) {
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(`audit server error: ${String(err).slice(0, 300)}`);
  }
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[i18n-audit] static=${STATIC} entry=${ENTRY} em http://127.0.0.1:${PORT}`);
});