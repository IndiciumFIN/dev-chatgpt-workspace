#!/usr/bin/env node
/**
 * auditoria-do-diretorio.mjs — auditoria do repositório inteiro.
 *
 * O painel mede frente concluída; o medidor de pendências mede item em
 * aberto. Esta auditoria mede a SAÚDE DO DIRETÓRIO: o que está sujo, o que
 * está duplicado, o que vaza, o que está desatualizado e o que o CI não
 * cobre.
 *
 * Cada achado é um arquivo e um número. Nada é opinado.
 *
 * uso: node scripts/auditar-diretorio.mjs [--json]
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();

const achados = [];
const ok = (titulo, detalhe = "") => achados.push({ nivel: "ok", titulo, detalhe });
const aviso = (titulo, detalhe = "", onde = "") => achados.push({ nivel: "aviso", titulo, detalhe, onde });
const defeito = (titulo, detalhe = "", onde = "") => achados.push({ nivel: "defeito", titulo, detalhe, onde });

/* ------------------------------------------------------------------ *
 * 1 · Estado do git
 * ------------------------------------------------------------------ */
const sujo = git("status", "--porcelain");
if (sujo) aviso("árvore de trabalho com pendência", sujo.split("\n").length + " arquivo(s)", "git status");
else ok("árvore de trabalho limpa", "nada para commitar");

const naoPublicados = git("log", "--oneline", "origin/feat/projection-unica-f0-suite-real..HEAD");
if (naoPublicados) aviso("commits locais não publicados", naoPublicados.split("\n").length + " commit(s)", "git");
else ok("tudo publicado", "HEAD igual ao remoto");

const tamanhoGit = Math.round(
  Number(execFileSync("du", ["-sk", ".git"], { cwd: RAIZ, encoding: "utf8" }).split(/\s+/)[0]) / 1024,
);
if (tamanhoGit > 200) aviso("repositório grande", `${tamanhoGit} MB em .git`, ".git");
else ok("repositório com tamanho saudável", `${tamanhoGit} MB em .git`);

/* ------------------------------------------------------------------ *
 * 2 · Segredos
 * ------------------------------------------------------------------ */
