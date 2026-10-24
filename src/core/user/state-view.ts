export type UserViewState = {
  stateId: string;
  label: string;
  status: "draft" | "active" | "approved" | "rejected" | "hold" | "archived";
  nextAllowedTransitions: string[];
  requiredEvidence: string[];
  gateStatus?: "draft" | "homologated" | "approved" | "rejected" | "revoked";
  activeFindings: string[];
  lastUpdatedAt: string;
};
