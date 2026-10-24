export type Role = "admin" | "commander" | "approver" | "owner" | "operator" | "security" | "auditor" | "agent";

export type RolePermission = {
  role: Role;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canArchive: boolean;
  canExecute: boolean;
  scopes: string[];
};

export const defaultRolePolicy: Record<Role, RolePermission> = {
  admin: { role: "admin", canCreate: true, canEdit: true, canApprove: true, canArchive: true, canExecute: true, scopes: ["*"] },
  commander: { role: "commander", canCreate: true, canEdit: true, canApprove: true, canArchive: false, canExecute: false, scopes: ["workflow","gate","policy"] },
  approver: { role: "approver", canCreate: false, canEdit: false, canApprove: true, canArchive: false, canExecute: false, scopes: ["approval"] },
  owner: { role: "owner", canCreate: true, canEdit: true, canApprove: true, canArchive: false, canExecute: true, scopes: ["work-order","approval"] },
  operator: { role: "operator", canCreate: true, canEdit: false, canApprove: false, canArchive: false, canExecute: true, scopes: ["execution"] },
  security: { role: "security", canCreate: false, canEdit: false, canApprove: true, canArchive: false, canExecute: false, scopes: ["security","finding"] },
  auditor: { role: "auditor", canCreate: false, canEdit: false, canApprove: false, canArchive: false, canExecute: false, scopes: ["audit","report"] },
  agent: { role: "agent", canCreate: false, canEdit: false, canApprove: false, canArchive: false, canExecute: true, scopes: ["agent-execution"] },
};
