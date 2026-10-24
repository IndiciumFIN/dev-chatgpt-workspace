export type ToolKind = "http" | "cli" | "browser" | "db" | "shell" | "ai-tool";

export type ToolContract = {
  id: string;
  name: string;
  kind: ToolKind;
  owner: string;
  templateId: string;
  host?: string;
  baseUrl?: string;
  authMode: "none" | "apiKey" | "oauth" | "basic" | "mTLS";
  requiredScopes: string[];
  endpointSpec?: string;
  requestSchemaRef?: string;
  responseSchemaRef?: string;
  validators: string[];
  normativeIds: string[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
  createdAt: string;
  updatedAt: string;
};
