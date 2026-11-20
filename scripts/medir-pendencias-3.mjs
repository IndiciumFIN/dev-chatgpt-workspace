/** Terceira medição: o vazio é pendência real ou é o design discriminador? */
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

await q("nav_item: e discriminador? (uma coluna de destino por linha)", `
  select count(*)::int as total,
         count(*) filter (where dest_to is not null and btrim(dest_to) <> '')::int as tem_dest_to,
         count(*) filter (where dest_slug is not null and btrim(dest_slug) <> '')::int as tem_dest_slug,
         count(*) filter (where dest_id is not null and btrim(dest_id) <> '')::int as tem_dest_id,
         count(*) filter (where dest_hash is not null and btrim(dest_hash) <> '')::int as tem_dest_hash,
         count(*) filter (where dest_model is not null and btrim(dest_model) <> '')::int as tem_dest_model,
         count(*) filter (where
            (dest_to is null or btrim(dest_to) = '') and (dest_slug is null or btrim(dest_slug) = '')
            and (dest_id is null or btrim(dest_id) = '') and (dest_hash is null or btrim(dest_hash) = '')
            and (dest_model is null or btrim(dest_model) = ''))::int as sem_destino_nenhum
  from nav_item`);

await q("nav_item: dest_kind e as colunas de destino", `
  select dest_kind, count(*)::int as n,
         count(*) filter (where btrim(coalesce(dest_to,'')) <> '')::int as com_to,
         count(*) filter (where btrim(coalesce(dest_slug,'')) <> '')::int as com_slug,
         count(*) filter (where btrim(coalesce(dest_model,'')) <> '')::int as com_model
  from nav_item group by dest_kind order by n desc`);

await q("content_place: e discriminador?", `
  select count(*)::int as total,
         count(*) filter (where btrim(coalesce(object_slug,'')) <> '')::int as tem_object,
         count(*) filter (where btrim(coalesce(section_slug,'')) <> '')::int as tem_section,
         count(*) filter (where btrim(coalesce(inst_path,'')) <> '')::int as tem_inst,
         count(*) filter (where btrim(coalesce(object_slug,'')) = '' and btrim(coalesce(section_slug,'')) = '' and btrim(coalesce(inst_path,'')) = '')::int as sem_destino
  from content_place`);

await q("schema das tabelas com pendencia suspeita", `
  select table_name, string_agg(column_name, ', ' order by ordinal_position) as colunas
  from information_schema.columns
  where table_schema = 'public'
    and table_name in ('governance_item','data_specification','phase_note','source_tool','editorial_line','specimen','inst_section','inst_page','inst_child','section_block','process','policy_ack')
  group by table_name order by table_name`);

await q("governance_item: quantas linhas e quais estados", `
  select count(*)::int as total from governance_item`);

await q("governance_item: amostra", `
  select * from governance_item limit 3`);

await q("phase_note: a linha com status vazio", `
  select * from phase_note where status is null or btrim(status) = ''`);

await q("data_specification: amostra", `
  select * from data_specification limit 2`);

await q("source_tool: category e nanda_mode das 5 publicadas", `
  select slug, category, nanda_mode, published from source_tool where published limit 5`);

await q("editorial_line: as 10 vazias", `
  select * from editorial_line where text is null or btrim(text) = '' limit 3`);

await q("inst_section / section_block: amostra do que falta", `
  select 'inst_section' as t, count(*)::int as n from inst_section where body is null or btrim(body) = ''
  union all select 'section_block', count(*)::int from section_block where body is null or btrim(body) = ''`);

await db.close();
