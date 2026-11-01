import type { WorkflowConfig } from "./workflow-config";

export function createWorkflow(config: Omit<WorkflowConfig, "hash">): WorkflowConfig {
  return {
    ...config,
    hash: `wf:${config.workflowId}:${config.version}`,
  };
}
