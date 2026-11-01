import { readdir, readFile, writeFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const dir = new URL("../migrations/", import.meta.url);
const nomes = (await readdir(dir)).filter((n) => n.endsWith(".sql")).sort();
const db = new PGlite();
for (const n of nomes) await db.exec(await readFile(new URL(n, dir), "utf8"));

const faltam = [
 "blob_conflict","canonical_asset","canonical_auto_review","canonical_conflict","canonical_conflict_source",
 "canonical_divergence","canonical_migration_gap","canonical_migration_recovered","canonical_suggestion",
 "career_application_candidate","career_atomic_fact_candidate","career_authority_binding_candidate",
 "career_capability_governance_candidate","career_claim_candidate","career_content_claim_binding_candidate",
 "career_credential_candidate","career_document_template_candidate","career_editorial_block_candidate",
 "career_editorial_candidate","career_editorial_document_candidate","career_evidence_bundle_candidate",
 "career_ingestion_run_candidate","career_interview_scenario_candidate","career_jurisdiction_requirement_candidate",
 "career_learning_resource_candidate","career_learning_resource_type_candidate","career_market_observation_candidate",
 "career_market_signal_candidate","career_milestone_candidate","career_module_candidate","career_network_capability_candidate",
 "career_opportunity_candidate","career_opportunity_type_candidate","career_path_candidate","career_path_step_candidate",
 "career_profile_candidate","career_profile_credential_candidate","career_profile_skill_candidate",
 "career_projection_candidate","career_projection_contract_candidate","career_projection_item_candidate",
 "career_publication_candidate","career_reflection_question_candidate","career_release_gate_candidate",
 "career_review_item_candidate","career_role_candidate","career_role_skill_candidate","career_skill_candidate",
 "career_source_candidate","career_source_fragment_candidate","career_worklife_capability_candidate",
 "career_youth_activity_candidate","historia_nao_mesclada","kernel_coluna_citada","mudanca_producao",
 "participation_consensus_vote_candidate","participation_contribution_candidate","participation_outcome_candidate",
 "participation_process_candidate","participation_proposal_candidate","participation_reaction_candidate",
 "participation_statement_candidate","research_instrument_candidate","research_project_candidate",
 "research_risk_candidate","research_skill_need_candidate","review_item",
];

const out = {};
for (const t of faltam) {
  const cols = await db.query(
    `select a.attname as name, format_type(a.atttypid, a.atttypmod) as type, a.attnotnull as notnull,
            pg_get_expr(d.adbin, d.adrelid) as default_expr
     from pg_attribute a
     join pg_class c on c.oid = a.attrelid
     join pg_namespace n on n.oid = c.relnamespace
     left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum
     where c.relname = $1 and n.nspname='public' and a.attnum > 0 and not a.attisdropped
     order by a.attnum`, [t]);
  const pk = await db.query(
    `select con.conname as name, pg_get_constraintdef(con.oid) as def,
            (select array_agg(a.attname order by k.ord) from unnest(con.conkey) with ordinality k(attnum, ord)
             join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.attnum) as cols
     from pg_constraint con
     join pg_class c on c.oid = con.conrelid
     join pg_namespace n on n.oid = c.relnamespace
     where c.relname = $1 and n.nspname='public' and con.contype in ('p','u')
     order by con.contype, con.conname`, [t]);
  const fks = await db.query(
    `select pg_get_constraintdef(con.oid) as def
     from pg_constraint con
     join pg_class c on c.oid = con.conrelid
     join pg_namespace n on n.oid = c.relnamespace
     where c.relname = $1 and n.nspname='public' and con.contype='f'
     order by 1`, [t]);
  const idx = await db.query(
    `select indexdef as def from pg_indexes where schemaname='public' and tablename=$1 order by indexname`, [t]);
  const nrows = await db.query(`select count(*)::int as n from "${t}"`).catch(() => ({rows:[{n:null}]}));
  out[t] = {
    colunas: cols.rows.map((c) => `${c.name} ${c.type}${c.notnull ? " not null" : ""}${c.default_expr ? ` default ${c.default_expr}` : ""}`),
    chaves: pk.rows,
    fks: fks.rows.map((f) => f.def),
    indices: idx.rows.map((i) => i.def),
    linhas: nrows.rows[0]?.n,
  };
}
await writeFile(new URL("tabelas.json", import.meta.url), JSON.stringify(out, null, 2));
console.log("tabelas despejadas:", Object.keys(out).length);
for (const t of faltam) {
  const o = out[t];
  console.log(`\n=== ${t} (linhas=${o.linhas}) ===`);
  console.log("PK:", JSON.stringify(o.chaves.map((c) => c.cols)));
  console.log("COLS:", o.colunas.join(" | "));
  console.log("FK:", o.fks.join(" ; "));
}
await db.close();
