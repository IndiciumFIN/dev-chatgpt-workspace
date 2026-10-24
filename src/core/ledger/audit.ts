export type AuditLog = {
  id: string;
  category: "agent" | "kernel" | "broker" | "register" | "finding" | "archive";
  event: string;
  actor: string;
  target: string;
  at: string;
  payloadHash: string;
  signature: string;
};

export function appendAuditLog(list: AuditLog[], x: AuditLog): AuditLog[] {
  return [...list, x];
}
