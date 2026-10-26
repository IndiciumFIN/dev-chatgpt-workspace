import type { Dest } from "@/lib/sections";
import type { NavNode } from "@/lib/nav";

export function findByQuery(query: string, lists: NavNode[]): Dest | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  const nodes: NavNode[] = [];
  function walk(list: NavNode[]) {
    for (const node of list) {
      nodes.push(node);
      for (const group of node.groups ?? []) walk(group.items);
    }
  }
  walk(lists);
  const hit = nodes.find((node) => node.live && node.label.toLowerCase().includes(q) && node.dest);
  return hit?.dest ?? nodes.find((node) => node.label.toLowerCase().includes(q) && node.dest)?.dest;
}
