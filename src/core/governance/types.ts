/**
 * Tipos da governança. O kernel fala a mesma língua dos dois lados:
 * a work order da plataforma governada e a linha do banco vivo.
 *
 * A forma vem de `origin/preview/central-comando-20261026:src/core/governance/types.ts`
 * (leitura, não checkout). A diferença em relação a lá: a regra de política
 * carrega o próprio efeito (allow/deny), porque o kernel precisa negar antes
 * de perguntar a quem decide.
 */

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

export type PolicyEffect = "allow" | "deny";

export type PolicyRule = {
  id: string;
  code: string;
  description: string;
  version: string;
  active: boolean;
  /** Efeito da regra. Uma regra `deny` no conjunto do pedido derruba o pedido. */
  effect: PolicyEffect;
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
  /** Dono do pedido. A aprovação tem que vir de outra pessoa que este dono. */
  owner: string;
  /** Aprovador nomeado. Nunca `kernel`. */
  approver: string;
  /** De onde veio o pedido. Sem referência de origem, o pedido não fecha. */
  sourceRef: string;
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
  /** Tem que ser o mesmo id da ordem que pede a admissão. */
  serviceOrderId: string;
  version: string;
  state: string;
  /** sha256 do conteúdo que o manifesto amarra. */
  hash: string;
  /** Conjunto de validadores. Tem que ser igual ao do pedido. */
  validators: string[];
  policySet: string[];
  status: "draft" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
};

export type KernelDecision =
  | { outcome: "admit"; reason: string; evidenceHash: string; policyDecisionRef: string }
  | { outcome: "hold"; reason: string; evidenceHash?: string }
  | { outcome: "reject"; reason: string; evidenceHash?: string };
