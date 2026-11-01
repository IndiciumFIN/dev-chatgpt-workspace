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
 * Deprecated local gate. The status is metadata, not permission to invoke tools.
 * Do NOT re-enable until a trusted server verifies actor identity, WO admission,
 * manifest, signed policy bundle, permissions, expiry and evidence.
 */
export function canExecute(_gate: ExecutionGate | null): boolean {
  return false;
}
