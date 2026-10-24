export type ToolAdapter = {
  id: string;
  toolId: string;
  kind: "http" | "cli" | "shell";
  commandTemplate?: string;
  requestTemplate?: Record<string, unknown>;
  responseValidatorRef?: string;
  timeoutMs: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
  status: "admitted";
};
