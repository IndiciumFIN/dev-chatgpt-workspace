/** Deterministic source-page index: metadata only; content never published. */
import {createHash} from 'node:crypto';
export const SOURCE_CORPUS_SCHEMA='CE-SOURCE-CORPUS-INDEX-v1';
const HASH64=/^[a-f0-9]{64}$/;
const ACCEPTED_SOURCE='https://www.calculadorasdeenfermagem.com.br/';

export function examineSourcePage(filePath, raw, options={}) {
  const sha256=createHash('sha256').update(raw).digest('hex');
  const blobSha=createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');
  const problems=[];
  let doc;
  try{doc=JSON.parse(raw.toString('utf8'));}
  catch{problems.push('INVALID_JSON');doc={};}
  const filename=filePath.split('/').at(-1)?.replace(/\.json$/,'') ?? '';
  if(!HASH64.test(filename))problems.push('INVALID_SOURCE_FILENAME');
  if(!HASH64.test(String(doc.sha256||'')))problems.push('INVALID_SOURCE_SHA256_CLAIM');
  if(filename && doc.sha256!==filename)problems.push('FILENAME_SHA256_MISMATCH');
  if(typeof doc.arquivo!=='string'||!doc.arquivo.trim()||doc.arquivo.includes('..')||doc.arquivo.startsWith('/'))problems.push('INVALID_DOCUMENT_PATH');
  if(typeof doc.idioma!=='string'||!(/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(doc.idioma)))problems.push('INVALID_LOCALE');
  if(!Array.isArray(doc.secoes))problems.push('SECTIONS_MISSING');
  if(typeof doc.textoCompleto!=='string')problems.push('FULL_TEXT_MISSING');
  const canonical=typeof doc.metadados?.canonical==='string'?doc.metadados.canonical:null;
  if(canonical && !canonical.startsWith(ACCEPTED_SOURCE))problems.push('CANONICAL_OUTSIDE_PROJECT');
  const sourceDocumentPath=typeof doc.arquivo==='string'?doc.arquivo:'';
  const locale=typeof doc.idioma==='string'?doc.idioma:'';
  // The file-level JSON hash is verified above; doc.sha256 is a CLAIM about
  // the source HTML, which cannot be verified until that original is available.
  return {
    sourceFile:filePath,sourceBlobSha:blobSha,sourceJsonSha256:sha256,
    sourceHtmlSha256Claim:HASH64.test(String(doc.sha256||''))?doc.sha256:null,
    documentPath:sourceDocumentPath,locale,role:typeof doc.papel==='string'?doc.papel:null,
    canonical,sourceTitle:typeof doc.titulo==='string'?doc.titulo:null,
    sectionsCount:Array.isArray(doc.secoes)?doc.secoes.length:0,
    textLength:typeof doc.textoCompleto==='string'?doc.textoCompleto.length:0,
    hasLicenseEvidence:typeof doc.licenca==='string'&&doc.licenca.trim().length>0,
    identity:locale+'|'+sourceDocumentPath,
    structuralProblems:problems,
    clinicalStatus:'HOLD_HUMAN',rightsStatus:'NOT_VERIFIED',publicationAllowed:false,
  };
}
export function summarizeSourceIndex(entries, expectedCount) {
  const byLocale={};
  const issues={};
  const identities=new Map();
  let structuralValid=0,emptyTexts=0,licenseEvidenced=0;
  for(const e of entries){
    byLocale[e.locale||'UNKNOWN']=(byLocale[e.locale||'UNKNOWN']||0)+1;
    for(const p of e.structuralProblems)issues[p]=(issues[p]||0)+1;
    if(!e.structuralProblems.length)structuralValid++;
    if(!e.textLength)emptyTexts++;
    if(e.hasLicenseEvidence)licenseEvidenced++;
    const members=identities.get(e.identity)||[];members.push(e.sourceFile);identities.set(e.identity,members);
  }
  const duplicateIdentities=[...identities].filter(([_,list])=>list.length>1).map(([identity,paths])=>({identity,count:paths.length,paths}));
  return {expectedCount,observedCount:entries.length,complete:entries.length===expectedCount,
    structurallyValid:structuralValid,structuralProblemCount:entries.length-structuralValid,
    emptyTexts,licenseEvidenced,licenseUnverified:entries.length-licenseEvidenced,
    locales:byLocale,problems:issues,duplicateIdentityGroups:duplicateIdentities.length,
    duplicateIdentities:duplicateIdentities.slice(0,100),
    publicationAllowed:false,clinicalGate:'HOLD_HUMAN',rightsGate:'NOT_VERIFIED'};
}
