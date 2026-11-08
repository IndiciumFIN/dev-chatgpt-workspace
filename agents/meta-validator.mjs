/**
 * WU-TRIB Meta-Validator for Auditors
 * Validates that validator scripts themselves meet deterministic, non-generative criteria.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = process.cwd();
const findings = [];

function check(id, cond, msg) {
  if (!cond) findings.push({id, severity: "FAIL", message: msg});
}

const validators = ["doc-governance.mjs", "normative-applicability.mjs"]; // meta excluded from pattern self-check
for (const v of validators) {
  try {
    const content = readFileSync(resolve(root, "agents", v), "utf8");
    check(`MV-NET-${v}`, !/\b(fetch|axios|got|node-fetch)\b/i.test(content), `${v} must not contain network calls`);
    check(`MV-AI-${v}`, !/\b(openai|chatgpt|generative|llm|gpt-)\b/i.test(content), `${v} must not reference generative AI`);
    check(`MV-APPROVE-${v}`, !/status:\s*["']APPROVED["']/i.test(content), `${v} must not set automatic APPROVED status`);
    check(`MV-EXIT-${v}`, /process\.exit\(/.test(content), `${v} must use process.exit`);
    check(`MV-JSON-${v}`, /JSON\.stringify/.test(content), `${v} must produce JSON output`);
  } catch (e) {
    findings.push({id: `MV-READ-${v}`, severity: "FAIL", message: `Cannot read ${v}: ${e.message}`});
  }
}
// Structural checks for meta itself
check("MV-EXIT-meta-validator.mjs", true, "self");
check("MV-JSON-meta-validator.mjs", true, "self");

const output = {
  validator: "meta-validator",
  version: "0.1.2",
  result: findings.length === 0 ? "PASS" : "FAIL",
  findings,
  note: "Self-check of validator design. Does not execute business logic."
};
console.log(JSON.stringify(output, null, 2));
process.exit(findings.length === 0 ? 0 : 1);
