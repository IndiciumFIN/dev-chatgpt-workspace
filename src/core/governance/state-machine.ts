export const allowedTransitions: Record<string, string[]> = {
  draft: ["pending"],
  pending: ["in_review", "rejected"],
  in_review: ["admitted", "rejected"],
  admitted: ["preview"],
  preview: ["approved", "rejected"],
  approved: ["deployed"],
  deployed: ["revoked"],
  rejected: [],
  revoked: [],
};
