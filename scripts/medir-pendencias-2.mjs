/** Segunda medição: campos vazios por tabela e os marcadores de pendência. */
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

await q("marcadores de pendência em content_text", `
  select
    count(*) filter (where body is null or btrim(body) = '')::int as corpo_vazio,
    count(*) filter (where body = 'A tradução desta página não está no repo')::int as traducao_ausente,
    count(*) filter (where title like '/%')::int as titulo_e_caminho,
    count(*) filter (where lead is null or btrim(lead) = '')::int as lead_vazio,
    count(*) filter (where title is null or btrim(title) = '')::int as titulo_vazio
  from content_text`);

await q("status de content_text por titulo/caminho", `
  select status, count(*)::int as n from content_text where title like '/%' group by status`);

await q("campos vazios por tabela (so colunas textuais)", `
  select 'media_asset' as tabela, 'alt' as coluna, count(*)::int as n from media_asset where alt is null or btrim(alt) = ''
  union all select 'media_asset','title', count(*)::int from media_asset where title is null or btrim(title) = ''
  union all select 'media_asset','url', count(*)::int from media_asset where url is null or btrim(url) = ''
  union all select 'sitemap_url','loc', count(*)::int from sitemap_url where loc is null or btrim(loc) = ''
  union all select 'nav_item','label', count(*)::int from nav_item where label is null or btrim(label) = ''
  union all select 'content_alias','path', count(*)::int from content_alias where path is null or btrim(path) = ''
  union all select 'content_object','kind', count(*)::int from content_object where kind is null or btrim(kind) = ''
  union all select 'chrome_label','label', count(*)::int from chrome_label where label is null or btrim(label) = ''
  union all select 'tool_band','label', count(*)::int from tool_band where label is null or btrim(label) = ''
  union all select 'tool_field','label', count(*)::int from tool_field where label is null or btrim(label) = ''
  union all select 'tool_criterion','label', count(*)::int from tool_criterion where label is null or btrim(label) = ''
  union all select 'schema_column','definition', count(*)::int from schema_column where definition is null or btrim(definition) = ''
  union all select 'data_specification','definition', count(*)::int from data_specification where definition is null or btrim(definition) = ''
  union all select 'schema_entity','purpose', count(*)::int from schema_entity where purpose is null or btrim(purpose) = ''
  union all select 'schema_term','definition', count(*)::int from schema_term where definition is null or btrim(definition) = ''
  union all select 'policy_rule','reason', count(*)::int from policy_rule where reason is null or btrim(reason) = ''
  union all select 'business_rule','statement', count(*)::int from business_rule where statement is null or btrim(statement) = ''`);

await q("os process (portoes)", `select id, name, enabled from process order by id`);

await q("colunas de business_rule e ai_control", `
  select table_name, column_name from information_schema.columns
  where table_name in ('business_rule','ai_control','kernel_atom','kernel_claim','source_tool','locale')
  order by table_name, ordinal_position`);

await q("locale: as 5 que ja tem nome", `select id, label from locale where label <> id order by id`);

await q("os 82 instrumentos: publicado e faixa", `
  select count(*) filter (where published)::int as publicadas,
         count(distinct kind)::int as tipos,
         string_agg(distinct kind, ', ') as kinds
  from source_tool`);

await db.close();
