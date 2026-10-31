/** Deterministic, read-only branch-file conflict helpers. No merges or writes. */
export const MIGRATION_SOURCE_TYPES = new Set([
  'historical','audit','backup','product','editorial','unrelated','governance-ui','header-ui',
  'i18n','integration','import-cko','planning','admin-preview','simulados','content-library'
]);

export function validateMigrationManifest(manifest) {
  const errors = [];
  if (manifest?.recordId !== 'CE-MAIN-CANONICAL-MIGRATION-SCOPE-20261031') errors.push('RECORD_ID');
  if (manifest?.releaseGate !== 'HOLD_HUMAN') errors.push('RELEASE_GATE');
  if (!Array.isArray(manifest?.branches)) errors.push('BRANCH_LIST_MISSING');
  else {
    if (manifest.branches.length < 1 || manifest.sourceBranchesCount !== manifest.branches.length) errors.push('SOURCE_COUNT_MISMATCH');
    if (new Set(manifest.branches.map(b => b.name)).size !== manifest.branches.length) errors.push('DUPLICATE_BRANCH');
    for (const b of manifest.branches) {
      if (typeof b.name !== 'string' || !/^[a-zA-Z0-9._/-]+$/.test(b.name) || b.name === 'main') errors.push('BAD_BRANCH_NAME');
      if (!MIGRATION_SOURCE_TYPES.has(b.category)) errors.push('UNKNOWN_CATEGORY');
      if (!['behind','ahead','diverged','no_common_ancestor'].includes(b.status)) errors.push('BAD_STATUS');
    }
  }
  return [...new Set(errors)];
}
/** Fail closed if the live remote branch universe is not exactly the declared one. */
export function reconcileBranchPopulation(expectedNames, observedNames) {
  if (!Array.isArray(expectedNames) || !Array.isArray(observedNames)) throw Error('INVALID_BRANCH_POPULATION');
  const valid = names => names.every(name => typeof name === 'string' && name.length > 0 && name !== 'main');
  if (!valid(expectedNames) || !valid(observedNames)) throw Error('INVALID_BRANCH_POPULATION');
  const expected = new Set(expectedNames), observed = new Set(observedNames);
  const duplicateExpected = expected.size !== expectedNames.length;
  const duplicateObserved = observed.size !== observedNames.length;
  return {
    expected: expectedNames.length,
    observed: observedNames.length,
    missing: [...expected].filter(name => !observed.has(name)).sort(),
    untracked: [...observed].filter(name => !expected.has(name)).sort(),
    duplicates: duplicateExpected || duplicateObserved,
    complete: !duplicateExpected && !duplicateObserved &&
      expected.size === observed.size && [...expected].every(name => observed.has(name))
  };
}

export function parseTree(text) {
  const files = new Map();
  for (const line of text.split('\0')) {
    if (!line) continue;
    const separator = line.indexOf('\t');
    if (separator < 0) throw Error('MALFORMED_LS_TREE');
    const metadata = line.slice(0, separator).split(' ');
    if (metadata.length !== 3 || metadata[1] !== 'blob' || !/^[a-f0-9]{40,64}$/.test(metadata[2])) continue;
    files.set(line.slice(separator+1), metadata[2]);
  }
  return files;
}
export function parseNameStatus(text) {
  const chunks = text.split('\0').filter(Boolean);
  const result = [];
  for(let i=0;i<chunks.length;){
    const status = chunks[i++];
    if(!/^[MADTCURX][0-9]*$/.test(status)) throw Error('BAD_GIT_DIFF_STATUS:'+status);
    const path = chunks[i++];
    if(!path) throw Error('BAD_GIT_DIFF_PATH');
    if(status[0] === 'R' || status[0] === 'C'){
      const to = chunks[i++];if(!to)throw Error('BAD_GIT_RENAME');
      result.push({status:status[0],path:to,previousPath:path});
    }else result.push({status:status[0],path});
  }
  return result;
}
export function classifyCandidateRisk(path) {
  const s=path.toLowerCase();
  // 8k+ pages are SOURCE CORPUS, not disposable build artifacts. Keep fully
  // traceable in quarantine until lineage, licensing, dedup and clinical checks.
  if(s.startsWith('artifacts/fonte/corpus/')) return 'SOURCE_CORPUS_HOLD';
  if(s.startsWith('artifacts/.tmp/') || s==='.node_modules.lock') return 'TEMP_ARTIFACT_QUARANTINE';
  if(s.startsWith('artifacts/')) return 'AUDIT_ARTIFACT_REVIEW';
  if(s.startsWith('imports/')) return 'SOURCE_IMPORT_HOLD';
  if(s.startsWith('bibliotecas-corpus/')) return 'SOURCE_LIBRARY_HOLD';
  if(s==='package.json'||s==='package-lock.json') return 'SECURITY_HOLD';
  if(/(?:^|\/)(?:migrations?|supabase|drizzle|prisma)(?:\/|$)|\.sql$/.test(s))return 'DATABASE_HOLD';
  if(/(?:^|\/)(?:auth|security|kernel|permissions?|secrets?)(?:\/|$)|(?:^|\/)(?:\.env|\.github\/workflows)/.test(s))return 'SECURITY_HOLD';
  if(/(?:^|\/)(?:cko|clinical|nanda|nic|noc|cofen|coren|medicamentos?|protocolos?|normativos?)(?:\/|$)/.test(s))return 'CLINICAL_HOLD';
  if(/(?:^|\/)(?:locales?|i18n|translations?|idiomas?)(?:\/|$)/.test(s))return 'I18N_VALIDATE';
  return 'CANDIDATE_REVIEW';
}
/**
 * candidateByBranch: [{ branch, paths:[{path,blob,status,alreadyInMain,risk}] }]
 * Conflicts are by different blob hash, not filename alone.
 */
export function detectMainMigrationCollisions(candidateByBranch) {
  const paths = new Map();
  for(const group of candidateByBranch){
    for(const entry of group.paths){
      if(entry.alreadyInMain)continue;
      const values = paths.get(entry.path) ?? [];
      values.push({branch:group.branch,blob:entry.blob ?? null,status:entry.status,risk:entry.risk});
      paths.set(entry.path,values);
    }
  }
  const collisions = [];
  const duplicates = [];
  for(const [path,sources] of paths){
    if(sources.length < 2)continue;
    const unique=new Set(sources.map(x=>x.blob??'DELETED'));
    (unique.size>1?collisions:duplicates).push({path,sources});
  }
  return {collisions:collisions.sort((a,b)=>a.path.localeCompare(b.path)),duplicates:duplicates.sort((a,b)=>a.path.localeCompare(b.path)),distinctPaths:paths.size};
}
