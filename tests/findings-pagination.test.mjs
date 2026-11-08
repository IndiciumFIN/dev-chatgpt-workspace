import test from 'node:test';
import assert from 'node:assert/strict';
import {FINDINGS_PAGE_SIZE,paginateFindings} from '../src/findings-pagination.js';

test('bounded first page never renders all 35,000 findings',()=>{
 const records=Array.from({length:35000},(_,id)=>({id}));
 const p=paginateFindings(records);
 assert.equal(p.items.length,FINDINGS_PAGE_SIZE);
 assert.equal(p.total,35000);
 assert.equal(p.pages,700);
 assert.equal(p.from,0);
 assert.equal(p.to,50);
 assert.equal(p.hasNext,true);
});
test('next page and last page preserve order and total',()=>{
 const items=Array.from({length:103},(_,id)=>id);
 const second=paginateFindings(items,1);
 const last=paginateFindings(items,100);
 assert.deepEqual(second.items,[...Array(50)].map((_,i)=>i+50));
 assert.deepEqual(last.items,[100,101,102]);
 assert.equal(last.page,2);
 assert.equal(last.hasNext,false);
});
test('empty result has stable accessible paging state',()=>{
 const p=paginateFindings([],95);
 assert.deepEqual(p.items,[]);
 assert.equal(p.page,0);
 assert.equal(p.pages,1);
 assert.equal(p.to,0);
 assert.equal(p.hasPrevious,false);
 assert.equal(p.hasNext,false);
});
test('non-integer, negative and malicious page numbers fail closed',()=>{
 const a=[1,2,3];
 for(const v of [NaN,Infinity,-Infinity,'50',null,{},1.5])
  assert.equal(paginateFindings(a,v).page,0);
 assert.equal(paginateFindings(a,-100).page,0);
});
test('page size bounds and input type validated',()=>{
 for(const size of [0,-2,101,0.1,Number.MAX_SAFE_INTEGER])
  assert.throws(()=>paginateFindings([1],0,size),TypeError);
 assert.throws(()=>paginateFindings({},0),TypeError);
});
test('page window never alters canonical findings for export',()=>{
 const data=Array.from({length:1000},(_,i)=>({id:i}));
 const p=paginateFindings(data,3);
 assert.equal(p.items.length,50);
 assert.equal(data.length,1000);
 assert.equal(data[150].id,150);
});
