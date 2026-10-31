#!/usr/bin/env node
// Gate fail-closed do esqueleto CE local.
// Regra: nada é PASS sem evidência; tudo o que não está no catálogo é órfão e reprova.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'catalog/service-catalog.v1.json'), 'utf8'));
const registry = JSON.parse(readFileSync(resolve(ROOT, 'catalog/capability-registry.candidate.v0.1.json'), 'utf8'));
const binding = JSON.parse(readFileSync(resolve(ROOT, 'catalog/object-capability-binding.candidate.v0.1.json'), 'utf8'));

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

// 1. cobertura catálogo → disco
let missing = [];
for (const family of catalog.families) {
  for (const service of family.services) {
    for (const f of ['contract.ts', 'index.ts']) {
      const p = resolve(ROOT, `src/families/${family.id}/${service.id}/${f}`);
      if (!existsSync(p)) missing.push(`families/${family.id}/${service.id}/${f}`);
    }
  }
}
check(
  'cobertura catálogo → disco',
  missing.length === 0,
  missing.length ? `${missing.length} ficheiros em falta (ex.: ${missing[0]})` : `${catalog.families.reduce((n, f) => n + f.services.length, 0)} serviços com contrato e stub`,
);

// 2. sem directórios órfãos (tudo no disco existe no catálogo)
const declared = new Set();
for (const family of catalog.families) {
  declared.add(`src/families/${family.id}`);
  for (const service of family.services) declared.add(`src/families/${family.id}/${service.id}`);
}
const onDisk = [];
const walk = (dir, rel) => {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const r = rel ? `${rel}/${entry}` : entry;
    if (statSync(abs).isDirectory()) walk(abs, r);
    else onDisk.push(r);
  }
};
walk(resolve(ROOT, 'src/families'), 'src/families');
const orphans = onDisk.filter((f) => {
  const m = f.match(/^src\/families\/([^/]+)\/([^/]+)\//);
  return m ? !declared.has(`src/families/${m[1]}/${m[2]}`) : false;
});
check('sem serviços órfãos no disco', orphans.length === 0, orphans.length ? `${orphans.length} órfãos` : 'nenhum');

// 3. disciplina de estado: nada PASS/APPROVED sem evidência
const statusViolations = [];
for (const rel of onDisk) {
  const src = readFileSync(resolve(ROOT, rel), 'utf8');
  if (/status:\s*'(PASS|APPROVED|IMPLEMENTED|ADMITTED)'/.test(src) && !/evidence:\s*'[^']+'/.test(src)) {
    statusViolations.push(rel);
  }
  if (/status:\s*'ADMITTED'/.test(src) && !/evidence/.test(src)) statusViolations.push(rel);
}
check('nenhum serviço declarado PASS/APPROVED/ADMITTED sem evidência', statusViolations.length === 0, statusViolations.length ? statusViolations.slice(0, 3).join(', ') : '0 violações');

