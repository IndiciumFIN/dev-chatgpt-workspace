/**
 * CKO pilot governance contract consistency. This test does not admit a task or
 * work order in the Kernel; it confirms candidate records are linked and blocked.
 * No DB credentials and no writes.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = file => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const base = "registers/governance/candidates/";
const findSchema = read("contracts/cko-schemas/find.schema.json");
const taskSchema = read("contracts/cko-schemas/task.schema.json");
const woSchema = read("contracts/cko-schemas/work_order.schema.json");
const ids = ["RUNTIME", "RULE", "EVIDENCE", "FUGULIN"];

function validateBasicSchema(schema, object) {
  for (const field of schema.required ?? []) assert.ok(Object.hasOwn(object, field), "Missing " + field);
  if (schema.additionalProperties === false)
    for (const field of Object.keys(object)) assert.ok(Object.hasOwn(schema.properties, field), "Unknown " + field);
  for (const [field, property] of Object.entries(schema.properties ?? {})) {
    if (!Object.hasOwn(object, field)) continue;
    const value = object[field];
    if (property.enum) assert.ok(property.enum.includes(value), "Invalid enum " + field);
    if (property.const) assert.equal(value, property.const, "Invalid const " + field);
    if (property.type === "string") {
      assert.equal(typeof value, "string", "Invalid string " + field);
      if (property.minLength) assert.ok(value.length >= property.minLength, "Invalid minimum " + field);
      if (property.pattern) assert.match(value, new RegExp(property.pattern), "Invalid identifier " + field);
      if (property.format === "date") assert.match(value, /^\d{4}-\d{2}-\d{2}$/, "Invalid date " + field);
    }
    if (property.type === "array") {
      assert.ok(Array.isArray(value), "Invalid array " + field);
      if (property.items?.type === "string") assert.ok(value.every(x => typeof x === "string" && x.length > 0));
    }
  }
}

test("all four findings are candidate-only and conform to existing contract", () => {
  for (const id of ids) {
    const name = id === "FUGULIN" ? "FIND-CKO-FUGULIN-VARIANTS-20261026" : "FIND-CKO-DB-FIRST-"+id+"-20261026";
    const f = read(base+name+".json");
    validateBasicSchema(findSchema, f);
    assert.equal(f.canonical_id, name);
    assert.equal(f.status, "CANDIDATE");
    assert.equal(f.root_cause_status, "PENDING");
    assert.ok(f.evidence_refs.length > 0);
  }
});

test("tasks and WOs maintain FIND→policy→validator→task→WO dependency, Kernel not admitted", () => {
  for (const id of ids) {
    const task = read(base+"TASK-CKO-PILOT-"+id+"-20261026.json");
    const wo = read(base+"WO-CKO-PILOT-"+id+"-20261026.json");
    validateBasicSchema(taskSchema, task);
    validateBasicSchema(woSchema, wo);
    assert.equal(task.find_ref, wo.find_id);
    assert.equal(task.policy_ref, wo.policy_ref);
    assert.equal(task.validator_ref, wo.validator_ref);
    assert.equal(task.work_order_ref, wo.canonical_id);
    assert.equal(wo.task_ref, task.canonical_id);
    assert.equal(task.validator_ref, "PENDING_ADMISSION");
    assert.equal(wo.kernel_admission, "NOT_SUBMITTED");
    assert.equal(wo.execution_status, "BLOCKED");
    assert.equal(wo.status, "HOLD_HUMAN");
    assert.ok(wo.scope.some(x=>x.includes("NO_CLINICAL_WRITE_OR_PUBLIC_RELEASE")));
    assert.ok(task.acceptance_tests.length >= 3);
  }
});

test("PMO uses existing canonical queue, records technical pilot and keeps human dependency", () => {
  const q = read("registers/pmo/queue.v1.json");
  assert.equal(q.readOnly, true);
  assert.equal(q.canonicalSource, "registers/pmo/queue.v1.json");
  assert.equal(new Set(q.items.map(x=>x.id)).size, q.items.length);
  const wo = q.items.find(x=>x.id==="WO-CKO-001");
  assert.equal(wo.status,"IN_PROGRESS");
  assert.ok(wo.next.includes("HOLD") || wo.next.includes("Kernel"));
  assert.ok(wo.evidence.some(x=>x.includes("/actions/runs/40426209660")));
  const last = q.events.filter(x=>x.workId==="WO-CKO-001").at(-1);
  assert.equal(last.to, wo.status);
  const human = q.items.find(x=>x.id==="WO-HOM-001");
  assert.equal(human.status, "HOLD_HUMAN");
});

test("source and consent gates cannot be bypassed by synthetic replay PASS", () => {
  const graph = read("audit-evidence/cko/db-first/20261026/candidate-canonical-tool-graph.json");
  const checks = read("audit-evidence/cko/db-first/20261026/independent-replay-checks.json");
  assert.equal(checks.summary.clinical_authorization,false);
  assert.ok(graph.records.every(x=>x.candidate_only &&
    x.tool_state.source_of_truth === false &&
    x.tool_state.publication_state === "HOLD"));
});
