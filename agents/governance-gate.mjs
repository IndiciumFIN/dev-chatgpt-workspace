/**
 * Agente corrigido: governance-gate.mjs
 * Valida presença de schema, risco residual e status.
 * COSO Monitoring | COBIT MEA01
 */
import { readdirSync, readFileSync } from 'fs';

const required = ['layout-c100.schema.json', 'layout-engine-spec.v1.json', 'crosscheck-engine-spec.v1.json'];
const files = readdirSync('artifacts');
let fail = false;
const findings = [];

for (const req of required) {
  if (!files.includes(req)) {
    findings.push({ issue: `Artefato obrigatório ausente: ${req}` });
    fail = true;
  }
}

for (const file of files.filter(f => f.endsWith('.json'))) {
  try {
    const content = JSON.parse(readFileSync(`artifacts/${file}`, 'utf8'));
    if (content.approved_by && content.approved_by !== 'NONE') {
      findings.push({ file, issue: 'approved_by inválido' });
      fail = true;
    }
    if (!content.residualRisk && !content.$schema) {
      findings.push({ file, issue: 'risco residual ou schema ausente' });
      fail = true;
    }
  } catch (e) {
    findings.push({ file, issue: 'JSON inválido' });
    fail = true;
  }
}

const result = { agent: 'governance-gate', status: fail ? 'FAIL' : 'PASS', findings };
console.log(JSON.stringify(result));
process.exit(fail ? 1 : 0);
