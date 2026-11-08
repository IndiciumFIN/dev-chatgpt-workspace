/**
 * Agente: governance-gate.mjs
 * Especialização: Gates de promoção
 * Suporte: Política documental, HOLD_HUMAN | COSO Monitoring
 * Premissa: Bloqueia qualquer aprovação automática.
 */
import { readdirSync, readFileSync } from 'fs';

const artifacts = readdirSync('artifacts').filter(f => f.endsWith('.json'));
let fail = false;
const findings = [];

for (const file of artifacts) {
  const content = JSON.parse(readFileSync(`artifacts/${file}`, 'utf8'));
  if (content.approved_by && content.approved_by !== 'NONE') {
    findings.push({ file, issue: 'approved_by não é NONE' });
    fail = true;
  }
  if (content.status && !['TEMPLATE', 'DRAFT'].includes(content.status)) {
    findings.push({ file, issue: 'status não é TEMPLATE/DRAFT' });
    fail = true;
  }
}

const result = { agent: 'governance-gate', status: fail ? 'FAIL' : 'PASS', findings };
console.log(JSON.stringify(result));
process.exit(fail ? 1 : 0);
