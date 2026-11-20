import { useState, type ReactNode } from 'react';
import { Copy, Pencil, Plus } from 'lucide-react';
import { DataTable } from '../ds/DataTable.tsx';
import { RecordForm } from '../ds/RecordForm.tsx';
import { ConfirmDialog, Drawer, KeyValue, StatusBadge, SyntheticTag, Tabs, useToast } from '../ds/ui.tsx';
import { schemas } from '../data/schemas.ts';
import { useAudit, useCollection, type Row } from '../lib/local-db.ts';
import type { Values } from '../lib/validate.ts';

export type CrudCtx = { rows: Row[]; save: (v: Record<string, unknown>, id?: string) => string };
type Props = {
  schemaName: string;
  extraRules?: (v: Values, rows: Row[], editingId?: string) => Record<string, string>;
  headerExtra?: (ctx: CrudCtx) => ReactNode;
  detailExtra?: (row: Row, ctx: CrudCtx) => ReactNode;
};

/** CRUD governado e local: Novo, Abrir, Editar, Duplicar como rascunho, Arquivar/Restaurar (nada é apagado). */
export function CrudModule({ schemaName, extraRules, headerExtra, detailExtra }: Props) {
  const schema = schemas[schemaName];
  const col = useCollection<Row>(schema.name, schema.prefix);
  const audit = useAudit(); const toast = useToast();
  const [open, setOpen] = useState<{ row?: Row; mode: 'view' | 'edit' | 'new' } | null>(null);
  const [tab, setTab] = useState('dados'); const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<null | { kind: 'close' | 'archive'; row?: Row }>(null);
  const ctx: CrudCtx = { rows: col.rows, save: col.save };
  const columns = schema.fields.filter(f => f.listColumn).map(f => ({ key: f.key, label: f.label }));
  const close = () => { setOpen(null); setDirty(false); setTab('dados'); setConfirm(null); };
  const requestClose = () => (dirty ? setConfirm({ kind: 'close' }) : close());
  const rules = (v: Values) => ({ ...(schema.rules?.(v) ?? {}), ...(extraRules?.(v, col.rows, open?.row?.id) ?? {}) });
  const row = open?.row ? col.rows.find(r => r.id === open.row?.id) ?? open.row : undefined;
  const history = row ? audit.filter(a => a.objectRef === `${schema.name}/${row.id}`) : [];
  return <div className="grid">
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <button type="button" className="btn primary" onClick={() => setOpen({ mode: 'new' })}><Plus size={16} aria-hidden="true" />Novo</button>
      {headerExtra?.(ctx)}
    </div>
    <DataTable<Row> id={schema.name} rows={col.rows} columns={columns} searchFields={['id', ...schema.fields.filter(f => f.listColumn && f.type !== 'select').map(f => f.key)]}
      statusKey={schema.statusKey} sourceLabel={`coleção local “${schema.name}”`} emptyHint={schema.emptyHint} onOpen={r => { setOpen({ row: r, mode: 'view' }); setTab('dados'); }} defaultSort={{ key: columns[0].key, dir: 'asc' }} />
    {open && <Drawer title={open.mode === 'new' ? `Novo · ${schema.title}` : `${String(row?.id)} ${open.mode === 'edit' ? '· editar' : ''}`} onClose={requestClose}>
      {open.mode === 'view' && row ? <>
        <div className="row">{Boolean(row.synthetic) && <SyntheticTag />}{schema.statusKey && <StatusBadge value={String(row[schema.statusKey] ?? '')} />}{Boolean(row.archived) && <span className="tag">arquivado</span>}</div>
        <Tabs label="Seções do registro" tabs={[{ id: 'dados', label: 'Dados' }, { id: 'hist', label: `Auditoria (${history.length})` }]} value={tab} onChange={setTab} />
        {tab === 'dados' ? <>
          <KeyValue items={schema.fields.map(f => [f.label, f.type === 'bool' ? (row[f.key] ? 'sim' : 'não') : String(row[f.key] ?? '')])} />
          {detailExtra?.(row, ctx)}
          <div className="row">
            <button type="button" className="btn" onClick={() => setOpen({ row, mode: 'edit' })}><Pencil size={16} aria-hidden="true" />Editar</button>
            <button type="button" className="btn" onClick={() => { const { id: _i, archived: _a, synthetic: _s, updatedAt: _u, ...rest } = row; setOpen({ row: rest as Row, mode: 'new' }); }}><Copy size={16} aria-hidden="true" />Duplicar como rascunho</button>
            <button type="button" className={`btn${row.archived ? '' : ' danger'}`} onClick={() => (row.archived ? (col.setArchived(String(row.id), false), toast('Registro restaurado.')) : setConfirm({ kind: 'archive', row }))}>{row.archived ? 'Restaurar' : 'Arquivar'}</button>
          </div>
          <p className="note">Registros não são apagados: arquivar preserva histórico e evidências.</p></>
          : history.length ? <ol className="timeline">{history.map(h => <li key={h.seq}><time>{h.at}</time><strong>{h.action}</strong> — {h.summary}<div><code>{h.hash.slice(0, 16)}…</code></div></li>)}</ol> : <p className="note">Sem eventos registrados para este item.</p>}
      </> : <RecordForm fields={schema.fields} initial={open.row ?? { status: schema.fields.find(f => f.key === schema.statusKey)?.options?.[0] ?? '' }} rules={rules} onDirty={setDirty}
        submitLabel={open.mode === 'edit' ? 'Salvar alterações' : 'Criar'} onCancel={requestClose}
        onSubmit={v => { const id = col.save(v, open.mode === 'edit' ? String(open.row?.id) : undefined); toast(`${open.mode === 'edit' ? 'Atualizado' : 'Criado'}: ${id}`); close(); }} />}
    </Drawer>}
    {confirm?.kind === 'close' && <ConfirmDialog title="Descartar alterações?" confirmLabel="Descartar" danger onCancel={() => setConfirm(null)} onConfirm={close}>Há alterações não salvas neste formulário.</ConfirmDialog>}
    {confirm?.kind === 'archive' && confirm.row && <ConfirmDialog title="Arquivar registro?" confirmLabel="Arquivar" onCancel={() => setConfirm(null)} onConfirm={() => { col.setArchived(String(confirm.row?.id), true); toast('Registro arquivado.'); setConfirm(null); }}>O registro sai das listas padrão, mas permanece auditável e pode ser restaurado.</ConfirmDialog>}
  </div>;
}
