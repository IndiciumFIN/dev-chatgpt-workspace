export type AgentExecutionRequest = {
  requestId: string;
  workOrderId: string;
  sourceId: string;
  toolId: string;
  action: string;
  gateId: string;
  manifestId: string;
  payloadHash: string;
  sender: string;
  target: string;
  signedAt: string;
  signature: string;
};

export function canAgentExecute(req: AgentExecutionRequest, gateApproved: boolean): boolean {
  if (!req.requestId) return false;
  if (!req.gateId) return false;
  if (!req.manifestId) return false;
  if (!req.signature) return false;
  return gateApproved;
}
