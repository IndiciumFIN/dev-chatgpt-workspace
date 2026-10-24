export type ServiceOrderStatus =
  | "draft"
  | "pending"
  | "in_review"
  | "rejected"
  | "admitted"
  | "preview"
  | "approved"
  | "deployed"
  | "revoked";

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

export type ServiceOrder = {
  id: string;
  type: string;
  title: string;
  owner: string;
  scope: string;
  sourceRef: string;
  policySet: string[];
  status: ServiceOrderStatus;
  createdAt: string;
  manifestId?: string;
  evidence: EvidenceRecord[];
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
  | { outcome: "admit"; reason: string; evidenceHash: string }
  | { outcome: "hold"; reason: string; evidenceHash?: string }
  | { outcome: "reject"; reason: string; evidenceHash?: string };
