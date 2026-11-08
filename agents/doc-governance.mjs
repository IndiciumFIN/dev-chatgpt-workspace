/**
 * WU-TRIB Document Governance Validator
 * Deterministic checks for policy compliance on status, segregation, sources.
 * Does NOT approve documents or conclude fiscal/legal compliance.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = process.cwd();
const rel = "docs/homologacao/v1/";

function load(p) { return readFileSync(resolve(root, p), "utf8"); }
function json(p) { return JSON.parse(load(p)); }

const registry = json(rel + "registro-documental.v1.json");
const findings = [];

function check(id, cond, msg) {
  if (!cond) findings.push({id, severity: "FAIL", message: msg});
  return cond;
}

check("DG-001", registry.recordState === "DRAFT", "Registry must be DRAFT");
check("DG-002", registry.documentaryCoverage.approvedTemplates === 0, "No approved templates allowed yet");
check("DG-003", registry.documentaryCoverage.evaluatedHumanSignoffs === 0, "No human sign-offs evaluated");

for (const e of [...registry.inventory.governanceDocs, ...registry.inventory.templates]) {
  const content = load(e.path);
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  check(`DG-FM-${e.id || e.documentId}`, !!fm, `Frontmatter missing in ${e.path}`);
  if (fm) {
    const meta = Object.fromEntries(fm[1].split(/\r?\n/).filter(Boolean).map(l => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }));
    check(`DG-STATUS-${e.id || e.documentId}`, ["TEMPLATE", "DRAFT"].includes(meta.status), `Invalid status in ${e.path}`);
    check(`DG-APPROVED-BY-${e.id || e.documentId}`, meta.approved_by === "NONE", `approved_by must be NONE in ${e.path}`);
    check(`DG-APPROVED-AT-${e.id || e.documentId}`, meta.approved_at === "NONE", `approved_at must be NONE in ${e.path}`);
  }
}

const output = {
  validator: "doc-governance",
  version: "0.1.0",
  result: findings.length === 0 ? "PASS" : "FAIL",
  findings,
  checkedAt: new Date().toISOString(),
  note: "Structural governance checks only. No content review, no approval, no fiscal conclusion."
};
console.log(JSON.stringify(output, null, 2));
process.exit(findings.length === 0 ? 0 : 1);
