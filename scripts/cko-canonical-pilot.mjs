/**
 * CKO canonical pilot: read-only diagnostic of two candidate tool graphs.
 * This is NOT a clinical engine, release policy, Supabase client or public API.
 * It is a reproducible evidence probe for existing CKO contracts and tables.
 * The only data input is a previously exported, provenance-scoped DB snapshot.
 *
 * node scripts/cko-canonical-pilot.mjs
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = resolve(projectRoot, "audit-evidence/cko/db-first/20261026/candidate-canonical-tool-graph.json");

export function loadCandidateSnapshot(path = snapshotPath) {
  const bytes = readFileSync(path);
  const data = JSON.parse(bytes.toString("utf8"));
  if (data?.policy !== "READ_ONLY_DIAGNOSTIC_NO_CLINICAL_RELEASE" ||
      data?.source !== "Supabase Calculadoras-Smart" ||
      !Array.isArray(data.records)) {
    throw Error("INVALID_OR_UNSCOPED_CKO_CANDIDATE_GRAPH");
  }
  const names = data.records.map(r => r.tool_slug);
  if (!names.length || new Set(names).size !== names.length ||
      !Array.isArray(data.in_scope) || data.in_scope.length !== names.length ||
      names.some(n => !data.in_scope.includes(n)) || data.records.some(r => r.candidate_only !== true)) {
    throw Error("PILOT_SCOPE_OR_DUPLICATE_ID");
  }
  return { data, sha256: createHash("sha256").update(bytes).digest("hex") };
}

const isReviewed = (value) => ["APPROVED", "ASSURED", "RELEASED"].includes(String(value ?? "").toUpperCase());
const hasRef = (value) => typeof value === "string" && value.trim().length > 0;

export function inspectGraph(tool) {
  if (!tool || tool.candidate_only !== true || !hasRef(tool.canonical_id)) {
    throw Error("INVALID_OR_NONCANDIDATE_TOOL_GRAPH");
  }
  const states = tool.tool_state ?? {};
  const run = tool.runtime_control ?? {};
  const claims = tool.claims ?? [];
  const fields = tool.fields ?? [];
  const bridges = tool.requirement_bridges ?? [];
  const findings = [];
  const block = (code, detail) => findings.push({ code, detail, blocking: true });

  if (states.source_of_truth !== true || states.canonical_promotion !== true)
    block("CKO_NOT_PROMOTED", "Master object/version not promoted.");
  if (states.publication_state !== "RELEASED")
    block("PUBLICATION_NOT_AUTHORIZED", states.publication_state);
  if (!isReviewed(states.clinical_review_status))
    block("CLINICAL_CHECKER_REQUIRED", states.clinical_review_status);
  if (!isReviewed(states.rights_state))
    block("RIGHTS_NOT_CLEARED", states.rights_state);
  if (!hasRef(run.object_engine_ref) || !hasRef(run.rule_pack_ref) || !hasRef(run.object_validator_ref))
    block("OBJECT_ENGINE_RULES_OR_VALIDATOR_MISSING", "Object-specific computation stack not materialized.");
  if (claims.length === 0 || claims.some(c => !isReviewed(c.status) || c.human_review_required))
    block("CLAIMS_NOT_HOMOLOGATED", claims.length + " bound claims; all must be reviewed.");
  const refs = claims.flatMap(c => Array.isArray(c.evidence_refs) ? c.evidence_refs : []);
  const foundRefs = new Set(bridges.filter(b => hasRef(b.requirement_id) && b.requirement_status).map(b => b.evidence_ref));
  if (refs.some(ref => !foundRefs.has(ref)) || bridges.length !== refs.length)
    block("EVIDENCE_NOT_RECONCILED", "Some direct claim refs are not resolved into requirements.");
  if (bridges.some(b => !isReviewed(b.requirement_status) || !isReviewed(b.extraction_status) || b.checker_recorded !== true))
    block("EVIDENCE_REVIEW_PENDING", "Requirement/extraction are candidates or lack a checker.");
  if (!fields.length) block("NO_INPUT_FIELDS", "No fields attached to candidate tool.");

  const diagnostic = {
    tool_slug: tool.tool_slug,
    canonical_id: tool.canonical_id,
    version_refs: tool.object_versions?.map(v => ({ id: v.version_id, version: v.version, state: v.state })) ?? [],
    fields: fields.length,
    claims: claims.length,
    evidence_refs: refs.length,
    bridged_refs: foundRefs.size,
    normative_roles: tool.normative_roles?.length ?? 0,
    findings,
    can_calculate: false, // Explicitly never enabled by this diagnostic package.
    can_publish: false,   // Authorization belongs to the admitted Kernel release.
    verdict: "HOLD",
  };
  return diagnostic;
}

/**
 * Mathematical enumeration of a user-supplied *candidate domain subset*.
 * Cannot be called by production tool evaluation; not exported as a score.
 * Requires exactly the requested option field IDs; no inference from labels.
 */
export function enumerateSyntheticDomains(tool, fieldIds) {
  if (!Array.isArray(fieldIds) || !fieldIds.length || new Set(fieldIds).size !== fieldIds.length) {
    throw Error("INVALID_SYNTHETIC_SCOPE");
  }
  const fields = fieldIds.map(id => tool.fields.find(f => f.field_id === id));
  if (fields.some(f => !f || !Array.isArray(f.enum_values) || !f.enum_values.length ||
      f.required_status !== "REQUIRED")) throw Error("NO_COMPLETE_CANDIDATE_DOMAIN");
  const domains = fields.map(f => f.enum_values.map(o => o.value));
  if (domains.some(ds => ds.some(v => !Number.isInteger(v)) ||
      new Set(ds).size !== ds.length)) throw Error("INVALID_CANDIDATE_DOMAIN");
  const combos = domains.reduce((rows, options) => rows.flatMap(row =>
    options.map(value => [...row, value])), [[]]);
  return { type: "SYNTHETIC_ENUM_ARITHMETIC", cases: combos.length,
    minimum: Math.min(...combos.map(row => row.reduce((a, b) => a+b, 0))),
    maximum: Math.max(...combos.map(row => row.reduce((a, b) => a+b, 0))),
    totals: [...new Set(combos.map(row => row.reduce((a,b) => a+b,0)))].sort((a,b)=>a-b),
    clinical_release_authorized: false };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { data, sha256 } = loadCandidateSnapshot();
  const diagnostics = data.records.map(inspectGraph);
  process.stdout.write(JSON.stringify({
    audit_id: "CKO-CANDIDATE-PILOT-RUN",
    captured_date: data.captured_date, snapshot_sha256: sha256,
    status: "HOLD", diagnostics,
    source: "Supabase read-only export; not a live DB connector",
  }, null, 2) + "\n");
  if (diagnostics.some(x => x.verdict !== "HOLD")) process.exitCode = 1;
}
