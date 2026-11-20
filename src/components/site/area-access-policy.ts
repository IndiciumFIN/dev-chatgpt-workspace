/** UI route guard policy. This is defense-in-depth; server-side role checks remain required. */
export type AreaAccessOutcome = "loading" | "login" | "member" | "allow";
export function evaluateAreaAccess(input: {
  allow: "admin" | "member";
  userId: string | null;
  role: "admin" | "subscriber" | null;
  isPending: boolean;
}): AreaAccessOutcome {
  if (input.isPending) return "loading";
  if (!input.userId || !input.role) return "login";
  if (input.allow === "admin" && input.role !== "admin") return "member";
  return "allow";
}
