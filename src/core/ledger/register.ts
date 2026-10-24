export type RegisterEntry = {
  id: string;
  entityType: string;
  entityId: string;
  action: "created" | "validated" | "approved" | "rejected" | "archived" | "resolved";
  actor: string;
  at: string;
  hash: string;
  signature: string;
  reason?: string;
};

export function appendRegisterEntry(list: RegisterEntry[], entry: RegisterEntry): RegisterEntry[] {
  return [...list, entry];
}
