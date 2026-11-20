import test from 'node:test';
import assert from 'node:assert/strict';
import {inventoryMigrations} from './inventory-migration-collisions.mjs';

test('root migrations with repeated numbers are held and keep every source hash',()=>{
 const inventory=inventoryMigrations([
  {name:'0004_alpha.sql',content:'create table if not exists alpha (id int primary key);'},
  {name:'0004_beta.sql',content:'create table beta (id int primary key);'},
  {name:'0005_gamma.sql',content:'create table gamma (id int primary key);'},
 ]);
 assert.equal(inventory.migrationFiles,3);
 assert.equal(inventory.uniqueNumbers,2);
 assert.equal(inventory.collidingNumbers,1);
 assert.deepEqual(inventory.collisions[0].tableNames,['alpha','beta']);
 assert.equal(inventory.collisions[0].files.length,2);
 assert.notEqual(inventory.collisions[0].files[0].sha256,inventory.collisions[0].files[1].sha256);
 assert.equal(inventory.collisions[0].decision,'HOLD_HUMAN');
 assert.equal(inventory.remoteDatabaseAppliedStatus,'NOT_VERIFIED');
});

test('identical content is not conflated with authorization or safe renumbering',()=>{
 const body='create table if not exists example (id int primary key);';
 const out=inventoryMigrations([{name:'0037_alpha.sql',content:body},{name:'0037_beta.sql',content:body}]);
 assert.equal(out.collisions[0].sameContent,true);
 assert.equal(out.releaseGate,'HOLD_HUMAN');
});

test('ignores unrelated filenames and strips comments during table extraction',()=>{
 const out=inventoryMigrations([
  {name:'notes.txt',content:'create table bogus (id int);'},
  {name:'0040_demo.sql',content:"-- create table fake (id int);\n/* create table omitted (id int); */\ncreate table public.real (id int primary key);"},
 ]);
 assert.equal(out.migrationFiles,1);
 assert.deepEqual(out.collisions,[]);
});
