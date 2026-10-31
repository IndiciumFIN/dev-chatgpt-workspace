import { test } from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateMigrationManifest,parseTree,parseNameStatus,classifyCandidateRisk,detectMainMigrationCollisions,reconcileBranchPopulation} from './lib/main-migration-core.mjs';

const manifest=JSON.parse(readFileSync('registers/governance/main-migration-scope.v1.json','utf8'));
test('scope contains a controlled, versioned branch universe with explicit HOLD',()=>{
  assert.deepEqual(validateMigrationManifest(manifest),[]);
  assert.equal(manifest.branches.length,manifest.sourceBranchesCount);
  for(const [status,count] of Object.entries(manifest.classificationCounts)) {
    assert.equal(manifest.branches.filter(x=>x.status===status).length,count);
  }
});
test('scope cannot declare unauthorized release or a duplicate branch',()=>{
  const broken=structuredClone(manifest);broken.releaseGate='APPROVED';
  broken.branches[1].name=broken.branches[0].name;
  assert.ok(validateMigrationManifest(broken).includes('RELEASE_GATE'));
  assert.ok(validateMigrationManifest(broken).includes('DUPLICATE_BRANCH'));
});
test('git tree parsing retains real blob hash and non-ASCII paths',()=>{
  const a='a'.repeat(40),b='b'.repeat(40);
  const got=parseTree('100644 blob '+a+'\tconteúdo/enfermagem.json\0'+'100755 blob '+b+'\tscripts/a.sh\0');
  assert.equal(got.get('conteúdo/enfermagem.json'),a);
  assert.equal(got.get('scripts/a.sh'),b);
});
test('git name-status parser handles renames and deletions with NUL delimiting',()=>{
  assert.deepEqual(parseNameStatus('M\0src/x.ts\0D\0old.md\0R100\0before.js\0after.js\0'),[
    {status:'M',path:'src/x.ts'}, {status:'D',path:'old.md'}, {status:'R',path:'after.js',previousPath:'before.js'}
  ]);
  assert.throws(()=>parseNameStatus('Z\0a\0'),/BAD_GIT_DIFF_STATUS/);
});
test('database, security, clinical and i18n are not silently publishable',()=>{
  assert.equal(classifyCandidateRisk('supabase/migrations/001.sql'),'DATABASE_HOLD');
  assert.equal(classifyCandidateRisk('src/lib/auth/client.ts'),'SECURITY_HOLD');
  assert.equal(classifyCandidateRisk('content/cko/medicamentos.json'),'CLINICAL_HOLD');
  assert.equal(classifyCandidateRisk('src/locales/de.json'),'I18N_VALIDATE');
  assert.equal(classifyCandidateRisk('artifacts/fonte/corpus/paginas/abc.json'),'SOURCE_CORPUS_HOLD');
  assert.equal(classifyCandidateRisk('artifacts/.tmp/mcp-results/a.json'),'TEMP_ARTIFACT_QUARANTINE');
  assert.equal(classifyCandidateRisk('imports/drive/raw.json'),'SOURCE_IMPORT_HOLD');
  assert.equal(classifyCandidateRisk('bibliotecas-corpus/library.md'),'SOURCE_LIBRARY_HOLD');
  assert.equal(classifyCandidateRisk('package-lock.json'),'SECURITY_HOLD');
  assert.equal(classifyCandidateRisk('src/components/site/shell.tsx'),'CANDIDATE_REVIEW');
});
test('identical file hashes deduplicate and conflicting blobs block canonical overwrite',()=>{
  const a='a'.repeat(40), b='b'.repeat(40);
  const found=detectMainMigrationCollisions([
    {branch:'A',paths:[{path:'src/x.ts',blob:a,status:'M',risk:'CANDIDATE_REVIEW'},
      {path:'content/y.md',blob:a,status:'A',risk:'CLINICAL_HOLD'},
      {path:'src/main.ts',blob:a,status:'M',alreadyInMain:true,risk:'CANDIDATE_REVIEW'}]},
    {branch:'B',paths:[{path:'src/x.ts',blob:b,status:'M',risk:'CANDIDATE_REVIEW'},
      {path:'content/y.md',blob:a,status:'A',risk:'CLINICAL_HOLD'}]}
  ]);
  assert.equal(found.collisions.length,1);
  assert.equal(found.collisions[0].path,'src/x.ts');
  assert.equal(found.duplicates.length,1);
  assert.equal(found.duplicates[0].path,'content/y.md');
  assert.equal(found.distinctPaths,2);
});
test('missing blob and deletion cannot be mistaken for a clean duplicate',()=>{
  const found=detectMainMigrationCollisions([
    {branch:'A',paths:[{path:'a',blob:null,status:'D',risk:'CANDIDATE_REVIEW'}]},
    {branch:'B',paths:[{path:'a',blob:'b'.repeat(40),status:'M',risk:'CANDIDATE_REVIEW'}]}
  ]);
  assert.equal(found.collisions.length,1);
});

