import { CuriosityView } from "@/components/templates/curiosity-view";
import type { CuriosityContent as MemCuriosityContent, CuriositySource as MemCuriositySource } from "@/lib/content/curiosidades/model";
import type { CuriosityRecord, CuriositySource } from "@/lib/content/curiosidades/types";
import sourceRegistry from "@/lib/content/curiosidades/sources.json";

/**
 * Compatibilidade entre o snapshot de 87 páginas e o renderizador MEM único.
 *
 * Não recriar UI editorial aqui: Mary Eliza Mahoney, CuriosityView e todas as
 * curiosidades usam o frame ArticlePage e os componentes do mesmo design.
 *
 * Este componente só deve ser invocado pela rota após o gate DEV explícito.
 * A normalização não eleva o estado editorial e não valida direitos.
 */
const sourceMap = new Map<string, MemCuriositySource>(
  (sourceRegistry as CuriositySource[]).map((source) => [
    source.source_id,
    {
      source_id: source.source_id,
      organization: source.organization ?? undefined,
      title: source.title ?? source.source_id,
      url: source.url && /^https?:\/\//i.test(source.url) ? source.url : undefined,
      doi: source.doi ?? undefined,
      rights_status: source.rights_status ?? undefined,
      web_status: source.web_status ?? undefined,
    },
  ]),
);

function normalizeContent(record: CuriosityRecord): MemCuriosityContent {
  const source = record.content;
  return {
    ...source,
    hero_lead: source.hero_lead ?? source.intro?.lead ?? source.title,
    seo_description: source.seo_description ?? source.subtitle ?? source.title,
    intro: source.intro ?? {},
    summary_items: (source.summary_items ?? []).filter(
      (item): item is string => typeof item === "string",
    ),
  };
}

export function CuriosityPage({ record }: { record: CuriosityRecord }) {
  return (
    <CuriosityView
      content={normalizeContent(record)}
      sources={sourceMap}
      status={record.content_status}
      publishedRelatedSlugs={[]}
    />
  );
}
