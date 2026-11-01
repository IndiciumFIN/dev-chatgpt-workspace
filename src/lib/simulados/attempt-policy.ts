/** SPE W10 candidate policy adapter. Pure checks only; NOT authentication or DB enforcement. */
export type AttemptMode = "SIMULADO" | "ESTUDO";
export type AttemptState = "CREATED" | "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "CLOSED" | "VOID";
export type Visibility = "HIDDEN" | "POST_COMPLETION" | "STUDY_EXPLICIT";
export type AttemptContext = Readonly<{
  mode: AttemptMode;
  state: AttemptState;
  visibility: Visibility;
  ownerId: string | null;
  requesterId: string | null;
  ownershipVerified: boolean;
  policyVersion: string;
}>;
export type GateDecision = Readonly<{ allow: boolean; reason: string }>;
const deny = (reason: string): GateDecision => ({ allow: false, reason });
export function canRevealAnswers(ctx: AttemptContext): GateDecision {
  if (!ctx.policyVersion) return deny("POLICY_VERSION_MISSING");
  // Ownership must be proven by trusted server context; never trust client submitted owner IDs.
  if (!ctx.ownershipVerified || !ctx.ownerId || ctx.ownerId !== ctx.requesterId)
    return deny("OWNER_NOT_VERIFIED");
  if (ctx.state === "VOID") return deny("ATTEMPT_VOID");
  if (ctx.mode === "SIMULADO") {
    return ctx.visibility === "POST_COMPLETION" && (ctx.state === "GRADED" || ctx.state === "CLOSED")
      ? { allow: true, reason: "SIMULADO_COMPLETED" }
      : deny("SIMULADO_NOT_COMPLETED");
  }
  if (ctx.mode === "ESTUDO" && ctx.visibility === "STUDY_EXPLICIT")
    return { allow: true, reason: "STUDY_POLICY_EXPLICIT" };
  return ctx.visibility === "POST_COMPLETION" && (ctx.state === "GRADED" || ctx.state === "CLOSED")
    ? { allow: true, reason: "STUDY_COMPLETED" }
    : deny("ANSWER_RELEASE_NOT_ALLOWED");
}
export function maySubmit(from: AttemptState): GateDecision {
  return from === "IN_PROGRESS" ? {allow:true,reason:"SUBMIT_ALLOWED"} : deny("INVALID_SUBMIT_STATE");
}