const PADROES = [
  { nome: "token do GitHub", re: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { nome: "chave da AWS", re: /AKIA[0-9A-Z]{16}/ },
  { nome: "chave da OpenAI", re: /sk-[A-Za-z0-9]{32,}/ },
  { nome: "senha declarada", re: /(?:password|senha|secret)\s*[:=]\s*["'][^"'\s]{16,}["']/i },
];
const rastreados = git("ls-files").split("\n").filter(Boolean);
const vaza = [];
for (const arquivo of rastreados) {
  if (arquivo.startsWith("artifacts/fonte/corpus/")) continue; // conteúdo da fonte, não código
  if (/\.test\.(ts|tsx|mjs|js)$/.test(arquivo)) continue; // fixture de teste não é credencial
  let texto;
  try {
    texto = await readFile(join(RAIZ, arquivo), "utf8");
  } catch {
    continue;
  }
  for (const { nome, re } of PADROES) {
    const achado = texto.match(re);
    if (achado) vaza.push({ arquivo, nome, trecho: achado[0].slice(0, 12) + "…" });
  }
}
if (vaza.length) {
  for (const v of vaza) defeito(`segredo rastreado: ${v.nome}`, v.trecho, v.arquivo);
} else ok("nenhum segredo nos arquivos rastreados", `${rastreados.length} arquivos verificados`);

// No histórico: o token colado pelo dono no chat chegou ao histórico do git?
let historico = "";
try {
  historico = git("log", "-p", "--all", "--max-count=400");
} catch {
  historico = "";
}
const noHistorico = PADROES.map((p) => ({ nome: p.nome, achado: historico.match(p.re) })).filter((x) => x.achado);
if (noHistorico.length) {
  for (const n of noHistorico) defeito(`segredo no histórico do git: ${n.nome}`, "token precisa ser revogado", "histórico");
} else ok("nenhum segredo no histórico recente", "400 commits verificados");

/* ------------------------------------------------------------------ *
 * 3 · Higiene de código
 * ------------------------------------------------------------------ */
// A palavra "MÉTODO" contém "TODO" e, em português, "TODO" significa "tudo".
// O marcador só conta na convenção com dois-pontos: "TODO:", "FIXME:".
const MARCAS = /(?:^|[^A-Za-zÀ-ÿ])(TODO|FIXME|HACK|XXX):/g;
const marcas = [];
const consoleEmSrc = [];
const anyEmSrc = [];
const arquivosVazios = [];
const grandes = [];

const shaPorConteudo = new Map();
const duplicados = [];

for (const arquivo of rastreados) {
  const caminho = join(RAIZ, arquivo);
  const info = await stat(caminho).catch(() => null);
  if (!info || !info.isFile()) continue;
  if (info.size === 0) {
    arquivosVazios.push(arquivo);
    continue;
  }
  if (info.size > 1024 * 1024) {
    grandes.push({ arquivo, mb: Math.round(info.size / 1024 / 1024 * 10) / 10 });
  }
  if (arquivo.startsWith("artifacts/fonte/corpus/")) continue;
  if (!/\.(ts|tsx|mjs|js|sql|md)$/.test(arquivo)) continue;

  const buffer = await readFile(caminho);
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (shaPorConteudo.has(hash)) duplicados.push({ arquivo, igualA: shaPorConteudo.get(hash) });
  else shaPorConteudo.set(hash, arquivo);

  const texto = buffer.toString("utf8");
  const achadas = texto.match(MARCAS);
  if (achadas) marcas.push({ arquivo, marcas: [...new Set(achadas)] });
  if (arquivo.startsWith("src/") && /console\.(log|debug)\(/.test(texto)) consoleEmSrc.push(arquivo);
  if (arquivo.startsWith("src/") && /:\s*any\b/.test(texto)) anyEmSrc.push(arquivo);
}

if (marcas.length) aviso("marcadores de trabalho pendente no código", `${marcas.length} arquivo(s)`, marcas.map((m) => m.arquivo).join(", "));
else ok("nenhum TODO/FIXME no código", `${rastreados.length} arquivos`);
if (consoleEmSrc.length) aviso("console.log em código de aplicação", `${consoleEmSrc.length} arquivo(s)`, consoleEmSrc.join(", "));
else ok("sem console.log em src/");
if (anyEmSrc.length) aviso("tipo any em código de aplicação", `${anyEmSrc.length} arquivo(s)`, anyEmSrc.join(", "));
else ok("sem any em src/");
if (arquivosVazios.length) aviso("arquivo versionado vazio", `${arquivosVazios.length} arquivo(s)`, arquivosVazios.join(", "));
else ok("nenhum arquivo versionado vazio");
if (duplicados.length) aviso("conteúdo duplicado entre arquivos", `${duplicados.length} par(es)`, duplicados.map((d) => `${d.arquivo} = ${d.igualA}`).join("; "));
else ok("nenhum conteúdo duplicado entre arquivos versionados");
if (grandes.length) {
  const total = grandes.reduce((a, g) => a + g.mb, 0);
  aviso("arquivos grandes no repositório", `${grandes.length} arquivo(s), ${Math.round(total)} MB`, grandes.slice(0, 3).map((g) => g.arquivo).join(", "));
}

/* ------------------------------------------------------------------ *
 * 4 · Documentação que aponta para o nada
 * ------------------------------------------------------------------ */
const docsQuebrados = [];
const reservados = new Set();
try {
  const registro = await readFile(join(RAIZ, "docs/entregas/REGISTRO-DE-ESCRITA.md"), "utf8");
  const secaoReservas = registro.split("## Reservas")[1] ?? "";
  for (const m of secaoReservas.matchAll(/`([^`]+)`/g)) reservados.add(m[1].replace(/\/$/, ""));
} catch {
  // sem registro: tudo conta como quebrado
}
for (const arquivo of rastreados.filter((a) => a.endsWith(".md"))) {
  const texto = await readFile(join(RAIZ, arquivo), "utf8");
  for (const m of texto.matchAll(/`((?:src|scripts|migrations|docs|artifacts|contracts|it-book|audit-evidence|deliverables)\/[^`\s]+)`/g)) {
    let alvo = m[1].replace(/\/$/, "");
    if (alvo.includes("*") || alvo.includes("<") || alvo.includes(">")) continue; // template
    alvo = alvo.split(":")[0]; // referência "arquivo:linha"
    if (!alvo) continue;
    if (existsSync(join(RAIZ, alvo))) continue;
    // Prefixo de nome de arquivo: "migrations/0038" → "migrations/0038_processo_source.sql"
    const pasta = alvo.slice(0, alvo.lastIndexOf("/") + 1);
    const base = alvo.slice(pasta.length);
    let achouPrefixo = false;
    try {
      for (const nome of await readdir(join(RAIZ, pasta))) {
        if (nome.startsWith(base)) {
          achouPrefixo = true;
          break;
        }
      }
    } catch {
      // a pasta não existe: é um caminho quebrado de verdade
    }
    if (achouPrefixo) continue;
    if (reservados.has(alvo) || [...reservados].some((r) => r.startsWith(alvo + "/") || alvo.startsWith(r + "/"))) continue;
    docsQuebrados.push({ arquivo, alvo });
  }
}
if (docsQuebrados.length) {
  aviso("documentação cita caminho inexistente", `${docsQuebrados.length} referência(s)`, docsQuebrados.slice(0, 6).map((d) => `${d.arquivo} → ${d.alvo}`).join("; "));
} else ok("toda referência de arquivo em .md existe", `${rastreados.filter((a) => a.endsWith(".md")).length} documentos`);

/* ------------------------------------------------------------------ *
 * 5 · Dependências
 * ------------------------------------------------------------------ */
const pkg = JSON.parse(await readFile(join(RAIZ, "package.json"), "utf8"));
// Uma dependência está em uso se alguém a importa no código OU se algum
// script do package.json a invoca (eslint, prettier e typescript são usados
// assim). Dev e runtime são julgados separadamente: dev não vai para o
// bundle, runtime vai.
const uso = new Map();
const registrar = (dep, onde) => {
  if (!uso.has(dep)) uso.set(dep, []);
  uso.get(dep).push(onde);
};
// O CSS importa dependência também ("@import \"tailwindcss\"").
for (const arquivo of rastreados.filter((a) => /\.(ts|tsx|mjs|js|css)$/.test(a))) {
  const texto = await readFile(join(RAIZ, arquivo), "utf8").catch(() => "");
  for (const dep of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) })) {
    const re = new RegExp(`["']${dep.replace(/[/@]/g, (c) => "\\" + c)}(["'/])`);
    if (re.test(texto)) registrar(dep, arquivo);
  }
}
// O script pode usar o binário da dependência ("tsc --noEmit" usa o
// typescript). O nome do binário conta como uso.
const binarios = new Map();
for (const dep of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) })) {
  const manifesto = await readFile(join(RAIZ, "node_modules", dep, "package.json"), "utf8").catch(() => "");
  if (!manifesto) continue;
  const dados = JSON.parse(manifesto);
  const b = dados.bin;
  if (typeof b === "string") binarios.set(dep, [b]);
  else if (b && typeof b === "object") binarios.set(dep, Object.keys(b));
}
for (const [nome, comando] of Object.entries(pkg.scripts ?? {})) {
  for (const dep of Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) })) {
    if (comando.includes(dep)) registrar(dep, `script:${nome}`);
    else if ((binarios.get(dep) ?? []).some((bin) => new RegExp(`(^|\\s)${bin}(\\s|$)`).test(comando))) {
      registrar(dep, `script:${nome} (binário ${binarios.get(dep).join("/")})`);
    }
  }
}
// Dependência que nenhum código importa, mas que uma dependência instalada
// exige (peer dependency do framework), não é lixo: é contrato do framework.
const exigidasPeloFramework = new Set();
try {
  for (const entrada of await readdir(join(RAIZ, "node_modules"), { withFileTypes: true })) {
    const nomes = entrada.isDirectory() && entrada.name.startsWith("@")
      ? (await readdir(join(RAIZ, "node_modules", entrada.name))).map((n) => `${entrada.name}/${n}`)
      : [entrada.name];
    for (const nome of nomes) {
      const manifesto = await readFile(join(RAIZ, "node_modules", nome, "package.json"), "utf8").catch(() => "");
      if (!manifesto) continue;
      const dados = JSON.parse(manifesto);
      for (const campo of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const dep of Object.keys(dados[campo] ?? {})) exigidasPeloFramework.add(dep);
      }
    }
  }
} catch {
  // node_modules ausente: o critério de framework não se aplica
}
const naoUsadasRuntime = Object.keys(pkg.dependencies ?? {}).filter(
  (d) => !uso.has(d) && !exigidasPeloFramework.has(d),
);
const naoUsadasDev = Object.keys(pkg.devDependencies ?? {}).filter((d) => !uso.has(d));
if (naoUsadasRuntime.length) {
  aviso("dependência de runtime que nada importa", naoUsadasRuntime.join(", "), "package.json → dependencies");
} else ok("toda dependência de runtime é importada", `${Object.keys(pkg.dependencies ?? {}).length} dependências`);
if (naoUsadasDev.length) aviso("dependência de desenvolvimento sem uso", naoUsadasDev.join(", "), "package.json → devDependencies");
else ok("toda dependência de desenvolvimento é usada");

