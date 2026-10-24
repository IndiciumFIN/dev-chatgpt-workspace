export type GovernanceAuditEntry = {
  id: string;
  kind: string;
  entityId: string;
  outcome: "admit" | "hold" | "reject";
  reason: string;
  hash: string;
  createdAt: string;
};

export function appendAuditEntry(list: GovernanceAuditEntry[], entry: GovernanceAuditEntry): GovernanceAuditEntry[] {
  return [...list, entry];
}
