/**
 * Mede o estado real dos campos pendentes. Não normaliza nada:
 * só conta, para a migration 0037 saber o que existe.
 */
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const nomes = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
const db = new PGlite();
for (const nome of nomes) await db.exec(await readFile(new URL(nome, dir), "utf8"));

const q = async (rotulo, sql) => {
  const r = await db.query(sql);
  console.log(`\n### ${rotulo}`);
  console.log(JSON.stringify(r.rows, null, 1));
};

await q("source_tool (colunas e pendencias)", `
  select count(*)::int as total,
         count(*) filter (where version is null or btrim(version) = '')::int as sem_version,
         count(*) filter (where evidence is null or btrim(evidence) = '')::int as sem_evidence,
         count(*) filter (where band_from is null or btrim(band_from) = '')::int as sem_band,
         count(*) filter (where published)::int as publicadas
  from source_tool`);

await q("locale (label = id?)", `
  select count(*)::int as total,
         count(*) filter (where label = id)::int as label_igual_id,
         count(*) filter (where label is null or btrim(label) = '')::int as label_vazia
  from locale`);

await q("locale: as que ainda sao o id", `
  select id, label from locale where label = id or label is null or btrim(label) = '' order by id`);

await q("content_text (estado de publicacao e corpo)", `
  select count(*)::int as total,
         count(*) filter (where status = 'publicado')::int as publicadas,
         count(*) filter (where status <> 'publicado')::int as nao_publicadas,
         count(*) filter (where body is null or btrim(body) = '')::int as sem_corpo
  from content_text`);

await q("content_text: status distintos", `select status, count(*)::int as n from content_text group by status order by n desc`);

await q("content_text: quantos idiomas tem conteudo publicado", `
  select locale, count(*) filter (where status = 'publicado')::int as publicados, count(*)::int as total
  from content_text group by locale order by publicados desc, locale`);

await q("kernel_atom / claim / evidence", `
  select
    (select count(*)::int from kernel_atom) as atoms,
    (select count(*)::int from kernel_atom where status = 'candidato') as atoms_candidato,
    (select count(*)::int from kernel_atom where admitted_by is null) as atoms_sem_aprovador,
    (select count(*)::int from kernel_claim) as claims,
    (select count(*)::int from kernel_claim where status = 'candidato') as claims_candidato,
    (select count(*)::int from kernel_evidence) as evidences`);

await q("business_rule e ai_control (rascunho?)", `
  select 'business_rule' as tabela, status, count(*)::int as n from business_rule group by status
  union all
  select 'ai_control', status, count(*)::int from ai_control group by status`);

await q("chrome_label, nav_item, content_alias, media_asset, sitemap_url", `
  select
    (select count(*)::int from chrome_label) as chrome_label,
    (select count(*)::int from nav_item) as nav_item,
    (select count(*)::int from content_alias) as content_alias,
    (select count(*)::int from media_asset) as media_asset,
    (select count(*)::int from sitemap_url) as sitemap_url,
    (select count(*)::int from content_object) as content_object`);

await q("colunas textuais vazias ou null nas tabelas de conteudo", `
  select table_name, column_name, count(*)::int as n
  from (
    select 'content_text' as table_name, unnest(array['title','lead','body']) as column_name from content_text
  ) t
  group by 1,2`);

await q("amostra de content_text nao publicada", `
  select slug, locale, view, status, left(coalesce(body,''), 40) as body
  from content_text where status <> 'publicado' limit 8`);

await q("amostra de content_text sem corpo", `
  select slug, locale, view, status, title from content_text
  where body is null or btrim(body) = '' limit 8`);

await q("intake / process / portoes", `
  select
    (select count(*)::int from intake_batch) as intake_batch,
    (select count(*)::int from intake_file) as intake_file,
    (select count(*)::int from kernel_order) as kernel_order,
    (select count(*)::int from kernel_manifest) as kernel_manifest,
    (select count(*)::int from policy_decision) as policy_decision,
    (select count(*)::int from process) as process`);

await q("process: os portoes", `select id, name, enabled from process order by id`);

await db.close();
