import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
/**
 * Reproducible user-supplied original-PDF byte verification, never contents.
 * This standalone verifier runs only when the operator has the actual bytes.
 */
export async function checkOriginalPdfBytes(manifest,folder) {
 if(manifest.scope!=="NCOS_CE_NONACCOUNTING"||!Array.isArray(manifest.documents))
   throw new Error("UNTRUSTED_RECOVERY_MANIFEST");
 if(!folder||typeof folder!=="string")throw new Error("SOURCE_FOLDER_REQUIRED");
 const base=resolve(folder),results=[];
 const names=new Set();
 for(const rec of manifest.documents){
   const name=rec.sourceName;
   if(typeof name!=="string"||basename(name)!==name||!name.toLowerCase().endsWith(".pdf")||
     name.includes("..")||name.includes("/")||name.includes("\\"))
     throw new Error("UNSAFE_SOURCE_FILENAME");
   if(names.has(name))throw new Error("DUPLICATE_SOURCE_FILENAME");
   names.add(name);
   const file=join(base,name);
   let actualSha256=null,actualBytes=null,error=null;
   try {
     const st=await stat(file);
     if(!st.isFile())throw new Error("NOT_FILE");
     actualBytes=st.size;
     const hasher=createHash("sha256");
     for await (const chunk of createReadStream(file))hasher.update(chunk);
     actualSha256=hasher.digest("hex");
   }catch(e){error=e?.code==="ENOENT"?"SOURCE_FILE_NOT_FOUND":String(e.message||e);}
   results.push({sourceName:name,expectedSha256:rec.expectedPdfSha256,
     observedSha256:actualSha256,actualBytes,
     bytesMatched:actualSha256!==null&&actualSha256===rec.expectedPdfSha256,
     reason:error||(actualSha256===rec.expectedPdfSha256?"MATCH":"SHA256_MISMATCH")});
 }
 const ok=results.filter(x=>x.bytesMatched).length;
 return {schemaVersion:"1.0.0",scope:manifest.scope,verificationKind:"INDEPENDENT_SOURCE_PDF_SHA256",
   total:results.length,matched:ok,failed:results.length-ok,
   jsonlAtomizedContentVerified:false,clinicalApproval:false,publicationAuthorized:false,results};
}
