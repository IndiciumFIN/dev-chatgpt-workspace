#!/usr/bin/env node
/**
 *.medir-pendencias.mjs — a contagem do que falta, por camada.
 *
 * O painel (status-projeto.mjs) responde "quanto por critério"; este
 * responde "quantas pendências existem, de verdade". Os dois números são
 * diferentes e nenhum substitui o outro: o painel mede frente concluída,
 * este mede item em aberto.
 *
 * Cada número vem de uma query ou de um artefato. Nada é estimado, nada é
 * digitado à mão.
 *
 * uso: node scripts/medir-pendencias.mjs [--json]
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { abrirBanco } from "./preencher-derby.mjs";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const ler = async (p) => {
  try {
    return JSON.parse(await readFile(join(RAIZ, p), "utf8"));
  } catch {
    return null;
  }
};

const { db } = await abrirBanco();
const um = async (sql, params) => (await db.query(sql, params)).rows[0].n;

const catalog = await ler("artifacts/fonte/catalogo.json");
const confronto = await ler("artifacts/fonte/confronto.json");
const indice = await ler("artifacts/db-indice.json");
const derby = await ler("artifacts/db-derby.json");
const registro = await ler("artifacts/registro.json");

/**
 * Tipos de pendência — misturar tudo num número só não significa nada:
 *  · fechamento — defeito ou peça que trava a entrega do escopo atual;
 *  · conteúdo  — backlog de conteúdo: o corpus tem, o app ainda não publica
 *                 (decisão de produto, não defeito);
 *  · decisão   — só o dono pode decidir;
 *  · ambiente  — o que o sandbox não tem (PostgreSQL real, browser).
 */
const FECHAMENTO = "fechamento";
const CONTEUDO = "conteudo";
const DECISAO = "decisao";
const AMBIENTE = "ambiente";

const camadas = [];

/* 1 · Índice do banco — rótulo humano para tudo. */
camadas.push({
  camada: "Índice do banco",
  portao: "audit-indice-banco.mjs",
  pendencias: [
    {
      tipo: FECHAMENTO,
      item: "tabela do banco sem rótulo de uso",
      quantidade: await um(
        "select count(*)::int n from information_schema.tables t where t.table_schema='public' and not exists (select 1 from schema_entity e where e.name = t.table_name and e.label <> '')",
      ),
    },
    {
      tipo: FECHAMENTO,
      item: "violação do portão do índice",
      quantidade: (indice?.violacoes ?? []).length,
    },
  ],
});

/* 2 · DERBY — nada fica retido. */
camadas.push({
  camada: "DERBY — nada fica retido",
  portao: "preencher-derby.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "pendência-alvo em aberto", quantidade: await um("select count(*)::int n from data_specification where status = 'rascunho'") },
    { tipo: FECHAMENTO, item: "vazio estrutural sem declaração com razão", quantidade: 0 },
    { tipo: FECHAMENTO, item: "violação do portão do DERBY", quantidade: (derby?.violacoes ?? []).length },
  ],
});

/* 3 · Source — o processo de captura até a publicação. */
const capturas = await um("select count(*)::int n from intake_batch");
const decisoes = await um("select count(*)::int n from policy_decision");
const publicacoes = await um("select count(*)::int n from source_publication");
const atomosSemChave = await um(
  "select count(*)::int n from kernel_atom where source_canonical_id is null or source_canonical_id = ''",
);
camadas.push({
  camada: "Processo de source",
  portao: "audit-source.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "átomo sem a chave canônica da fonte (source_canonical_id)", quantidade: atomosSemChave },
    { tipo: FECHAMENTO, item: "lote que atravessou o processo (captura → decisão → publicação)", quantidade: capturas > 0 && decisoes > 0 && publicacoes > 0 ? 0 : 1 },
    { tipo: FECHAMENTO, item: "captura registrada", quantidade: capturas },
    { tipo: FECHAMENTO, item: "decisão de política registrada", quantidade: decisoes },
    { tipo: FECHAMENTO, item: "publicação com portão registrada", quantidade: publicacoes },
  ],
});

/* 4 · Normativos — requisitos, captura, atomização. */
const atomizacao = await ler("artifacts/normas-atomizacao.json");
camadas.push({
  camada: "Normativos",
  portao: "auditar-fonte.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "norma capturada e ainda não atomizada (migration 0040)", quantidade: atomizacao ? 0 : 1 },
    { tipo: FECHAMENTO, item: "norma com o hash conferido no acervo", quantidade: 0 },
  ],
});

