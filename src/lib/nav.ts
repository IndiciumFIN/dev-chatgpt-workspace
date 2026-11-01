import type { Dest } from "@/lib/sections";

export type NavNode = {
  id: string;
  label: string;
  dest?: Dest;
  live?: boolean;
  tone?: "guide" | "enter" | "subscribe";
  groups?: { label?: string; items: NavNode[] }[];
};
