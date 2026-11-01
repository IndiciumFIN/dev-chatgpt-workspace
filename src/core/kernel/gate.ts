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

/**
 * Legacy client-side gate has no trusted Kernel admission or signature verifier.
 * Never expose a status-only boolean as permission to execute remotely.
 * An authenticated server-side gate may replace this once independently tested.
 */
export function canExecute(_gate: ExecutionGate | null): boolean {
  return false;
}