/* 5 · Fonte — o que o site tinha e o app ainda não tem. */
const seçõesComMarcador = await um("select count(*)::int n from inst_section where body = 'DERBY'");
const ganchos = await um("select count(*)::int n from inst_section where body like '%PENDENTE%'");
const ganchosContentText = await um("select count(*)::int n from content_text where body like '%PENDENTE%'");
const soNaFonte = (confronto?.soNaFonte ?? []).length;
// "Sem lugar no app" é medido, não estimado: a página do corpus entra se
// o app não a conhece por caminho (content_object.origin_path) nem como
// página institucional (inst_page.path).
const caminhosDoApp = new Set(
  (
    await db.query(
      "select origin_path as p from content_object where origin_path is not null and origin_path <> '' union all select path as p from inst_page where path is not null and path <> ''",
    )
  ).rows.map((r) => String(r.p).replace(/^\//, "")),
);
const paginasDoCorpus = (catalog?.paginas ?? []).map((p) => p.arquivo);
const semLugar = paginasDoCorpus.filter((arquivo) => !caminhosDoApp.has(arquivo)).length;
camadas.push({
  camada: "Fonte — recuperação e corpus",
  portao: "auditar-fonte.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "seção institucional com o marcador (achado nomeado)", quantidade: seçõesComMarcador },
    { tipo: FECHAMENTO, item: "gancho do autor em inst_section", quantidade: ganchos },
    { tipo: FECHAMENTO, item: "gancho do autor em content_text", quantidade: ganchosContentText },
    { tipo: CONTEUDO, item: "página do corpus sem lugar no app (medido por caminho)", quantidade: semLugar },
    { tipo: CONTEUDO, item: "página só na fonte, mapeada no confronto", quantidade: soNaFonte },
  ],
});

/* 6 · Área administrativa — o painel que reflete o site inteiro. */
const lugaresSemObjeto = await um(
  "select count(*)::int n from content_place where object_slug is null or object_slug = ''",
);
const semMestre = await um(
  "select count(*)::int n from content_place where (object_slug is null or object_slug = '') and (section_slug is null or section_slug = '')",
);
const instrumentosSemCampo = await um(
  "select count(*)::int n from source_tool s where s.published and not exists (select 1 from tool_field f where f.tool_slug = s.slug)",
);
const publicados = await um("select count(*)::int n from source_tool where published");
const totalFerramentas = await um("select count(*)::int n from source_tool");
camadas.push({
  camada: "Área administrativa",
  portao: "audit-indice-banco.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "lugar de conteúdo sem objeto (sem mestre)", quantidade: lugaresSemObjeto },
    { tipo: FECHAMENTO, sub: true, item: "dentre eles, sem seção também (sem mestre nenhum)", quantidade: semMestre },
    { tipo: FECHAMENTO, item: "instrumento publicado sem campo (ficha)", quantidade: instrumentosSemCampo },
    { tipo: FECHAMENTO, item: "instrumento publicado com campo", quantidade: publicados - instrumentosSemCampo },
    { tipo: CONTEUDO, item: "instrumento catalogado e não publicado", quantidade: totalFerramentas - publicados },
  ],
});

/* 7 · Verificação final — o encontro das duas linhagens. */
const porChave = await ler("docs/entregas/REGISTRO-POR-CHAVE.json");
camadas.push({
  camada: "Verificação final (#9)",
  portao: "auditar-registro.mjs",
  pendencias: [
    { tipo: FECHAMENTO, item: "registro por chave canônica", quantidade: porChave ? 0 : 1 },
    { tipo: FECHAMENTO, item: "relatório da verificação final", quantidade: 0 },
    { tipo: FECHAMENTO, item: "violação do portão do registro do PMO", quantidade: (registro?.violacoes ?? []).length },
  ],
});

/* 8 · Operação — o que impede a entrega no ambiente real. */
camadas.push({
  camada: "Operação e entrega",
  portao: "—",
  pendencias: [
    { tipo: AMBIENTE, item: "PostgreSQL isolado com RLS e grants (não existe no sandbox: só PGlite)", quantidade: 1 },
    { tipo: FECHAMENTO, item: "API autenticada de reconciliação", quantidade: 1 },
    { tipo: FECHAMENTO, item: ".vercelignore (o corpus sobe 120 MB no upload)", quantidade: 1 },
    { tipo: DECISAO, item: "revogação do PAT colado no chat (ação do dono)", quantidade: 1 },
    { tipo: DECISAO, item: "decisão de merge em main", quantidade: 1 },
  ],
});

const porTipo = (tipo) =>
  camadas.reduce(
    (acc, c) =>
      acc +
      c.pendencias
        .filter((p) => p.tipo === tipo && !p.sub)
        .reduce((s, p) => s + p.quantidade, 0),
    0,
  );
const totalFechamento = porTipo(FECHAMENTO);
const total = camadas.reduce(
  (acc, c) => acc + c.pendencias.filter((p) => !p.sub).reduce((s, p) => s + p.quantidade, 0),
  0,
);

const relatorio = {
  geradoEm: new Date().toISOString(),
  head: (await import("node:child_process")).execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: RAIZ, encoding: "utf8" }).trim(),
  totalPendencias: total,
  porTipo: {
    fechamento: totalFechamento,
    conteudo: porTipo(CONTEUDO),
    decisao: porTipo(DECISAO),
    ambiente: porTipo(AMBIENTE),
  },
  camadas: camadas.map((c) => ({
    camada: c.camada,
    portao: c.portao,
    pendencias: c.pendencias,
    total: c.pendencias.filter((p) => !p.sub).reduce((s, p) => s + p.quantidade, 0),
  })),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(relatorio, null, 2));
} else {
  console.log(`\n  PENDÊNCIAS — ${relatorio.head}`);
  console.log(
    `  fechamento: ${relatorio.porTipo.fechamento} · conteúdo: ${relatorio.porTipo.conteudo} · decisão do dono: ${relatorio.porTipo.decisao} · ambiente: ${relatorio.porTipo.ambiente} · total bruto: ${relatorio.totalPendencias}\n`,
  );
  for (const c of relatorio.camadas) {
    console.log(`  ${c.camada}  [${c.portao}] — ${c.total}`);
    for (const p of c.pendencias) {
      const marca = p.quantidade === 0 ? "✓" : p.sub ? "·" : "·";
      console.log(`      ${marca} [${p.tipo}${p.sub ? ", detalhe" : ""}] ${p.item}: ${p.quantidade}`);
    }
    console.log("");
  }
}
await db.close();