test('live branch population must include every manifest source and forbid untracked refs',()=>{
  const declared=manifest.branches.map(b=>b.name);
  assert.equal(reconcileBranchPopulation(declared,[...declared].reverse()).complete,true);
  assert.deepEqual(reconcileBranchPopulation(declared,declared.slice(1)).missing,[declared[0]]);
  assert.deepEqual(reconcileBranchPopulation(declared,[...declared,'unexpected/new']).untracked,['unexpected/new']);
  assert.equal(reconcileBranchPopulation(declared,[...declared,declared[0]]).complete,false);
  assert.throws(()=>reconcileBranchPopulation(declared,['main',...declared]),/INVALID_BRANCH_POPULATION/);
});

test('a new branch requires scope reconciliation instead of a hardcoded total of 23',()=>{
  const next=structuredClone(manifest);
  next.branches.push({...next.branches[0],name:'new-work-item'});
  next.sourceBranchesCount=next.branches.length;
  assert.deepEqual(validateMigrationManifest(next),[]);
  next.sourceBranchesCount--;
  assert.ok(validateMigrationManifest(next).includes('SOURCE_COUNT_MISMATCH'));
});

test('historical migration records cannot pass as live authority',()=>{
  const scope=manifest.snapshotSemantics;
  const audit=JSON.parse(readFileSync('registers/governance/main-migration-audit-20261031.v1.json','utf8'));
  assert.equal(scope.classification,'HISTORICAL_POINT_IN_TIME_NOT_LIVE_GATE');
  assert.equal(audit.snapshotSemantics.classification,'HISTORICAL_SUPERSEDED_FOR_CURRENT_PATH_COUNTS');
  assert.equal(scope.requiresFreshRunAfterHeadChanges,true);
  assert.equal(audit.snapshotSemantics.newHeadRequiresRevalidation,true);
  assert.equal(audit.releasePolicy.historicalCountsNotCurrent,true);
  assert.equal(scope.releaseGate,'HOLD_HUMAN');
  assert.equal(audit.snapshotSemantics.releaseGate,'HOLD_HUMAN');
  assert.match(scope.lastCompleteRuntimeAudit.auditedHeadSha,/^[a-f0-9]{40}$/);
  assert.equal(scope.lastCompleteRuntimeAudit.auditedHeadSha,audit.snapshotSemantics.lastReviewedSnapshot.sourceHeadSha);
  assert.equal(scope.lastCompleteRuntimeAudit.collisionPaths,audit.snapshotSemantics.lastReviewedSnapshot.collisions);
  assert.equal(scope.lastCompleteRuntimeAudit.duplicatePaths,audit.snapshotSemantics.lastReviewedSnapshot.duplicates);
  assert.equal(audit.snapshotSemantics.lastReviewedSnapshot.releaseAuthorized,false);
  assert.match(scope.currentAuthority,/every new task/i);
});

test('read-only branch auditor never persists git checkout credentials',()=>{
  const workflow=readFileSync('.github/workflows/ce-main-migration-audit.yml','utf8');
  assert.match(workflow,/persist-credentials:\s*false/);
  assert.doesNotMatch(workflow,/persist-credentials:\s*true/);
  assert.match(workflow,/permissions:\s*\n\s*contents:\s*read/);
});
