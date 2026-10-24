export type AgentDescriptor = {
  id: string;
  name: string;
  version: string;
  owner: string;
  allowedToolIds: string[];
  allowedSourceIds: string[];
  allowedChannels: Array<"admin" | "kernel" | "agent" | "finding" | "archive">;
  status: "draft" | "admitted" | "rejected";
  hash: string;
};
