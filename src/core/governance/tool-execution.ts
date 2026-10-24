export type ToolExecutionRequest = {
  toolId: string;
  action: string;
  payload: Record<string, unknown>;
  approvedByKernel: boolean;
  manifestId?: string;
  workOrderId?: string;
};

export async function authorizeToolExecution(request: ToolExecutionRequest): Promise<boolean> {
  if (!request.toolId) return false;
  if (!request.action) return false;
  if (!request.approvedByKernel) return false;
  if (!request.manifestId) return false;
  if (!request.workOrderId) return false;
  return true;
}
