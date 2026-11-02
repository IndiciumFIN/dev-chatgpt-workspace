#!/usr/bin/env node
/**
 * CE deterministic agent team — WO-CE-DB-SKELETON-001.
 * The five agent roles operate on immutable catalog metadata, not user content.
 * CANDIDATE ONLY. No DDL, DML, merge, deploy, Kernel admission or approvals.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const INPUT = join(ROOT, 'audit-evidence/supabase-canonical/20261101/schemas');
const OUTPUT = join(ROOT, 'artifacts/ce-agents');
const WO = 'WO-CE-DB-SKELETON-001';
const PROJECT_REF = 'pgsybzggewhinaniybiy';
const EXPECTED = { schemas: 45, tables: 606, columns: 6486, views: 49 };
const MANAGED = new Set(['auth', 'storage', 'realtime', 'supabase_migrations', 'cron', 'extensions', 'graphql', 'graphql_public', 'net', 'vault']);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, null, 2) + '\n';
const put = (file, value) => { mkdirSync(resolve(file, '..'), { recursive: true }); writeFileSync(file, stable(value)); };
const sorted = values => values.every((v, i) => !i || values[i - 1] < v);
const artifact = (file, value) => put(join(OUTPUT, file), value);
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const status = (role, outcome, detail) => ({ role, outcome, detail, wo: WO });
const getCommand = () => process.argv[2] ?? 'pipeline';

function readSnapshots() {
  if (!existsSync(INPUT)) return [];
  return readdirSync(INPUT).filter(f => f.endsWith('.json')).sort().map(f => {
    const value = read(join(INPUT, f));
    if (f !== value.origin?.schema + '.json') throw Error('SCHEMA_FILENAME_MISMATCH:' + f);
    if (value.origin?.projectRef !== PROJECT_REF) throw Error('SOURCE_PROJECT_MISMATCH:' + f);
    if (value.recordType !== 'READ_ONLY_SCHEMA_SNAPSHOT_NOT_MIGRATION') throw Error('UNTRUSTED_SOURCE:' + f);
    return value;
  });
}

function validateSnapshots(snapshots) {
  const problems = [];
  const seen = new Set();
  let tables = 0, columns = 0, views = 0;
  for (const snapshot of snapshots) {
    const schema = snapshot.origin.schema;
    if (seen.has(schema)) problems.push('DUPLICATE_SCHEMA:' + schema);
    seen.add(schema);
    const tableNames = snapshot.tables.map(t => t.name);
    if (!sorted(tableNames)) problems.push('UNSORTED_TABLES:' + schema);
    if (snapshot.tables.length !== snapshot.integrity?.tables) problems.push('TABLE_COUNT_DRIFT:' + schema);
    if (snapshot.isManagedSchema !== MANAGED.has(schema)) problems.push('MANAGED_BOUNDARY_DRIFT:' + schema);
    for (const t of snapshot.tables) {
      if (!['r', 'p'].includes(t.kind)) problems.push('NON_TABLE:' + schema + '.' + t.name);
      const colNames = t.columns.map(c => c.name);
      if (new Set(colNames).size !== colNames.length) problems.push('DUPLICATE_COLUMN:' + schema + '.' + t.name);
      if (t.columns.length === 0) problems.push('NO_COLUMNS:' + schema + '.' + t.name);
      if (!Array.isArray(t.indexes) || !Array.isArray(t.constraints) || !Array.isArray(t.policy_names))
        problems.push('INCOMPLETE_METADATA:' + schema + '.' + t.name);
      columns += t.columns.length;
      tables++;
    }
    views += Number(snapshot.integrity.viewsObserved ?? 0);
  }
  const counts = { schemas: snapshots.length, tables, columns, views };
  for (const [key, target] of Object.entries(EXPECTED)) {
    if (counts[key] !== target) problems.push('INCOMPLETE_BASELINE:' + key + ':' + counts[key] + '/' + target);
  }
  return { counts, problems, complete: !problems.length };
}

/** Extractor Agent. Queries system catalogs only, inside READ ONLY transaction. */
async function capture() {
  const conn = process.env.CE_DB_READONLY_URL;
  if (!conn) {
    const result = status('catalog-extractor', 'HOLD_HUMAN', 'CE_DB_READONLY_URL not configured; no remote database access attempted');
    artifact('extractor.json', result);
    return result;
  }
  const { default: pg } = await import('pg');
  const db = new pg.Client({ connectionString: conn, application_name: 'ce_readonly_canonical_snapshot' });
  await db.connect();
  try {
    await db.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const ns = await db.query("SELECT n.nspname AS name, COUNT(c.oid) FILTER (WHERE c.relkind IN ('r','p')) AS tables, COUNT(c.oid) FILTER (WHERE c.relkind IN ('v','m')) AS views FROM pg_namespace n LEFT JOIN pg_class c ON c.relnamespace=n.oid AND c.relkind IN ('r','p','v','m') WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema' GROUP BY 1 ORDER BY 1");
    const snapshots = [];
    for (const schema of ns.rows) {
      const sql = \`SELECT COALESCE(jsonb_agg(jsonb_build_object(
         'name', c.relname, 'kind', c.relkind, 'rls', c.relrowsecurity,
         'force_rls', c.relforcerowsecurity,
         'columns', (SELECT COALESCE(jsonb_agg(jsonb_build_object('ordinal',a.attnum,
           'name',a.attname,'type',format_type(a.atttypid,a.atttypmod),
           'nullable',NOT a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),
           'identity',a.attidentity,'generated',a.attgenerated) ORDER BY a.attnum),'[]'::jsonb)
           FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
           WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped),
         'constraints',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',co.conname,
           'type',co.contype,'definition',pg_get_constraintdef(co.oid)) ORDER BY co.conname),'[]'::jsonb)
           FROM pg_constraint co WHERE co.conrelid=c.oid),
         'indexes',(SELECT COALESCE(jsonb_agg(jsonb_build_object('name',i.indexname,
           'definition',i.indexdef) ORDER BY i.indexname),'[]'::jsonb)
           FROM pg_indexes i WHERE i.schemaname=$1 AND i.tablename=c.relname),
         'policy_names',(SELECT COALESCE(jsonb_agg(p.polname ORDER BY p.polname),'[]'::jsonb)
           FROM pg_policy p WHERE p.polrelid=c.oid)
       ) ORDER BY c.relname),'[]'::jsonb) AS inventory
       FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
       WHERE c.relkind IN ('r','p') AND n.nspname=$1\`;
      const result = await db.query(sql, [schema.name]);
      const tables = result.rows[0].inventory;
      snapshots.push({
        schemaVersion: '1.0.0', recordType: 'READ_ONLY_SCHEMA_SNAPSHOT_NOT_MIGRATION',
        origin: { provider: 'Supabase', projectRef: PROJECT_REF, schema: schema.name,
          repository: 'IndiciumFIN/dev-chatgpt-workspace', source: 'pg_catalog' },
        isManagedSchema: MANAGED.has(schema.name), snapshotDate: new Date().toISOString().slice(0, 10),
        integrity: { tables: tables.length, columns: tables.reduce((s,t) => s + t.columns.length,0), viewsObserved: Number(schema.views) },
        tables
      });
    }
    await db.query('COMMIT');
    const validated = validateSnapshots(snapshots);
    if (!validated.complete) throw Error('CAPTURE_FAIL_CLOSED:' + validated.problems.join(','));
    for (const snapshot of snapshots) put(join(INPUT, snapshot.origin.schema + '.json'), snapshot);
    const result = status('catalog-extractor', 'CAPTURED_CANDIDATE', validated.counts);
    artifact('extractor.json', result);
    return result;
  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    throw e;
  } finally { await db.end(); }
}

/** Skeleton Agent. No manual tables and no fake implementations. */
function skeleton(snapshots) {
  const data = { recordType:'CANONICAL_SKELETON_CANDIDATE', source: PROJECT_REF,
    workOrder: WO, generatedFrom: [], schemas: [], objectCount: 0, implementation: 'STRUCTURAL_ONLY_NOT_EXECUTABLE_SERVICE' };
  for (const s of snapshots) {
    const registry = { schema: s.origin.schema, managedBySupabase: s.isManagedSchema, tables: [] };
    for (const t of s.tables) {
      const key = s.origin.schema + '.' + t.name;
      registry.tables.push({
        key, columns: t.columns.map(c => ({ name:c.name, type:c.type, nullable:c.nullable })),
        constraints: t.constraints.map(x => x.name), indexes:t.indexes.map(x=>x.name),
        rlsEnabled: t.rls, policies: t.policy_names,
        service: { target: key, status:'NOT_IMPLEMENTED', read:'BLOCKED_UNTIL_CONTRACT', write:'BLOCKED_UNTIL_KERNEL' },
        bindings: { api:'NOT_VERIFIED', frontend:'NOT_VERIFIED', content:'NOT_INGESTED' }
      });
      data.objectCount++;
    }
    data.schemas.push({ name:registry.schema, managed:registry.managedBySupabase,
      tables:registry.tables.length, path:'schemas/'+registry.schema+'.json' });
    artifact('skeleton/schemas/'+registry.schema+'.json', registry);
    data.generatedFrom.push({schema:registry.schema, sourceSha256:sha256(stable(s))});
  }
  artifact('skeleton/index.json', data);
  return status('skeleton-builder', 'GENERATED_CANDIDATE', { objects:data.objectCount, schemas:data.schemas.length });
}

/** Branch Agent. Reads complete Git object trees; never merges. */
function branches() {
  const git = (...args) => execFileSync('git',args,{cwd:ROOT,encoding:'utf8',maxBuffer:64*1024*1024}).trim();
  let refs;
  try {
    refs = git('for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin')
      .split('\n').filter(Boolean).map(x => { const m=/^origin\/(.+) ([a-f0-9]{40,64})$/.exec(x);return m&&m[1]!=='HEAD'?{name:m[1],sha:m[2]}:null;}).filter(Boolean);
  } catch (e) {
    const hold = status('branch-reconciler','HOLD_HUMAN','Remote refs unavailable; checkout all branch refs before auditing');
    artifact('branch-audit.json',hold);return hold;
  }
  if (!refs.some(r=>r.name==='main')) {
    const hold = status('branch-reconciler','HOLD_HUMAN','origin/main not fetched');
    artifact('branch-audit.json',hold);return hold;
  }
  const main='refs/remotes/origin/main';
  const catalog = refs.filter(r=>r.name!=='main').map(r=>{
    const ref = 'refs/remotes/origin/'+r.name;
    const tree = git('ls-tree','-r','--full-tree',ref).split('\n').filter(Boolean);
    let common = null;
    try { common = git('merge-base',main,ref) } catch {}
    const mainTree = git('rev-parse',main+'^{tree}');
    const sourceTree = git('rev-parse',ref+'^{tree}');
    const status = !common ? 'NO_COMMON_ANCESTOR': sourceTree===mainTree?'IDENTICAL_TREE':'DIFFERS';
    return {branch:r.name, head:r.sha, tree:sourceTree, mainTree, files:tree.length,
      commonBase:common,status,merge:'NOT_AUTHORIZED'};
  });
  const result = {recordType:'BRANCH_TREE_AUDIT_CANDIDATE',wo:WO, mainSha:refs.find(x=>x.name==='main').sha,
    observedBranches:refs.length, sourceBranches:catalog.length, branches:catalog,
    completed:catalog.length>0, release:'HOLD_HUMAN'};
  artifact('branch-audit.json',result);
  return status('branch-reconciler','INVENTORIED_READ_ONLY',{sources:catalog.length});
}

/** Independent structural Checker: separate gate from Maker, no approval authority. */
function checker(snapshots) {
  const valid = validateSnapshots(snapshots);
  const idxPath = join(OUTPUT,'skeleton/index.json');
  const errors=[...valid.problems];
  if (!existsSync(idxPath)) errors.push('MISSING_SKELETON');
  else {
    const idx=read(idxPath);
    if (idx.objectCount !== valid.counts.tables) errors.push('SKELETON_TABLE_MISMATCH');
    if (idx.schemas.length !== valid.counts.schemas) errors.push('SKELETON_SCHEMA_MISMATCH');
    if (idx.generatedFrom.some(x=> {
      const found=snapshots.find(s=>s.origin.schema===x.schema);
      return !found || sha256(stable(found)) !== x.sourceSha256;
    })) errors.push('SKELETON_SOURCE_HASH_MISMATCH');
    for (const s of snapshots) {
      const p=join(OUTPUT,'skeleton/schemas/'+s.origin.schema+'.json');
      if (!existsSync(p) || read(p).tables.length!==s.tables.length) errors.push('SKELETON_SCHEMA_READBACK:'+s.origin.schema);
    }
  }
  const result={role:'independent-structural-checker',wo:WO,
    outcome:errors.length?'HOLD_HUMAN':'STRUCTURAL_PASS_NOT_HOMOLOGATED',
    metrics:valid.counts, errors, releaseEligible:false, kernelAdmitted:false};
  artifact('checker.json',result);
  return result;
}

/** Auditor: compare readback artifacts and fail closed; cannot self-homologate. */
function auditor(check) {
  const refs=['extractor.json','checker.json','skeleton/index.json','branch-audit.json'];
  const hashes=refs.filter(x=>existsSync(join(OUTPUT,x))).map(x=>({
    path:x, sha256:sha256(readFileSync(join(OUTPUT,x))) }));
  const record={role:'evidence-auditor',wo:WO,hashes,structuralCheck:check.outcome,
    makerCheckerAuditorSeparation:'LOGICAL_ONLY_REQUIRES_INDEPENDENT_REVIEW',
    release:'HOLD_HUMAN',kernelAdmitted:false, clinicalApproval:false,
    limitations:['No clinical content checked','No RLS simulation','No authorized promotion','No content ingestion']};
  artifact('audit.json',record);return record;
}

async function main() {
  const cmd=getCommand();
  const results=[];
  if (!['capture','generate','reconcile','check','audit','pipeline'].includes(cmd)) throw Error('UNKNOWN_AGENT_COMMAND');
  if (cmd==='capture' || (cmd==='pipeline' && process.env.CE_DB_READONLY_URL)) results.push(await capture());
  const snapshots=readSnapshots();
  if (['generate','pipeline'].includes(cmd)) results.push(skeleton(snapshots));
  if (['reconcile','pipeline'].includes(cmd)) results.push(branches());
  let checked;
  if (['check','audit','pipeline'].includes(cmd)) {
    checked=checker(snapshots);
    if (cmd!=='audit') results.push(checked);
  }
  if (['audit','pipeline'].includes(cmd)) results.push(auditor(checked));
  const pass=checked?.outcome==='STRUCTURAL_PASS_NOT_HOMOLOGATED';
  const report={wo:WO,command:cmd,roles:results,structuralComplete:pass,
    contentIngestion:'BLOCKED_UNTIL_SKELETON_AND_GOVERNANCE',promotion:'HOLD_HUMAN'};
  artifact('run-summary.json',report);
  console.log(JSON.stringify({wo:WO, command:cmd, structuralComplete:pass,
    result:results.map(x=>({role:x.role,outcome:x.outcome}))},null,2));
  if (['check','audit','pipeline'].includes(cmd) && !pass) process.exitCode=2;
}
main().catch(e=>{console.error('[CE_AGENTS_FAIL_CLOSED]',e.message);process.exitCode=2;});
