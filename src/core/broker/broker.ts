import type { MessageEnvelope } from "./message-envelope";
import type { BrokerRoute } from "./channels";

export function sendMessage(route: BrokerRoute, msg: MessageEnvelope): boolean {
  if (!route.requiresSignature) return false;
  if (!msg.signature) return false;
  if (!msg.payloadHash) return false;
  return routeAllowed(route);
}