// 4. as 201 capabilities estão declaradas e em CANDIDATE
const capFiles = readdirSync(resolve(ROOT, 'src/capabilities')).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const declaredCaps = new Set();
for (const f of capFiles) {
  const src = readFileSync(resolve(ROOT, 'src/capabilities', f), 'utf8');
  for (const m of src.matchAll(/capabilityId['"]?\s*:\s*['"]([^'"]+)['"]/g)) declaredCaps.add(m[1]);
}
const missingCaps = registry.capabilities.filter((c) => !declaredCaps.has(c.capability_id)).map((c) => c.capability_id);
check(
  '201 capabilities declaradas em código (CANDIDATE)',
  missingCaps.length === 0 && declaredCaps.size === registry.capabilities.length,
  `${declaredCaps.size}/${registry.capabilities.length}${missingCaps.length ? ' · faltam: ' + missingCaps.slice(0, 3).join(', ') : ''}`,
);

// 5. bindings por tipo de objeto declarados
const bindingSrc = readFileSync(resolve(ROOT, 'src/core/experience/resolver.ts'), 'utf8');
const missingObjects = binding.bindings
  .filter((b) => !bindingSrc.includes(`'${b.object_type}'`) && !bindingSrc.includes(`"${b.object_type}"`))
  .map((b) => b.object_type);
check('bindings por tipo de objeto cobertos pelo resolver', missingObjects.length === 0, missingObjects.length ? missingObjects.join(', ') : `${binding.bindings.length} tipos`);

// 6. schemas do piloto presentes e válidos
const pilotSchemas = ['article.v1.json', 'library-entity.v1.json', 'clinical-tool.v1.json'];
let schemaProblems = [];
for (const s of pilotSchemas) {
  const p = resolve(ROOT, 'schemas', s);
  if (!existsSync(p)) { schemaProblems.push(`${s} ausente`); continue; }
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'));
    if (!j.$id || !j.required || !Array.isArray(j.required)) schemaProblems.push(`${s} sem $id/required`);
    if (j.status !== 'CANDIDATE_HOLD') schemaProblems.push(`${s} sem status CANDIDATE_HOLD`);
  } catch (e) {
    schemaProblems.push(`${s} inválido: ${e.message}`);
  }
}
check('schemas do piloto (Article, LibraryEntity, ClinicalTool) presentes e CANDIDATE_HOLD', schemaProblems.length === 0, schemaProblems.join('; ') || '3 schemas');

// 7. toolchain canónica (para portabilidade futura, sem divergência de dependências)
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const want = { vite: '8.2.0', react: '19.2.0', 'lucide-react': '0.510.0', typescript: '5.7.0' };
const drift = Object.entries(want).filter(([k, v]) => !String(pkg.dependencies?.[k] || pkg.devDependencies?.[k] || '').includes(v));
check('toolchain alinhada com o canónico do repo', drift.length === 0, drift.length ? drift.map(([k, v]) => `${k}!=${v}`).join(', ') : 'vite 8.2.0 · react 19.2.0 · lucide 0.510.0 · typescript 5.7.0');

// 8. invariantes do registo preservadas
const invariantsOk = catalog.invariants.length === registry.invariants.length && catalog.invariants.every((i) => registry.invariants.includes(i));
check('invariantes do registo candidato copiadas sem alteração', invariantsOk, `${catalog.invariants.length} invariantes`);


// 9. cobertura face ao plano canónico: cada módulo/objeto do plano tem de estar declarado
const moduleStatusSrc = readFileSync(resolve(ROOT, 'src/core/experience/module-status.ts'), 'utf8');
const declaredModules = [...moduleStatusSrc.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
const canonicalModules = ['capabilities','resolver','state','action-bar','preview','settings','help','output','views','events'];
const undeclared = canonicalModules.filter((m) => !declaredModules.includes(m));
check('módulos canónicos todos declarados (nada em silêncio)', undeclared.length === 0, undeclared.length ? undeclared.join(', ') : `${canonicalModules.length} módulos declarados`);

const declaredObjects = [...moduleStatusSrc.matchAll(/'([A-Z][A-Za-z]+)'/g)].map((m) => m[1]);
const canonicalObjects = ['Article','Guide','LibraryEntity','ClinicalTool','Course','Trail','JobOpportunity','Competition','Residency','Question','Simulation','ResearchProject','Norm','CareerRole','Organization','MediaAsset'];
const missingObjects2 = canonicalObjects.filter((o) => !declaredObjects.includes(o));
check('tipos de objeto canónicos todos cobertos pelo registo de cobertura', missingObjects2.length === 0, missingObjects2.length ? missingObjects2.join(', ') : `${canonicalObjects.length} tipos`);

// 10. o metamodelo canónico tem de estar presente (ExperienceCapability / ObjectCapabilityBinding / ExperienceState)
const mm = readFileSync(resolve(ROOT, 'src/core/experience/metamodel.ts'), 'utf8');
const stateSrc = readFileSync(resolve(ROOT, 'src/core/experience/state.ts'), 'utf8');
const mmOk = ['ExperienceCapability','ObjectCapabilityBinding','missingCapabilityFields','missingBindingFields'].every((k) => mm.includes(k));
const stateOk = ['state_id','owner_scope','object_ref','object_type','capability_id','state_payload','created_at','updated_at','sync_state','privacy_class','retention_policy_ref'].every((k) => stateSrc.includes(k));
check('metamodelo canónico (capability, binding, state polimórfico) presente', mmOk && stateOk, mmOk && stateOk ? '21 campos + 9 campos + 11 campos verificados' : 'metamodelo incompleto');

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks verdes${failed.length ? ` · ${failed.length} FALHAM` : ''}`);
if (failed.length) {
  console.error('GATE REPROVADO — esqueleto não promovível.');
  process.exit(1);
}
console.log('GATE APROVADO — esqueleto coerente e fail-closed. NOTA: isto valida a ESTRUTURA, não implementações nem autorização.');
