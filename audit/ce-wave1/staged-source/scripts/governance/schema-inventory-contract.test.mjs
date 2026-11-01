import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const sql=readFileSync(resolve(import.meta.dirname,'structural-db-inventory.readonly.sql'),'utf8');
test('Schema inventory contract read-only: no grants, DDL or mutable statements',()=>{
  const noComments=sql.replace(/--[^\n]*/g,'');
  assert.match(noComments,/BEGIN TRANSACTION READ ONLY;/i);
  assert.match(noComments,/COMMIT;/i);
  assert.match(noComments,/pg_constraint/);
  assert.match(noComments,/has_table_privilege/);
  assert.doesNotMatch(noComments,/\b(INSERT|UPDATE|DELETE|ALTER|DROP|TRUNCATE|CREATE|GRANT|REVOKE|COPY|CALL|DO|EXECUTE)\s+(?:TABLE|INTO|ON|FROM|FUNCTION|PROCEDURE|SCHEMA|EXTENSION|POLICY|ROLE|DATABASE|VIEW|TRIGGER|INDEX|MATERIALIZED|SEQUENCE)?/i);
});
