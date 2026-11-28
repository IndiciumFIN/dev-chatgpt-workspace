import { isClinicalRightsHeld } from "@/lib/tools/rights-boundary";
import { tools } from '@/lib/tools/catalog';
import { type LocalToolPublication } from '@/lib/local-workbench-store';
import { readLocalPublished } from '@/lib/local-publication-register';
/** Client-only projection. The server never reads cross-user browser storage. */
export function localPublishedTools(): LocalToolPublication[] {
  return readLocalPublished().tools.filter(item => item.published).filter(item => !isClinicalRightsHeld(item.slug));
}
export function localTool(slug: string) {
  const base = tools.find(item => item.slug === slug);
  if (!base || isClinicalRightsHeld(slug)) return undefined;
  const record = localPublishedTools().find(item => item.slug === slug);
  return base && record ? { ...base, title: record.title, lead: record.lead } : undefined;
}
