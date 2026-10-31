import { test } from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateMigrationManifest,parseTree,parseNameStatus,classifyCandidateRisk,detectMainMigrationCollisions} from './lib/main-migration-core.mjs';

const manifest=JSON.parse(readFileSync('registers/governance/main-migration-scope.v1.json','utf8'));
test('scope includes exactly 23 distinct versioned branches with explicit HOLD',()=>{
  assert.deepEqual(validateMigrationManifest(manifest),[]);
  assert.equal(manifest.branches.filter(x=>x.status==='ahead').length,11);
  assert.equal(manifest.branches.filter(x=>x.status==='diverged').length,8);
  assert.equal(manifest.branches.filter(x=>x.status==='no_common_ancestor').length,2);
  assert.equal(manifest.branches.filter(x=>x.status==='behind').length,2);
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
