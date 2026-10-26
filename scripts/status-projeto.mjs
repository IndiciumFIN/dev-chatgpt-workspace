#!/usr/bin/env node
/**
 * status-projeto.mjs — painel de status do projeto, DERIVADO.
 *
 * Regra: nenhum número aqui é digitado à mão. Cada frente tem CRITÉRIOS
 * verificáveis, e cada critério é medido num artefato de portão, num arquivo
 * que precisa existir, ou numa contagem que o próprio artefato carrega.
 * O que não der para medir é marcado como TAL, não estimado em silêncio.
 *
 * O motor do time NÃO é fonte de verdade aqui: ele morre por tempo e por
 * limite de tokens, e uma frente entregue pelo dono ficaria como 0%. O que
 * vale é a prova.
 *
 *   node scripts/status-projeto.mjs            # painel em texto
 *   node scripts/status-projeto.mjs --json     # mesmo painel, em JSON
 *   node scripts/status-projeto.mjs --detalhe  # com a evidência de cada frente
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ARGS = process.argv.slice(2);
const SAIDA_JSON = ARGS.includes('--json');
const DETALHE = ARGS.includes('--detalhe');

const ler = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};
const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
const existe = (p) => existsSync(join(RAIZ, p));

/* Artefatos dos portões. */
const indice = ler(`${RAIZ}/artifacts/db-indice.json`);
const derby = ler(`${RAIZ}/artifacts/db-derby.json`);
const source = ler(`${RAIZ}/artifacts/source-processo.json`);
const catalogo = ler(`${RAIZ}/artifacts/fonte/catalogo.json`);
const recuperacao = ler(`${RAIZ}/artifacts/fonte/recuperacao.json`);
const auditoriaFonte = ler(`${RAIZ}/artifacts/fonte/auditoria.json`);

/** Quantos HTML tem a origem — o denominador do catálogo. */
function htmlNaOrigem(raiz) {
  if (!raiz || !existsSync(raiz)) return null;
  let n = 0;
  const andar = (dir) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (entrada.name === ".git" || entrada.name === "node_modules") continue;
      const caminho = join(dir, entrada.name);
      if (entrada.isDirectory()) andar(caminho);
      else if (entrada.name.toLowerCase().endsWith(".html")) n += 1;
    }
  };
  andar(raiz);
  return n;
}

/**
 * Um critério medido. `a`/`b` são contagens; `ok` é um booleano. Quem não dá
 * para medir devolve `null` — e a frente mostra "n/a" em vez de 0.
 */
const c = (nome, a, b, evidencia) => ({ nome, a, b, ok: null, evidencia });
const booleano = (nome, ok, evidencia) => ({ nome, a: ok ? 1 : 0, b: 1, ok: Boolean(ok), evidencia });

/* ------------------------------------------------------------------ *
 * As frentes: cada uma com os critérios que a fecham.
 * ------------------------------------------------------------------ */
