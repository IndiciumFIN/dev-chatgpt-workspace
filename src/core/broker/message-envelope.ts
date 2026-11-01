export type ChannelType = "admin" | "kernel" | "agent" | "finding" | "archive";
export type MessageType = "request" | "approval" | "reject" | "finding" | "evidence" | "state-change" | "heartbeat";

export type MessageEnvelope = {
  messageId: string;
  traceId: string;
  correlationId: string;
  workflowId?: string;
  workOrderId?: string;
  sourceId?: string;
  targetId?: string;
  sender: string;
  recipient: string;
  channel: ChannelType;
  messageType: MessageType;
  payloadHash: string;
  timestamp: string;
  signature: string;
  status: "draft" | "pending" | "accepted" | "rejected" | "archived";
};