/* ------------------------------------------------------------------ *
 * 6 · Configuração e entrega
 * ------------------------------------------------------------------ */
if (!existsSync(join(RAIZ, ".vercelignore"))) {
  aviso("sem .vercelignore", "o deploy sobe artefatos grandes (o corpus tem 120 MB)", "deploy");
} else ok(".vercelignore presente");
if (existsSync(join(RAIZ, ".github/workflows/portoes.yml"))) ok("CI com portões presente", ".github/workflows/portoes.yml");
else defeito("CI ausente", "nenhum workflow de portões", ".github");
if (existsSync(join(RAIZ, ".env")) || existsSync(join(RAIZ, ".env.local"))) defeito("arquivo .env versionado", "segredo em disco", "raiz");
else ok("nenhum .env versionado");

/* ------------------------------------------------------------------ *
 * 7 · Migrations
 * ------------------------------------------------------------------ */
const migrations = (await readdir(join(RAIZ, "migrations"))).filter((n) => n.endsWith(".sql")).sort();
const numeros = migrations.map((n) => n.slice(0, 4));
const duplicadosNumero = numeros.filter((n, i) => numeros.indexOf(n) !== i);
if (duplicadosNumero.length) defeito("número de migration repetido", [...new Set(duplicadosNumero)].join(", "), "migrations/");
else ok("migrations com número único", `${migrations.length} migrations`);
const semProposito = migrations.filter((n) => {
  const texto = readFileSync(join(RAIZ, "migrations", n), "utf8");
  return !/^--\s*\S/m.test(texto);
});
if (semProposito.length) aviso("migration sem cabeçalho que diga o propósito", semProposito.join(", "), "migrations/");
else ok("toda migration diz o que é");

/* ------------------------------------------------------------------ *
 * Relatório
 * ------------------------------------------------------------------ */
const resumo = {
  ok: achados.filter((a) => a.nivel === "ok").length,
  aviso: achados.filter((a) => a.nivel === "aviso").length,
  defeito: achados.filter((a) => a.nivel === "defeito").length,
};
const relatorio = { geradoEm: new Date().toISOString(), head: git("rev-parse", "--short", "HEAD"), resumo, achados };
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(relatorio, null, 2));
} else {
  const marca = { ok: "✓", aviso: "!", defeito: "✗" };
  console.log(`\n  AUDITORIA DO DIRETÓRIO — ${relatorio.head}`);
  console.log(`  ${resumo.ok} ok · ${resumo.aviso} aviso(s) · ${resumo.defeito} defeito(s)\n`);
  for (const a of achados) {
    console.log(`  ${marca[a.nivel]} ${a.titulo}${a.detalhe ? ` — ${a.detalhe}` : ""}`);
    if (a.onde) console.log(`      ${a.onde}`);
  }
  console.log("");
}
