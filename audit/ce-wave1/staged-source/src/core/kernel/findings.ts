export type Severity = "info" | "warning" | "critical" | "blocker";
export type FindingStatus = "open" | "in_review" | "resolved" | "closed";
export type Finding = {
  id: string;
  workflowId?: string;
  workOrderId?: string;
  artifactId?: string;
  artifactType?: string;
  severity: Severity;
  title: string;
  description: string;
  reason: string;
  status: FindingStatus;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  hash: string;
  signature: string;
};

/** Draft finding only. The trusted evidence subsystem must hash and sign separately. */
export function createFinding(input: Omit<Finding, "hash" | "signature">): Finding {
  if (!input.id || !input.reason || !input.createdBy || !input.createdAt) {
    throw new Error("INVALID_FIND_CANDIDATE");
  }
  return { ...input, hash: "", signature: "" };
}
