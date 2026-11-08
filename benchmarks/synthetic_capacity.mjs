// WUTRIB-WO-PLAN-017 | read-only synthetic benchmark, no network/database.
import {performance} from 'node:perf_hooks';
import assert from 'node:assert/strict';
import {parseEFDText,auditCrossCheck,findingsCSV,MAX_EFD_BYTES} from '../src/audit.js';

const STEPS=[1000,10000,35000],SAMPLES=5,ENGINE_ONLY_ROWS=120000;
const key=n=>String(n).padStart(44,'0');
function makeEFD(n){
 const lines=['|0000|'];
 for(let i=1;i<=n;i++)
  lines.push('|C100|1|0|PART|55|00|1|'+i+'|'+key(i)+'|01112026|01112026|120,00|');
 return lines.join('\n')+'\n';
}
function stats(a){
 const b=[...a].sort((x,y)=>x-y);
 return {min_ms:+b[0].toFixed(2),median_ms:+b[Math.floor(b.length/2)].toFixed(2),
  sample_p95_ms:+b[Math.ceil(b.length*.95)-1].toFixed(2),max_ms:+b[b.length-1].toFixed(2)};
}
const results=[];
for(const n of STEPS){
 const input=makeEFD(n),bytes=Buffer.byteLength(input);
 assert.ok(bytes<=MAX_EFD_BYTES,'EFD exceeds 4MiB file limit');
 const xml=Array.from({length:10},(_,i)=>({key:key(i+1),amount:120}));
 const parseMs=[],auditMs=[],csvMs=[],rssMiB=[],heapMiB=[];
 for(let i=0;i<SAMPLES;i++){
  if(global.gc)global.gc();
  const start=performance.now();
  const efd=parseEFDText(input);
  const parsedAt=performance.now();
  const report=auditCrossCheck(xml,efd);
  const auditedAt=performance.now();
  const csv=findingsCSV(report);
  const exportedAt=performance.now();
  assert.equal(efd.c100.length,n);
  assert.equal(efd.warnings.length,0);
  assert.equal(report.matches,10);
  assert.equal(report.findings.length,n-10);
  assert.equal(report.taxConformity,'NOT_EVALUATED');
  assert.ok(csv.includes('NOT_EVALUATED'));
  const memory=process.memoryUsage();
  parseMs.push(parsedAt-start);auditMs.push(auditedAt-parsedAt);csvMs.push(exportedAt-auditedAt);
  rssMiB.push(memory.rss/1048576);heapMiB.push(memory.heapUsed/1048576);
 }
 const result={mode:'EFD_TEXT_PLUS_ENGINE',c100:n,xml:10,input_bytes:bytes,samples:SAMPLES,
  parse:stats(parseMs),audit:stats(auditMs),csv:stats(csvMs),
  max_rss_mib:+Math.max(...rssMiB).toFixed(1),max_heap_mib:+Math.max(...heapMiB).toFixed(1),
  expected_findings:n-10};
 results.push(result);
 console.log('WUTRIB_BENCH_RESULT='+JSON.stringify(result));
}
if(global.gc)global.gc();
const rows=Array.from({length:ENGINE_ONLY_ROWS},(_,i)=>({key:key(i+1),amount:120}));
const xml=rows.slice(0,10).map(x=>({...x}));
const start=performance.now(),report=auditCrossCheck(xml,rows),end=performance.now();
assert.equal(report.matches,10);
assert.equal(report.findings.length,ENGINE_ONLY_ROWS-10);
const memory=process.memoryUsage();
const result={mode:'ENGINE_IN_MEMORY_ONLY_OUTSIDE_UI_LIMIT',c100:ENGINE_ONLY_ROWS,xml:10,
  audit_ms:+(end-start).toFixed(2),rss_mib:+(memory.rss/1048576).toFixed(1),
  heap_mib:+(memory.heapUsed/1048576).toFixed(1),expected_findings:ENGINE_ONLY_ROWS-10};
results.push(result);
console.log('WUTRIB_BENCH_RESULT='+JSON.stringify(result));
let oversizeRejected=false;
try{parseEFDText('X'.repeat(MAX_EFD_BYTES+1))}catch(e){oversizeRejected=/4 MB/.test(e.message)}
assert.ok(oversizeRejected);
console.log('WUTRIB_BENCH_SUMMARY='+JSON.stringify({
 benchmark:'isolated deterministic synthetic CPU and memory',
 node:process.version,max_efd_bytes:MAX_EFD_BYTES,
 max_xml_files_per_browser_batch:10,largest_in_memory_case_tested:ENGINE_ONLY_ROWS,
 max_old_space_size_mib:384,oversize_efd_rejected:true,results
}));
