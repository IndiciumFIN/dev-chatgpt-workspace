import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {checkOriginalPdfBytes} from "./lib/ncos-pdf-byte-integrity.mjs";
async function withFolder(fn){
 const folder=await mkdtemp(join(tmpdir(),"ncos-verify-source-"));
 try{return await fn(folder);}finally{await rm(folder,{recursive:true,force:true});}
}
const manifest=hash=>({scope:"NCOS_CE_NONACCOUNTING",documents:[{sourceName:"example.pdf",expectedPdfSha256:hash}]});
test("real SHA256 bytes matched, no atomized JSONL or publication inferred",async()=>{
 await withFolder(async folder=>{
   const content=Buffer.from("%PDF-1.4\nsynthetic fixture\n");
   await writeFile(join(folder,"example.pdf"),content);
   const result=await checkOriginalPdfBytes(manifest(createHash("sha256").update(content).digest("hex")),folder);
   assert.equal(result.matched,1);assert.equal(result.failed,0);
   assert.equal(result.jsonlAtomizedContentVerified,false);assert.equal(result.publicationAuthorized,false);
 });
});
test("changed source PDF must fail integrity",async()=>{
 await withFolder(async folder=>{
   await writeFile(join(folder,"example.pdf"),Buffer.from("changed bytes"));
   const r=await checkOriginalPdfBytes(manifest("0".repeat(64)),folder);
   assert.equal(r.failed,1);assert.equal(r.results[0].reason,"SHA256_MISMATCH");
 });
});
test("missing PDF must fail integrity, not return PASS",async()=>{
 await withFolder(async folder=>{
   const r=await checkOriginalPdfBytes(manifest("a".repeat(64)),folder);
   assert.equal(r.failed,1);assert.equal(r.results[0].reason,"SOURCE_FILE_NOT_FOUND");
 });
});
test("prevent folder escape through filenames",async()=>{
 await withFolder(async folder=>{
   const bad={scope:"NCOS_CE_NONACCOUNTING",documents:[{sourceName:"../outside.pdf",expectedPdfSha256:"a".repeat(64)}]};
   await assert.rejects(()=>checkOriginalPdfBytes(bad,folder),/UNSAFE_SOURCE_FILENAME/);
 });
});
