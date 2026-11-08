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

const validators = ["doc-governance.mjs", "normative-applicability.mjs", "meta-validator.mjs"];
for (const v of validators) {
  try {
    const content = readFileSync(resolve(root, "agents", v), "utf8");
    check(`MV-NET-${v}`, !/fetch|http\.request|axios|got|node-fetch/i.test(content), `${v} must not contain network calls`);
    check(`MV-AI-${v}`, !/openai|chatgpt|generative|llm|gpt-/i.test(content), `${v} must not reference generative AI`);
    check(`MV-APPROVE-${v}`, !/APPROVED|CONFORME|PASS FISCAL|sign-off/i.test(content), `${v} must not contain automatic approval language`);
    check(`MV-EXIT-${v}`, /process\.exit\(/.test(content), `${v} must use process.exit`);
    check(`MV-JSON-${v}`, /JSON\.stringify/.test(content), `${v} must produce JSON output`);
  } catch (e) {
    findings.push({id: `MV-READ-${v}`, severity: "FAIL", message: `Cannot read ${v}: ${e.message}`});
  }
}

const output = {
  validator: "meta-validator",
  version: "0.1.0",
  result: findings.length === 0 ? "PASS" : "FAIL",
  findings,
  note: "Self-check of validator design. Does not execute business logic."
};
console.log(JSON.stringify(output, null, 2));
process.exit(findings.length === 0 ? 0 : 1);
