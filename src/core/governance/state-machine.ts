export const allowedTransitions: Record<string, string[]> = {
  draft: ["planned"],
  planned: ["pilot"],
  pilot: ["approved_for_development", "rejected"],
  approved_for_development: ["in_development"],
  in_development: ["ready_for_test", "rejected"],
  ready_for_test: ["in_test"],
  in_test: ["approved_for_production", "rejected"],
  approved_for_production: ["in_production"],
  in_production: ["closed", "revoked"],
  rejected: [],
  revoked: [],
  closed: [],
};
