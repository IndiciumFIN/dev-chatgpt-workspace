import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync('src/lib/source.functions.ts','utf8');
const between=(left,right)=>{
 const i=source.indexOf(left),j=source.indexOf(right,i+left.length);
 assert.ok(i>=0&&j>i,'Missing canonical server function: '+left);
 return source.slice(i,j);
};

test('authenticated first visitor is never silently promoted to admin',()=>{
 const fn=between('export const ensureRole =','export const adminDesk =');
 assert.match(fn,/values \(\$\{context\.userId\}, 'subscriber'\)/);
 assert.match(fn,/on conflict \(user_id\) do nothing/);
 assert.doesNotMatch(fn,/case when exists[\s\S]*?else 'admin'/i);
});

test('GET catalog and GET admin view perform no implicit database inserts',()=>{
 const catalog=between('export const readCatalog =','export const ensureRole =');
 const desk=between('export const adminDesk =','export const saveTool =');
 for(const body of [catalog,desk]){
  assert.doesNotMatch(body,/\b(?:insert|update|delete)\s+\b/i);
  assert.doesNotMatch(body,/\bseed\(/i);
 }
});

test('public catalog cannot disclose unpublished or unreviewed drafts',()=>{
 const catalog=between('export const readCatalog =','export const ensureRole =');
 assert.match(catalog,/from source_tool where published = true order by title/);
});

test('editorial save rejects publish=true until Kernel evidence exists',()=>{
 const save=between('export const saveTool =','export const setMemberRole =');
 assert.match(save,/if \(input\.published === true\) throw new Error/);
 assert.match(save,/requireAdmin\(sql, context\.userId\)/);
});

test('UI cannot grant admin role without independent approval',()=>{
 const role=source.slice(source.indexOf('export const setMemberRole ='),source.indexOf('export const listMedia ='));
 assert.match(role,/if \(input\.role === "admin"\) throw new Error/);
 assert.match(role,/requireAdmin\(sql, context\.userId\)/);
});
