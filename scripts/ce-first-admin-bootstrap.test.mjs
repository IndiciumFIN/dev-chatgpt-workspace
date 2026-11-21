import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

/** Exact server SQL in disposable PGlite; live Auth E2E remains a separate gate. */
const source = readFileSync(new URL('../src/lib/source.functions.ts', import.meta.url), 'utf8');
const start = source.indexOf('export const ensureRole = createServerFn');
const end = source.indexOf('export const adminDesk = createServerFn', start);
assert.ok(start >= 0 && end > start, 'ensureRole boundaries should be found');
const body = source.slice(start, end);
const tick=String.fromCharCode(96);
const fragments=[...body.matchAll(new RegExp('await sql'+tick+'([\\s\\S]*?)'+tick,'g'))];
assert.equal(fragments.length,1,'ensureRole must perform one INSERT statement');
const template = fragments[0][1];
const requiredParameter = '$'+'{context.userId}';
assert.equal(template.split(requiredParameter).length,2,'server principal must be the only SQL param');
const insertSql = template.replace(requiredParameter, '$1').trim();
assert.match(insertSql, /^insert into member \(user_id, role\)/i);
assert.match(insertSql, /values \(\$1, 'subscriber'\)/);
assert.match(insertSql, /on conflict \(user_id\) do nothing/);
assert.doesNotMatch(insertSql, /case\s+when|role\s*=\s*'admin'/i);

test('first and subsequent authenticated users cannot become admin by arriving first', async () => {
  const pg = new PGlite();
  try {
    await pg.exec("create table member (user_id text primary key, role text not null check (role in ('admin', 'subscriber')))");
    await pg.query(insertSql, ['user-a']);
    await pg.query(insertSql, ['user-b']);
    let rows = (await pg.query('select user_id, role from member order by user_id')).rows;
    assert.deepEqual(rows, [{user_id:'user-a',role:'subscriber'},{user_id:'user-b',role:'subscriber'}]);
    // Repeated logins must not overwrite independently provisioned administrators.
    await pg.query("update member set role='admin' where user_id='user-a'");
    await pg.query(insertSql, ['user-a']);
    rows = (await pg.query('select user_id, role from member order by user_id')).rows;
    assert.deepEqual(rows, [{user_id:'user-a',role:'admin'},{user_id:'user-b',role:'subscriber'}]);
  } finally { await pg.close(); }
});

test('concurrent new visitors remain subscribers without creating an implicit admin', async () => {
  const pg = new PGlite();
  try {
    await pg.exec('create table member (user_id text primary key, role text not null)');
    await Promise.all(Array.from({length:8}, (_,i)=>pg.query(insertSql, ['visitor-'+i])));
    const result=await pg.query('select role, count(*)::int as total from member group by role');
    assert.deepEqual(result.rows, [{role:'subscriber', total:8}]);
  } finally { await pg.close(); }
});

test('PGlite admin fixture remains explicit CI-only and cannot run against remote DB', () => {
  const seed = source.slice(source.indexOf('async function seed('),source.indexOf('async function requireAdmin('));
  for (const guard of [
    'dbSource !== "pglite"', 'CE_ADMIN_E2E_FIXTURE === "true"',
    'process.env.CI === "true"', 'GITHUB_ACTIONS === "true"',
    'VITE_AUTH_ENABLED === "false"', '!process.env.DATABASE_URL?.trim()'
  ]) assert.ok(seed.includes(guard),'missing isolated fixture guard: '+guard);
  assert.doesNotMatch(body, /case\s+when\s+exists\s*\(\s*select\s+1\s+from\s+member/);
});
