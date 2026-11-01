export type ServiceOrderStatus =
  | "draft"
  | "planned"
  | "pilot"
  | "approved_for_development"
  | "in_development"
  | "ready_for_test"
  | "in_test"
  | "approved_for_production"
  | "in_production"
  | "closed"
  | "rejected"
  | "revoked";

export type WorkOrderType =
  | "planning"
  | "pilot"
  | "development"
  | "test"
  | "production"
  | "rollback";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type DataClassification = "public" | "internal" | "confidential" | "restricted";
export type SecurityImpact = "none" | "low" | "medium" | "high";

export type PolicyRule = {
  id: string;
  code: string;
  description: string;
  version: string;
  active: boolean;
  scope: "global" | "content" | "template" | "preview" | "deploy";
};

export type EvidenceRecord = {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  hash: string;
  actor: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export type ApprovalRecord = {
  id: string;
  approver: string;
  decision: "approved" | "rejected" | "hold";
  reason?: string;
  approvedAt: string;
};

export type WorkOrder = {
  id: string;
  type: WorkOrderType;
  title: string;
  objective: string;
  scope: string;
  owner: string;
  approver: string;
  sourceRef: string;
  /** Legacy drafts may omit these, but admission requires both. */
  findRef?: string;
  taskRef?: string;
  policySet: string[];
  riskLevel: RiskLevel;
  dataClassification: DataClassification;
  securityImpact: SecurityImpact;
  environment: "planning" | "pilot" | "dev" | "test" | "prod";
  status: ServiceOrderStatus;
  manifestId?: string;
  hash?: string;
  dependencies: string[];
  acceptanceCriteria: string[];
  evidence: EvidenceRecord[];
  approvals: ApprovalRecord[];
  rollbackPlan?: string;
  createdAt: string;
  updatedAt: string;
};

export type Manifest = {
  id: string;
  serviceOrderId: string;
  version: string;
  state: string;
  hash: string;
  validators: string[];
  policySet: string[];
  status: "draft" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
};

export type KernelDecision =
  | { outcome: "admit"; reason: string; evidenceHash: string; policyDecisionRef?: string }
  | { outcome: "hold"; reason: string; evidenceHash?: string }
  | { outcome: "reject"; reason: string; evidenceHash?: string };
