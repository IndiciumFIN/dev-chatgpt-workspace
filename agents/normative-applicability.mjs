/**
 * WU-TRIB Normative Applicability Validator
 * Ensures normative catalog meets metadata rules from FONTES_E_NORMAS.
 */
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const root = process.cwd();
const normative = JSON.parse(readFileSync(resolve(root, "docs/homologacao/v1/referencias-normativas.v1.json"), "utf8"));
const findings = [];

function check(id, cond, msg) {
  if (!cond) findings.push({id, severity: "FAIL", message: msg});
}

check("NA-001", Array.isArray(normative.entries) && normative.entries.length >= 10, "Normative catalog must contain entries");
for (const n of normative.entries) {
  check(`NA-URL-${n.id}`, typeof n.url === "string" && n.url.startsWith("https://"), `URL must be HTTPS for ${n.id}`);
  check(`NA-BODY-${n.id}`, n.verifiedDocumentBody === false, `verifiedDocumentBody must be false for ${n.id}`);
  check(`NA-APP-${n.id}`, n.legalApplicability === "TO_ASSESS", `legalApplicability must be TO_ASSESS for ${n.id}`);
  check(`NA-STATUS-${n.id}`, ["REFERENCE_METADATA", "HOLD_SOURCE_CHECK"].includes(n.status), `Invalid status for ${n.id}`);
}

const output = {
  validator: "normative-applicability",
  version: "0.1.0",
  result: findings.length === 0 ? "PASS" : "FAIL",
  findings,
  entriesChecked: normative.entries.length,
  note: "Metadata only. Does not read or certify full normative texts."
};
console.log(JSON.stringify(output, null, 2));
process.exit(findings.length === 0 ? 0 : 1);
