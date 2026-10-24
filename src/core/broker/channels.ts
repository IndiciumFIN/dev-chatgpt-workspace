import type { ChannelType, MessageType } from "./message-envelope";

export type BrokerRoute = {
  id: string;
  channel: ChannelType;
  sender: string;
  recipient: string;
  allowedMessageTypes: MessageType[];
  requiresSignature: boolean;
  requiresHashValidation: boolean;
  status: "draft" | "admitted" | "rejected";
};

export function routeAllowed(route: BrokerRoute): boolean {
  return route.status === "admitted";
}
