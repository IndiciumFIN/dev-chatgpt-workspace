import type { KernelDecision } from "./types";

/** Read-only authorization predicate. A positive result is a preflight only:
 * the trusted backend MUST independently verify the persisted admission,
 * policy version, actor identity, expiry and tool permissions before execution.
 */
export type CandidateAgentGrant = {
  agentId: string;
  toolRef: string;
  workOrderId: string;
  policyId: string;
  readAllowed: boolean;
  writeAllowed: boolean;
  enabled: boolean;
  expiresAt: string;
  approvalDecisionRef: string;
};
export type CandidateAgent = {
  canonicalId: string;
  reads: string[];
  writes: string[];
  toolAllowlist: string[];
  failurePolicy: "FAIL_CLOSED" | "HOLD_HUMAN" | "CONTINUE_SCOPED_LIMITATION";
  makerCheckerAuditorRole: "MAKER" | "CHECKER" | "AUDITOR" | "ORCHESTRATOR";
};
export type AgentToolRequest = {
  agent: CandidateAgent;
  grant: CandidateAgentGrant | null;
  toolRef: string;
  workOrderId: string;
  operation: "read" | "write";
  admission: KernelDecision & { policyDecisionRef?: string };
  decisionEvidenceRef: string;
  evaluatedAt: string;
};
export type AgentToolDecision = { allowed: false; reason: string } |
  { allowed: true; reason: "preflight-only-never-execute-without-server"; admissionRef: string };

/** No LLM-generated scope, policy, or self-approval is accepted. */
export function checkAgentToolPreflight(request: AgentToolRequest): AgentToolDecision {
  const deny = (reason: string): AgentToolDecision => ({ allowed: false, reason });
  const { agent, grant, admission, workOrderId, toolRef, operation } = request;
  if (!agent || !grant) return deny("agent-grant-required");
  if (!grant.enabled || grant.agentId !== agent.canonicalId ||
      grant.toolRef !== toolRef || grant.workOrderId !== workOrderId) {
    return deny("grant-scope-mismatch");
  }
  if (!agent.toolAllowlist.includes(toolRef) || !grant.policyId || !grant.approvalDecisionRef) {
    return deny("tool-approval-or-policy-missing");
  }
  if (agent.failurePolicy !== "FAIL_CLOSED") return deny("unsafe-agent-failure-policy");
  if (!Number.isFinite(Date.parse(grant.expiresAt)) ||
      !Number.isFinite(Date.parse(request.evaluatedAt)) ||
      Date.parse(grant.expiresAt) <= Date.parse(request.evaluatedAt)) {
    return deny("agent-grant-expired");
  }
  if (admission?.outcome !== "admit" || !admission.policyDecisionRef ||
      admission.policyDecisionRef !== request.decisionEvidenceRef) {
    return deny("kernel-admission-evidence-required");
  }
  if (operation === "write") {
    if (!grant.writeAllowed || !agent.writes.includes(toolRef)) return deny("write-not-authorized");
    if (agent.makerCheckerAuditorRole !== "MAKER") return deny("role-not-authorized-for-write");
  } else if (!grant.readAllowed || !agent.reads.includes(toolRef)) {
    return deny("read-not-authorized");
  }
  return {
    allowed: true,
    reason: "preflight-only-never-execute-without-server",
    admissionRef: admission.policyDecisionRef,
  };
}
