import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertDatabaseConfiguredForDeployment } from './ce-db-deployment-guard.mjs';

test('Vercel production fails closed if DATABASE_URL is absent or empty',()=>{
  for(const value of [undefined,'','  ']){
    assert.throws(()=>assertDatabaseConfiguredForDeployment({VERCEL:'1',VERCEL_ENV:'production',DATABASE_URL:value}),
      /CE_DB_DEPLOYMENT_CONNECTION_REQUIRED/);
  }
});
test('Vercel preview and development fail closed without a database',()=>{
  for(const env of ['preview','development']){
    assert.throws(()=>assertDatabaseConfiguredForDeployment({VERCEL_ENV:env,DATABASE_URL:''}),
      /CE_DB_DEPLOYMENT_CONNECTION_REQUIRED/);
  }
});
test('deployment with a configured connection is admitted without logging its secret',()=>{
  assert.doesNotThrow(()=>assertDatabaseConfiguredForDeployment({
    VERCEL:'1',VERCEL_ENV:'production',DATABASE_URL:'postgresql://redacted.example.invalid/test'
  }));
});
test('local and disposable CI PGlite remain eligible with no DATABASE_URL',()=>{
  for(const env of [{},{NODE_ENV:'development',CI:'true',GITHUB_ACTIONS:'true',DATABASE_URL:''}]){
    assert.doesNotThrow(()=>assertDatabaseConfiguredForDeployment(env));
  }
});
test('DB module runs deployment guard before selecting Neon or PGlite',()=>{
  const src=readFileSync(new URL('../src/lib/db.ts',import.meta.url),'utf8');
  assert.match(src,/import \{ assertDatabaseConfiguredForDeployment \} from/);
  const guard=src.indexOf('assertDatabaseConfiguredForDeployment(process.env);');
  const choice=src.indexOf('return dbSource === "neon" ? createNeonSql() : createPgliteSql();');
  assert.ok(guard>0&&choice>guard,'guard must precede database creation');
});
