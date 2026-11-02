#!/usr/bin/env node
/**
 * Avaliação das linhagens — onde está o ganho e o que é portável.
 *
 * A pergunta do dono: "avaliar as outras branches e ver onde se pode ganhar
 * benefícios (portar, não reinventar)". Responder com opinião não serve;
 * a resposta tem que sair de contagem medida.
 *
 * Este script mede, para cada branch remoto:
 *   · quantos commits tem, e se tem ancestral comum com o HEAD;
 *   · quantos arquivos e quantas linhas cada frente carrega;
 *   · quais scripts do HEAD não existem na outra linhagem, e quais deles
 *     portam direto, quais exigem adaptação e quais pertencem ao esquema
 *     da outra linhagem (cko_*, registers/, contracts/) e portanto não
 *     portam como SQL.
 *
 * uso: node scripts/avaliar-linhagens.mjs [--json]
 */
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SAIDA = join(RAIZ, "artifacts/branches/avaliacao.json");

const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();

const BRANCHES = git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin")
  .split("\n")
  .filter((b) => b && b !== "origin/HEAD");

/** As frentes, pelo caminho — a classificação é da árvore, não da minha memória. */
const FRENTES = [
  { id: "doutrina", rotulo: "Doutrina e políticas", caminho: "docs/governance", padrao: /^(docs\/governance|docs\/CKO-POL)/ },
  { id: "admin", rotulo: "Área administrativa", caminho: "src/components/admin", padrao: /^(src\/components\/admin|src\/lib\/admin|routes\/admin)/ },
  { id: "importacao", rotulo: "Importação em lote", caminho: "src/core/governance", padrao: /^(src\/core\/governance\/bulk|src\/core\/governance\/import)/ },
  { id: "ferramentas", rotulo: "Ferramentas clínicas", caminho: "src/lib/tools", padrao: /^(src\/lib\/tools|src\/lib\/formulas|tools\/)/ },
  { id: "i18n", rotulo: "Internacionalização", caminho: "src/i18n", padrao: /^(src\/i18n|locales|i18n)/ },
  { id: "seo-rotas", rotulo: "SEO e rotas", caminho: "src/routes", padrao: /^(src\/routes|sitemap|src\/lib\/seo)/ },
  { id: "contratos", rotulo: "Contratos CKO", caminho: "contracts", padrao: /^contracts\// },
  { id: "registros", rotulo: "Registros", caminho: "registers", padrao: /^registers\// },
  { id: "evidencia", rotulo: "Evidência e auditoria", caminho: "audit-evidence", padrao: /^(audit-evidence|audit\/)/ },
  { id: "ci", rotulo: "CI e automação", caminho: ".github", padrao: /^\.github\// },
  { id: "migrations", rotulo: "Migrations candidatas", caminho: "migrations", padrao: /^migrations\// },
  { id: "core", rotulo: "Núcleo de governança", caminho: "src/core", padrao: /^src\/core\// },
];

/** Linhas de verdade (não bytes): git grep conta as linhas de cada arquivo. */
function linhasDe(branch, filtro = null) {
  try {
    const args = ["grep", "-c", "-e", "", branch];
    if (filtro) args.push("--", filtro);
    const saida = git(...args);
    return saida
      .split("\n")
      .filter(Boolean)
      .reduce((acc, l) => {
        const m = l.match(/:(\d+)$/);
        return acc + (m ? Number(m[1]) : 0);
      }, 0);
  } catch {
    return 0;
  }
}

const MEDE = (branch) => {
  const arquivos = git("ls-tree", "-r", "--name-only", branch);
  const lista = arquivos ? arquivos.split("\n") : [];
  const frente = {};
  for (const f of FRENTES) {
    const dela = lista.filter((p) => f.padrao.test(p));
    if (!dela.length) continue;
    frente[f.id] = {
      rotulo: f.rotulo,
      arquivos: dela.length,
      linhas: linhasDe(branch, f.caminho),
    };
  }
  const bytes = Number(
    git("ls-tree", "-r", "-l", branch).split("\n").reduce((acc, l) => {
      const m = l.match(/\s(\d+)\t/);
      return acc + (m ? Number(m[1]) : 0);
    }, 0),
  );
  return { arquivos: lista.length, bytes, linhas: linhasDe(branch), frente };
};

const principal = "origin/preview/central-comando-20261026";
const relatorio = {
  geradoEm: new Date().toISOString(),
  head: git("rev-parse", "--short", "HEAD"),
  branch: git("rev-parse", "--abbrev-ref", "HEAD"),
  branches: [],
  portabilidade: null,
};

/* 1) Cada branch: commits, ancestral comum, tamanho por frente. */
for (const branch of BRANCHES) {
  const commits = Number(git("rev-list", "--count", branch) || 0);
  let comum = null;
  try {
    comum = git("merge-base", "HEAD", branch);
  } catch {
    comum = null;
  }
  const medido = MEDE(branch);
  relatorio.branches.push({
    branch,
    commits,
    ancestralComumComHead: comum ? comum.slice(0, 7) : null,
    mesmaLinhagem: Boolean(comum),
    arquivos: medido.arquivos,
    bytes: medido.bytes,
    linhas: medido.linhas,
    frente: medido.frente,
  });
}

/* 2) Portabilidade dos scripts: o que o HEAD não tem e a outra linhagem tem. */
const meusScripts = new Set(
  git("ls-tree", "-r", "--name-only", "HEAD", "scripts/")
    .split("\n")
    .filter(Boolean),
);
const scriptsDela = git("ls-tree", "-r", "--name-only", principal, "scripts/")
  .split("\n")
  .filter((p) => p.endsWith(".mjs") || p.endsWith(".js"));
const faltam = scriptsDela.filter((p) => !meusScripts.has(p));

/**
 * Critério de portabilidade, medido no grafo de imports:
 *   · direto    — todo import relativo resolve dentro da ÁRVORE DO HEAD;
 *   · adaptação — importa algo que só existe na outra linhagem;
 *   · esquema B — lê o esquema que só a outra linhagem tem (cko_*, registers/,
 *     contracts/) ou é SQL contra esse esquema: portar como SQL é impossível.
 */
const CLASSIF = { direto: [], adaptacao: [], soEsquemaB: [] };
const arquivosDoHead = new Set(git("ls-tree", "-r", "--name-only", "HEAD").split("\n").filter(Boolean));

for (const script of faltam) {
  let conteudo = "";
  try {
    conteudo = git("show", `${principal}:${script}`);
  } catch {
    conteudo = "";
  }
  const importaCko = /\b(from|join)\s*\(?["'][^"']*\b(cko_|registers\/|contracts\/)/.test(conteudo);
  const leEsquemaB = /\bfrom\s+cko_|\bjoin\s+cko_|\bregisters\/|\bcontracts\/cko-/.test(conteudo);
  if (script.endsWith(".sql") || importaCko || leEsquemaB) {
    CLASSIF.soEsquemaB.push(script);
    continue;
  }
  const imports = [...conteudo.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const relativos = imports.filter((i) => i.startsWith("."));
  const faltando = [];
  for (const imp of relativos) {
    const alvo = join(join(RAIZ, "scripts"), imp).replace(`${RAIZ}/scripts/../`, `${RAIZ}/`);
    if (!arquivosDoHead.has(alvo.replace(`${RAIZ}/`, ""))) faltando.push(imp);
  }
  if (faltando.length) CLASSIF.adaptacao.push({ script, precisa: faltando });
  else CLASSIF.direto.push(script);
}
relatorio.portabilidade = {
  branchDeReferencia: principal,
  criterio:
    "direto = todo import relativo resolve na árvore do HEAD; adaptação = importa algo que só existe na outra linhagem; esquema da outra linhagem = lê cko_*/registers/contracts ou é SQL contra esse esquema",
  scriptsDaOutraLinhagem: scriptsDela.length,
  scriptsQueOHeadNaoTem: faltam.length,
  portamDireto: CLASSIF.direto.length,
  exigemAdaptacao: CLASSIF.adaptacao.length,
  pertencemAoEsquemaDaOutraLinhagem: CLASSIF.soEsquemaB.length,
  lista: CLASSIF,
};

await mkdir(join(RAIZ, "artifacts/branches"), { recursive: true });
await writeFile(SAIDA, JSON.stringify(relatorio, null, 2));

console.log(
  `[linhagens] ${relatorio.branches.length} branches · maior: ${relatorio.branches
    .slice()
    .sort((a, b) => b.combits - a.combits)[0]?.branch}`,
);
for (const b of relatorio.branches.sort((a, b) => b.combits - a.combits)) {
  console.log(
    `  ${b.branch.replace("origin/", "").padEnd(38)} commits ${String(b.commits).padStart(4)} · ${String(b.arquivos).padStart(5)} arquivos · ${String(b.linhas).padStart(7)} linhas · ${b.mesmaLinhagem ? "mesma linhagem" : "SEM ancestral comum"}`,
  );
}
console.log(
  `[portabilidade] ${relatorio.portabilidade.scriptsQueOHeadNaoTem} scripts que o HEAD não tem: ${relatorio.portabilidade.portamDireto} diretos · ${relatorio.portabilidade.exigemAdaptacao} com adaptação · ${relatorio.portabilidade.pertencemAoEsquemaDaOutraLinhagem} só no esquema da outra linhagem`,
);
console.log(`[artefato] ${SAIDA}`);
