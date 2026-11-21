import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const source = new URL('../migrations/0002_source.sql', import.meta.url);
const guard = new URL('../migrations/0059_source_tool_default_unpublished.sql', import.meta.url);
async function withDatabase(check) {
  const pg = new PGlite();
  try {
    const historical = await readFile(source, 'utf8');
    const corrective = await readFile(guard, 'utf8');
    assert.match(historical, /published boolean not null default true/);
    assert.match(corrective, /alter table source_tool\s+alter column published set default false/i);
    assert.doesNotMatch(corrective, /update\s+source_tool|delete\s+from\s+source_tool|insert\s+into\s+source_tool/i,
      'candidate migration must not rewrite historical tool records');
    await pg.exec(historical);
    await check(pg,corrective);
  } finally {
    await pg.close();
  }
}

test('existing publication flags retain values after default-only migration', async () => {
  await withDatabase(async (pg, corrective) => {
    await pg.exec("insert into source_tool (slug, kind, title, lead) values ('legacy', 'escala', 'Existing', 'Legacy previously published')");
    await pg.exec("insert into source_tool (slug, kind, title, lead, published) values ('draft', 'escala', 'Draft', 'Not yet approved', false)");
    const before=(await pg.query('select slug,published from source_tool order by slug')).rows;
    assert.deepEqual(before,[{slug:'draft',published:false},{slug:'legacy',published:true}]);
    await pg.exec(corrective);
    const after=(await pg.query('select slug,published from source_tool order by slug')).rows;
    assert.deepEqual(after,before,'migration must not retroactively authorize or unpublish records');
  });
});

test('new source tool records are private by default, explicit publication still possible', async () => {
  await withDatabase(async (pg,corrective) => {
    await pg.exec(corrective);
    await pg.exec("insert into source_tool (slug, kind, title, lead) values ('unreviewed', 'escala', 'Unreviewed', 'Not clinically released')");
    await pg.exec("insert into source_tool (slug, kind, title, lead, published) values ('approved', 'escala', 'Approved', 'Explicitly published', true)");
    const values=(await pg.query("select slug,published from source_tool order by slug")).rows;
    assert.deepEqual(values,[{slug:'approved',published:true},{slug:'unreviewed',published:false}]);
    const catalog=await pg.query("select slug from source_tool where published=true order by slug");
    assert.deepEqual(catalog.rows,[{slug:'approved'}],'unreviewed must not be listed as published');
  });
});

test('default-only migration is repeatable without changing any data', async () => {
  await withDatabase(async (pg,corrective) => {
    await pg.exec(corrective);
    await pg.exec("insert into source_tool (slug, kind, title, lead) values ('unreviewed', 'escala', 'Unreviewed', 'Not clinically released')");
    await pg.exec(corrective);
    const values=(await pg.query("select slug,published from source_tool")).rows;
    assert.deepEqual(values,[{slug:'unreviewed',published:false}]);
  });
});

test('migration runner forbids unattended remote SQL in CI', async () => {
  const runner=await readFile(new URL('./migrate.mjs',import.meta.url),'utf8');
  assert.match(runner,/CE_DB_MIGRATION_APPROVED/);
  assert.match(runner,/GITHUB_ACTIONS/);
  assert.match(runner,/if \(process\.env\.CI === "true" \|\| process\.env\.GITHUB_ACTIONS === "true"\)/);
  assert.match(runner,/HOLD_DB_MIGRATION_APPROVAL_REQUIRED/);
});