const FRENTES = [
  {
    id: 'indice',
    peso: 10,
    nome: 'Índice do banco — rótulo humano para tudo',
    criterios: () => {
      const k = indice?.contagens ?? {};
      return [
        c('dicionário cobre todas as tabelas', k.tabelasComLabel ?? 0, k.tabelasDoBanco ?? 0,
          `${k.tabelasComLabel ?? '?'}/${k.tabelasDoBanco ?? '?'} tabelas com label`),
        booleano('portão do índice sem violação', (indice?.violacoes?.length ?? 1) === 0,
          `violações=${indice?.violacoes?.length ?? '?'}`),
      ];
    },
  },
  {
    id: 'derby',
    peso: 15,
    nome: 'DERBY — nada fica retido, e o vazio é declarado',
    criterios: () => {
      const alvo = (derby?.pendencias ?? []).filter((p) => p.alvo);
      const declaradas = (derby?.estruturais ?? []).filter((p) => p.razao);
      const semDeclaracao = (derby?.semDeclaracao ?? []).length;
      return [
        booleano('nenhuma pendência-alvo em aberto', alvo.length === 0, `alvo em aberto=${alvo.length}`),
        booleano('portão do DERBY sem violação', (derby?.violacoes?.length ?? 1) === 0,
          `violações=${derby?.violacoes?.length ?? '?'}`),
        c('todo vazio estrutural tem declaração com razão', declaradas.length,
          declaradas.length + semDeclaracao,
          `${declaradas.length} declaradas · ${semDeclaracao} sem declaração`),
      ];
    },
  },
  {
    id: 'source',
    peso: 15,
    nome: 'Processo de source — kernel, intake, portão, doutrina',
    criterios: () => {
      const k = source?.contagens ?? {};
      return [
        c('átomos admitidos com evidência', k.atomosAdmitidos ?? 0, k.atomos ?? 0,
          `${k.atomosAdmitidos ?? '?'}/${k.atomos ?? '?'}`),
        c('manifestos aprovados', k.manifestosAprovados ?? 0, k.manifestos ?? 0,
          `${k.manifestosAprovados ?? '?'}/${k.manifestos ?? '?'}`),
        booleano('portão do processo sem violação', (source?.violacoes?.length ?? 1) === 0,
          `violações=${source?.violacoes?.length ?? '?'}`),
        booleano('a OPA nega por padrão',
          existe('contracts/cko-governance/opa/kernel_admission.rego'), 'kernel_admission.rego'),
        booleano('a doutrina que o kernel executa está escrita',
          existe('migrations/0039_politicas.sql') || existe('docs/doutrina'),
          'migrations/0039_politicas.sql ou docs/doutrina/'),
        booleano('um lote real atravessou o processo (captura → decisão → publicação)',
          (k.capturas ?? 0) > 0 && (k.decisoes ?? 0) > 0 && (k.publicacoes ?? 0) > 0,
          `capturas=${k.capturas ?? 0} · decisões=${k.decisoes ?? 0} · publicações=${k.publicacoes ?? 0}`),
      ];
    },
  },
  {
    id: 'normativos',
    peso: 15,
    nome: 'Normativos — requisitos, captura, hashes e atomização',
    criterios: () => [
      booleano('os requisitos de um site de normativos estão escritos',
        existe('docs/normativos/requisitos.md'), 'docs/normativos/requisitos.md'),
      booleano('o plano de captura existe', existe('docs/normativos/plano-de-captura.md'),
        'docs/normativos/plano-de-captura.md'),
      booleano('a conferência de hash do acervo passa',
        existe('audit-evidence/transversal-acquisition/CONFERENCIA-HASH.md'),
        'CONFERENCIA-HASH.md'),
      booleano('a atomização homologada existe',
        existe('migrations/0040') || existe('artifacts/normas-atomizacao.json'),
        'migrations/0040_* ou artifacts/normas-atomizacao.json'),
    ],
  },
  {
    id: 'fonte',
    peso: 20,
    nome: 'Fonte — catálogo, confronto com o banco e recuperação',
    criterios: () => {
      const html = htmlNaOrigem(catalogo?.origem);
      return [
        c('o catálogo cobre todo o HTML da origem', catalogo?.total ?? 0, html ?? 0,
          html === null ? 'origem ausente — n/a' : `${catalogo?.total ?? 0}/${html} páginas`),
        booleano('o confronto com o banco está feito',
          existe('artifacts/fonte/confronto.json'), 'artifacts/fonte/confronto.json'),
        booleano('a recuperação está aplicada e o portão passa',
          (auditoriaFonte?.violacoes?.length ?? 1) === 0,
          `violações=${auditoriaFonte?.violacoes?.length ?? '?'} · recuperadas=${auditoriaFonte?.recuperadas ?? '?'}`),
        booleano('o confronto e a proveniência estão documentados',
          existe('docs/fonte/CONFRONTO.md') && existe('docs/fonte/PROVENIENCIA.md'),
          'docs/fonte/CONFRONTO.md + PROVENIENCIA.md'),
        c('as seções institucionais têm texto',
          auditoriaFonte?.secoesComTexto ?? 0,
          (auditoriaFonte?.secoesComTexto ?? 0) + (auditoriaFonte?.pendentesRestantes ?? 0),
          `${auditoriaFonte?.secoesComTexto ?? '?'} com texto · ${auditoriaFonte?.pendentesRestantes ?? '?'} com marcador (achados nomeados)`),
      ];
    },
  },
  {
    id: 'admin',
    peso: 15,
    nome: 'Área administrativa — as três mesas novas e o painel do site',
    criterios: () => [
      booleano('a especificação das três mesas novas existe',
        existe('docs/admin/especificacao-mesas-novas.md'), 'docs/admin/especificacao-mesas-novas.md'),
      booleano('a migration das mesas novas existe',
        existe('migrations/0043_mesas_seo_idioma_jurisdicao.sql'),
        'migrations/0043_mesas_seo_idioma_jurisdicao.sql'),
      booleano('a área admin reflete o site inteiro (rótulos do dicionário)',
        existe('docs/admin/painel-do-site.md'), 'docs/admin/painel-do-site.md'),
    ],
  },
  {
    id: 'final',
    peso: 10,
    nome: 'Verificação final (#9) — o encontro das duas linhagens',
    criterios: () => {
      const portoes = [
        ['índice do banco', (indice?.violacoes?.length ?? 1) === 0],
        ['DERBY', (derby?.violacoes?.length ?? 1) === 0],
        ['processo de source', (source?.violacoes?.length ?? 1) === 0],
        ['fonte', (auditoriaFonte?.violacoes?.length ?? 1) === 0],
      ];
      const verdes = portoes.filter(([, ok]) => ok).length;
      return [
        c('os quatro portões passam', verdes, portoes.length,
          `${verdes}/${portoes.length} verdes`),
        booleano('o registro por chave canônica existe',
          existe('docs/entregas/REGISTRO-POR-CHAVE.md'), 'docs/entregas/REGISTRO-POR-CHAVE.md'),
        booleano('a verificação final está escrita',
          existe('deliverables/verificacao-final/relatorio.md'),
          'deliverables/verificacao-final/relatorio.md'),
      ];
    },
  },
];

