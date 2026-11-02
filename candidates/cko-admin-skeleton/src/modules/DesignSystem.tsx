import { useMemo, useState } from 'react';
import { DataTable } from '../ds/DataTable.tsx';
import { Callout, Panel, Stat, Tabs, Tag } from '../ds/ui.tsx';
import { canonicalComponents, canonicalTemplates, digitalSchemas, mapping, type Coverage } from '../data/canonical-ds.ts';

const LABEL: Record<Coverage, string> = { oficial: 'oficial', candidato: 'candidato', sem_equivalente: 'sem equivalente' };

export function DesignSystem() {
  const [tab, setTab] = useState('componentes');
  const rows = useMemo(() => canonicalComponents.map(id => { const m = mapping.find(x => x.canonical === id); return { id, coverage: m?.coverage ?? 'sem_equivalente', consoleUse: m?.consoleUse ?? '—', note: m?.note ?? '' } as Record<string, unknown>; }), []);
  const n = (c: Coverage) => rows.filter(r => r.coverage === c).length;
  return <div className="grid">
    <Callout title="Status do inventário: RECOVERED_RECONCILIATION_CANDIDATE">Validação estática dos schemas não equivale a runtime/release PASS. Os 142 bindings ObjectFactory↔Component/TemplateMaster não foram recuperados linha a linha e <strong>não são reconstruídos por inferência</strong>: o mapeamento abaixo é candidato e vale apenas para este console.</Callout>
    <div className="grid g4"><Stat label="Componentes canônicos" value={canonicalComponents.length} note="ComponentMaster v1.1" /><Stat label="Uso oficial no console" value={n('oficial')} note="Cópia fiel do site" /><Stat label="Equivalente candidato" value={n('candidato')} note="A confirmar" /><Stat label="Sem equivalente" value={n('sem_equivalente')} note="Lacunas do console" /></div>
    <Tabs label="Design System" value={tab} onChange={setTab} tabs={[{ id: 'componentes', label: 'Componentes (37)' }, { id: 'templates', label: 'Templates (21)' }, { id: 'schemas', label: 'Schemas v2.1 (14)' }, { id: 'regras', label: 'Regra para imagens' }]} />
    {tab === 'componentes' && <Panel title="Componentes canônicos × console" subtitle="Fonte: ComponentMaster v1.1 (recuperado)."><DataTable id="ds-comp" rows={rows} columns={[{ key: 'id', label: 'Componente' }, { key: 'coverage', label: 'Cobertura', render: r => <Tag tone={r.coverage === 'oficial' ? 'ok' : r.coverage === 'candidato' ? 'info' : 'warn'}>{LABEL[r.coverage as Coverage]}</Tag> }, { key: 'consoleUse', label: 'Uso no console' }, { key: 'note', label: 'Observação' }]} searchFields={['id', 'consoleUse', 'note']} statusKey="coverage" pageSize={10} sourceLabel="CKO Digital Schema Recovery v2.1" emptyHint="" /></Panel>}
    {tab === 'templates' && <Panel title="Templates canônicos" subtitle="TemplateMaster v1.1 (21). O console administrativo não é um template do site; estes são o alvo das páginas publicadas."><ul className="chips">{canonicalTemplates.map(t => <li key={t}><span className="chip" style={{ cursor: 'default' }}>{t}</span></li>)}</ul></Panel>}
    {tab === 'schemas' && <Panel title="Schemas v2.1 consolidados" subtitle="Contratos registrados como candidato de reconciliação."><ul className="chips">{digitalSchemas.map(t => <li key={t}><span className="chip" style={{ cursor: 'default' }}>{t}</span></li>)}</ul><p className="note">Cadeia: CKO-MD → CKO-REG → Knowledge/Content Object → Digital Schema → ObjectFactory → TemplateMaster/ComponentMaster → UI Pattern/Screen → Renderer → Front-end → Visual Validation → Release.</p></Panel>}
    {tab === 'regras' && <Panel title="Regra para imagens"><p>Imagem ou screenshot é <strong>evidência visual</strong>, não autoridade canônica do Design System.</p><p>Fluxo obrigatório: visual evidence → matching de componentes → token binding → variante/pattern → screen → render → visual validation. Ordem decisória: <strong>MATCH → VARIANT → PATTERN → NEW COMPONENT</strong>.</p></Panel>}
  </div>;
}
