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

export function createFinding(input: Omit<Finding, "hash" | "signature">): Finding {
  const hash = `finding:${input.id}:${input.createdAt}`;
  return {
    ...input,
    hash,
    signature: `kernel:${input.id}:${hash}`,
  };
}