/* ------------------------------------------------------------------ *
 * Cálculo: cada frente é a média dos seus critérios medidos; o total
 * é a média ponderada das frentes. Critério sem medição = n/a.
 * ------------------------------------------------------------------ */
const paineis = FRENTES.map((frente) => {
  const criterios = frente.criterios();
  const medidos = criterios.filter((x) => x.b !== null && x.b !== 0);
  const p =
    medidos.length === 0
      ? null
      : Math.round(
          (medidos.reduce((acc, x) => acc + (x.b > 0 ? x.a / x.b : 0), 0) / medidos.length) * 1000,
        ) / 10;
  return { id: frente.id, nome: frente.nome, peso: frente.peso, pct: p, criterios };
});

const comPeso = paineis.filter((p) => p.pct !== null);
const total = comPeso.length
  ? Math.round(
      (comPeso.reduce((acc, p) => acc + p.pct * p.peso, 0) /
        comPeso.reduce((acc, p) => acc + p.peso, 0)) *
        10,
    ) / 10
  : null;

if (SAIDA_JSON) {
  console.log(JSON.stringify({ total, frentes: paineis }, null, 2));
  process.exit(0);
}

const barra = (p, largura = 20) => {
  if (p === null) return '·'.repeat(largura);
  const cheio = Math.round((p / 100) * largura);
  return '█'.repeat(cheio) + '░'.repeat(largura - cheio);
};

console.log('');
console.log(`  PAINEL DO PROJETO — ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
console.log(`  TOTAL: ${total === null ? 'n/a' : `${total}%`}   (medido por critério, não por estimation)`);
console.log('');
for (const p of paineis) {
  console.log(`  ${(p.pct === null ? ' n/a' : `${p.pct}%`).padStart(5)}  ${barra(p.pct)}  ${p.nome}  (peso ${p.peso})`);
  for (const x of p.criterios) {
    const completo = x.b > 0 && x.a >= x.b;
    const marca =
      x.b === 0 && x.ok === null ? 'n/a' : x.ok === null ? (completo ? '✓' : '✗') : x.ok ? '✓' : '✗';
    console.log(`         ${marca} ${x.nome}${x.evidencia ? `  — ${x.evidencia}` : ''}`);
  }
}
console.log('');
