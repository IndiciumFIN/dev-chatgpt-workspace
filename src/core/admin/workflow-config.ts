export type WorkflowStateType = "draft" | "active" | "validation" | "release" | "closed";

export type AdminWorkflowState = {
  id: string;
  label: string;
  type: WorkflowStateType;
  requiresGate: boolean;
  requiredTemplates: string[];
  requiredNormatives: string[];
  requiredApprovals: string[];
  requiredValidators: string[];
  requiredEvidence: string[];
  status: "draft" | "active" | "archived";
};

export type AdminWorkflowTransition = {
  from: string;
  to: string;
  gate: string;
  requiresHumanApproval: boolean;
  allowedRoles: string[];
};

export type WorkflowConfig = {
  workflowId: string;
  name: string;
  version: string;
  states: AdminWorkflowState[];
  transitions: AdminWorkflowTransition[];
  status: "draft" | "active" | "archived";
  owner: string;
  approver: string;
  approvedAt?: string;
  hash: string;
};
