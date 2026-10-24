export type GateStatus = "draft" | "homologated" | "approved" | "rejected" | "revoked";

export type ExecutionGate = {
  id: string;
  workOrderId: string;
  sourceId: string;
  toolId: string;
  templateId: string;
  policyBundleId: string;
  manifestId?: string;
  status: GateStatus;
  approvedBy: string;
  approvedAt?: string;
  hash: string;
};

export function canExecute(gate: ExecutionGate | null): boolean {
  if (!gate) return false;
  return gate.status === "homologated" || gate.status === "approved";
}
