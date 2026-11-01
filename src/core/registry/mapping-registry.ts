export type SourceToToolMapping = {
  id: string;
  sourceId: string;
  toolId: string;
  allowedActions: string[];
  authMode: "none" | "apiKey" | "oauth" | "basic" | "mTLS";
  requiredScopes: string[];
  commandTemplate: string;
  requestSchemaRef: string;
  responseSchemaRef: string;
  validatorRefs: string[];
  normativeIds: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
};

export function resolveSourceToToolMapping(
  sourceId: string,
  toolId: string,
  mappings: SourceToToolMapping[],
): SourceToToolMapping | null {
  return mappings.find((entry) => entry.sourceId === sourceId && entry.toolId === toolId && entry.status === "admitted") ?? null;
}
