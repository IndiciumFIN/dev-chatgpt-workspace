export type FrameworkName =
  | "COSO"
  | "COBIT"
  | "ISO27001"
  | "ISO31000"
  | "NIST-CSF"
  | "ITIL";

export type ComplianceSeverity = "warning" | "critical" | "blocker";

export type NormativeRule = {
  id: string;
  framework: FrameworkName;
  ruleCode: string;
  description: string;
  requiredEvidence: string[];
  validator: string;
  severity: ComplianceSeverity;
  onFail: "hold" | "reject" | "finding";
};

export const normativeCatalog: Record<string, NormativeRule> = {
  "cso-risk-ownership": {
    id: "cso-risk-ownership",
    framework: "COSO",
    ruleCode: "COSO-ERM-01",
    description: "Risco deve possuir owner explícito.",
    requiredEvidence: ["risk-owner", "risk-register"],
    validator: "risk-owner-validator",
    severity: "critical",
    onFail: "reject",
  },
  "cso-control-evidence": {
    id: "cso-control-evidence",
    framework: "COSO",
    ruleCode: "COSO-IC-02",
    description: "Controle interno exige evidência do processo.",
    requiredEvidence: ["control-evidence", "approval-log"],
    validator: "control-evidence-validator",
    severity: "critical",
    onFail: "reject",
  },
  "cobit-governance": {
    id: "cobit-governance",
    framework: "COBIT",
    ruleCode: "COBIT-EDM03",
    description: "Governança de TI deve ter owner e policy bundle.",
    requiredEvidence: ["governance-policy", "approver-role"],
    validator: "governance-validator",
    severity: "critical",
    onFail: "reject",
  },
  "iso27001-access-control": {
    id: "iso27001-access-control",
    framework: "ISO27001",
    ruleCode: "ISO27001-A.5.1",
    description: "Controle de acesso deve estar vinculado a role e policy.",
    requiredEvidence: ["role-policy", "access-allowlist"],
    validator: "access-control-validator",
    severity: "blocker",
    onFail: "reject",
  },
  "iso31000-risk-treatment": {
    id: "iso31000-risk-treatment",
    framework: "ISO31000",
    ruleCode: "ISO31000-6.3",
    description: "Risco deve ter tratamento definido.",
    requiredEvidence: ["risk-treatment-plan", "risk-owner"],
    validator: "risk-treatment-validator",
    severity: "critical",
    onFail: "hold",
  },
  "nist-csf-identify": {
    id: "nist-csf-identify",
    framework: "NIST-CSF",
    ruleCode: "NIST-CSF-ID",
    description: "Identificação de ativos e riscos é obrigatória.",
    requiredEvidence: ["asset-register", "risk-log"],
    validator: "asset-risk-validator",
    severity: "critical",
    onFail: "reject",
  },
  "itil-change-approval": {
    id: "itil-change-approval",
    framework: "ITIL",
    ruleCode: "ITIL-4-CHANGE-APPROVAL",
    description: "Mudança deve ter aprovação formal antes da execução.",
    requiredEvidence: ["change-request", "approval-record"],
    validator: "change-approval-validator",
    severity: "critical",
    onFail: "reject",
  },
};
