/** Prévia local do Builder: nunca autoriza publicação, edição clínica ou mudança de template canônico. */
export type TemplateReference = Readonly<{
  id: string; name: string; kind: string; href: string;
  frame: string; note: string; situacao: string; source: string;
}>;
export type PreviewContent = { eyebrow: string; title: string; summary: string; actionLabel: string };
export type TemplatePreviewDraft = {
  previewFormat: 'ce-builder-local-preview/1';
  instanceId: string; templateId: string; templateKind: string; sourceHref: string;
  revision: number; updatedAt: string; content: PreviewContent;
};
export type LocalPreviewRegister = {
  registerFormat: 'ce-builder-local-register/1';
  revision: number; drafts: TemplatePreviewDraft[];
};
const MAX: Record<keyof PreviewContent, number> = {
  eyebrow: 40, title: 100, summary: 320, actionLabel: 48
};
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const ID = /^[A-Za-z0-9_-]{1,100}$/;
const keysEqual = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
export function filterCanonicalTemplates(
  items: readonly TemplateReference[], query: string, kind = 'all',
  sort: 'name' | 'kind' | 'id' = 'name'
): TemplateReference[] {
  const q = query.trim().toLocaleLowerCase('pt-BR');
  return items.filter(t => (kind === 'all' || t.kind === kind)
    && [t.id,t.name,t.kind,t.source].join(' ').toLocaleLowerCase('pt-BR').includes(q))
    .sort((a,b) => String(a[sort]).localeCompare(String(b[sort]),'pt-BR'));
}
export function createPreviewDraft(t: TemplateReference, id: string, date: string): TemplatePreviewDraft {
  if (!ID.test(id) || !Number.isFinite(Date.parse(date))) throw new Error('Identificação de prévia inválida.');
  return {
    previewFormat: 'ce-builder-local-preview/1', instanceId:id, templateId:t.id,
    templateKind:t.kind, sourceHref:t.href, revision:0, updatedAt:date,
    content:{eyebrow:'',title:t.name,summary:'',actionLabel:'Ver conteúdo'}
  };
}
export function validatePreviewDraft(raw: unknown, catalog: readonly TemplateReference[]): TemplatePreviewDraft {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Prévia inválida.');
  const d = raw as Record<string,unknown>;
  if (!keysEqual(d,['previewFormat','instanceId','templateId','templateKind','sourceHref','revision','updatedAt','content']))
    throw new Error('Campos extras ou contrato de rascunho incompleto.');
  if (d.previewFormat !== 'ce-builder-local-preview/1'
      || typeof d.instanceId !== 'string' || !ID.test(d.instanceId)
      || typeof d.templateId !== 'string'
      || !Number.isSafeInteger(d.revision) || (d.revision as number) < 0
      || (d.revision as number) > 1000000
      || typeof d.updatedAt !== 'string' || !Number.isFinite(Date.parse(d.updatedAt)))
    throw new Error('Cabeçalho da prévia inválido.');
  const t = catalog.find(x=>x.id===d.templateId);
  if (!t) throw new Error('Template desconhecido ou removido do catálogo canônico.');
  if (d.templateKind !== t.kind || d.sourceHref !== t.href) throw new Error('Template alterado: reconciliação obrigatória.');
  if (!d.content || typeof d.content !== 'object' || Array.isArray(d.content))
    throw new Error('Campos de apresentação inválidos.');
  const c = d.content as Record<string,unknown>;
  if (!keysEqual(c,['eyebrow','title','summary','actionLabel']))
    throw new Error('Campos de apresentação fora do contrato.');
  for (const key of Object.keys(MAX) as (keyof PreviewContent)[]) {
    const v = c[key];
    if (typeof v !== 'string' || v.length > MAX[key] || CONTROL.test(v))
      throw new Error('Campo inválido: ' + key);
  }
  if ((c.title as string).trim().length < 3) throw new Error('Título deve ter 3 caracteres ou mais.');
  if ((c.actionLabel as string).trim().length < 2) throw new Error('Rótulo da ação muito curto.');
  return d as TemplatePreviewDraft;
}
export function emptyLocalRegister(): LocalPreviewRegister {
  return {registerFormat:'ce-builder-local-register/1',revision:0,drafts:[]};
}
export function validateLocalRegister(raw: unknown, catalog: readonly TemplateReference[]): LocalPreviewRegister {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Registro inválido.');
  const r = raw as Record<string,unknown>;
  if (!keysEqual(r,['registerFormat','revision','drafts'])
      || r.registerFormat !== 'ce-builder-local-register/1'
      || !Number.isSafeInteger(r.revision) || (r.revision as number) < 0
      || (r.revision as number) > 1000000
      || !Array.isArray(r.drafts) || r.drafts.length > 50) throw new Error('Registro local incompatível.');
  const drafts = r.drafts.map(d=>validatePreviewDraft(d,catalog));
  if (new Set(drafts.map(d=>d.instanceId)).size !== drafts.length) throw new Error('Instâncias duplicadas.');
  return {registerFormat:'ce-builder-local-register/1',revision:r.revision as number,drafts};
}
export function upsertLocalPreview(
  register: LocalPreviewRegister, item: TemplatePreviewDraft, catalog: readonly TemplateReference[], date: string
): LocalPreviewRegister {
  const r = validateLocalRegister(register,catalog);
  const d = validatePreviewDraft(item,catalog);
  const existing = r.drafts.find(x=>x.instanceId===d.instanceId);
  if (existing && existing.revision !== d.revision) throw new Error('Conflito de revisão.');
  const next = {...d,revision:(existing?.revision ?? 0)+1,updatedAt:date};
  const drafts = [...r.drafts.filter(x=>x.instanceId!==d.instanceId),next];
  if (drafts.length > 50) throw new Error('Limite de 50 rascunhos locais.');
  return {registerFormat:'ce-builder-local-register/1',revision:r.revision+1,drafts};
}
export function removeLocalPreview(
  register: LocalPreviewRegister, id: string, catalog: readonly TemplateReference[]
): LocalPreviewRegister {
  const r = validateLocalRegister(register,catalog);
  if (!r.drafts.some(d=>d.instanceId===id)) throw new Error('Rascunho não encontrado.');
  return {...r,revision:r.revision+1,drafts:r.drafts.filter(d=>d.instanceId!==id)};
}
export function exportPreviewDraft(d: TemplatePreviewDraft, catalog: readonly TemplateReference[]): string {
  const draft = validatePreviewDraft(d,catalog);
  return JSON.stringify({
    warning:'PRÉVIA LOCAL NÃO HOMOLOGADA; PUBLICAÇÃO BLOQUEADA',
    catalogSources:['src/lib/template-catalog.ts','src/lib/template-contract.ts'],
    draft
  },null,2);
}
export function importPreviewDraft(json: string, catalog: readonly TemplateReference[]): TemplatePreviewDraft {
  if (new TextEncoder().encode(json).length > 32768) throw new Error('Importação acima de 32 KiB.');
  const raw: unknown = JSON.parse(json);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Importação inválida.');
  const o = raw as Record<string,unknown>;
  if (!keysEqual(o,['warning','catalogSources','draft'])
      || !Array.isArray(o.catalogSources)
      || o.catalogSources.join('|') !== 'src/lib/template-catalog.ts|src/lib/template-contract.ts'
      || o.warning !== 'PRÉVIA LOCAL NÃO HOMOLOGADA; PUBLICAÇÃO BLOQUEADA')
    throw new Error('Origem canônica da importação não reconhecida.');
  return validatePreviewDraft(o.draft,catalog);
}
