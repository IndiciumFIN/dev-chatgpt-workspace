export type CommandTemplate = {
  id: string;
  toolId: string;
  action: string;
  commandTemplate: string;
  timeoutMs: number;
  maxRetries: number;
  retryBackoffMs: number;
  allowedExitCodes: number[];
  status: "draft" | "admitted" | "rejected";
  hash: string;
};

export function buildCommand(template: CommandTemplate, params: Record<string, string>): string {
  let command = template.commandTemplate;
  Object.entries(params).forEach(([key, value]) => {
    command = command.replaceAll(`{${key}}`, value);
  });
  return command;
}
