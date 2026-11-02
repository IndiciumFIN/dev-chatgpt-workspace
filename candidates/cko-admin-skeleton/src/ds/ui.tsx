import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  Bell, BookMarked, BookOpenCheck, BookOpenText, Bot, CalendarDays, CircleHelp, FileInput, FileSearch, FlaskConical, GitBranch, Globe2,
  Image as ImageIcon, Layers3, LayoutDashboard, ListTodo, LockKeyhole, Network, PlugZap, Rocket, Search, Settings, ShieldCheck, Stethoscope, UserRound, X, type LucideIcon,
} from 'lucide-react';
import { MODE_LABEL, type Mode } from '../core/modules.ts';

export const ICONS: Record<string, LucideIcon> = {
  Bell, BookMarked, BookOpenCheck, BookOpenText, Bot, CalendarDays, CircleHelp, FileInput, FileSearch, FlaskConical, GitBranch, Globe2, Image: ImageIcon,
  Layers3, LayoutDashboard, ListTodo, LockKeyhole, Network, PlugZap, Rocket, Search, Settings, ShieldCheck, Stethoscope, UserRound,
};
export function Icon({ name, size = 18 }: { name: string; size?: number }) { const C = ICONS[name] ?? LayoutDashboard; return <C size={size} aria-hidden="true" />; }

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';
export function Tag({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) { return <span className={`tag${tone === 'neutral' ? '' : ` ${tone}`}`}>{children}</span>; }
export const SyntheticTag = () => <span className="tag synthetic" title="Dado de demonstração, não é real">SINTÉTICO</span>;
export function ModeBadge({ mode }: { mode: Mode }) { return <Tag tone={mode === 'planejado' ? 'warn' : mode === 'leitura' ? 'info' : 'neutral'}>{MODE_LABEL[mode]}</Tag>; }

/** Estado do dado sempre por texto (nunca só por cor). */
const STATUS_TONE: Record<string, Tone> = {
  aceito: 'ok', vigente: 'ok', homologada: 'ok', aprovado: 'ok', ativa: 'ok', evidenciado: 'ok', passou: 'ok', DONE: 'ok', IN_PROGRESS: 'info', sombra: 'info', em_avaliacao: 'info', em_revisao: 'info', corrigido: 'info',
  pendente: 'warn', candidata: 'warn', quarentena: 'warn', HOLD_HUMAN: 'warn', PAUSED: 'warn', QUEUED: 'neutral', aprovado_com_ressalva: 'warn', sem_prova: 'warn', nao_executado: 'neutral',
  rejeitado: 'danger', revogada: 'danger', reprovado: 'danger', lacuna: 'danger', falhou: 'danger', suspensa: 'danger', BLOCKED: 'danger', erro: 'danger',
};
export const StatusBadge = ({ value }: { value: string }) => <Tag tone={STATUS_TONE[value] ?? 'neutral'}>{value.replaceAll('_', ' ')}</Tag>;

export function Panel({ title, subtitle, action, children }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel">{(title || action) && <header><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</header>}{children}</section>;
}
export const Stat = ({ label, value, note }: { label: string; value: ReactNode; note?: string }) => <div className="stat"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
export const SourceStamp = ({ source, revision, date }: { source: string; revision?: string | number; date?: string }) =>
  <p className="note">Fonte: <code>{source}</code>{revision !== undefined && <> · rev. {revision}</>}{date && <> · {date}</>}</p>;
export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => <div className="empty" data-testid="empty"><strong>{title}</strong>{children && <span>{children}</span>}</div>;
export const KeyValue = ({ items }: { items: [string, ReactNode][] }) => <dl className="kv">{items.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v === '' || v === undefined || v === null ? '—' : v}</dd></div>)}</dl>;

/** Ação indisponível: botão realmente inativo + motivo em texto fora do botão. */
export function DisabledAction({ label, reason }: { label: string; reason: string }) {
  const id = useId();
  return <div className="guarded"><button type="button" className="btn" disabled aria-describedby={id}>{label}</button><small id={id}>{reason}</small></div>;
}

export function PageHead({ title, description, badges }: { title: string; description: string; badges?: ReactNode }) {
  return <div className="pagehead"><div><h1 id="page-title" tabIndex={-1}>{title}</h1><p>{description}</p></div><div className="row">{badges}</div></div>;
}
export function Tabs({ tabs, value, onChange, label }: { tabs: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  return <div className="tabs" role="tablist" aria-label={label}>{tabs.map(t => <button key={t.id} role="tab" type="button" aria-selected={value === t.id} onClick={() => onChange(t.id)}>{t.label}</button>)}</div>;
}
export function Stepper({ steps, done, onToggle }: { steps: { title: string; detail: string; owner: string }[]; done: number[]; onToggle?: (i: number) => void }) {
  return <ol className="stepper">{steps.map((s, i) => <li key={s.title} className={done.includes(i) ? 'done' : ''}>
    <span className="n">{i + 1}</span><div style={{ flex: 1 }}><strong>{s.title}</strong><div style={{ fontSize: '.8rem' }}>{s.detail}</div><small>Responsável: {s.owner}</small></div>
    {onToggle && <label className="row" style={{ minHeight: 44 }}><input type="checkbox" checked={done.includes(i)} onChange={() => onToggle(i)} /><span className="sr">Concluir passo {i + 1}</span><span aria-hidden="true">{done.includes(i) ? 'Feito' : 'Pendente'}</span></label>}
  </li>)}</ol>;
}
export function Timeline({ items }: { items: { at: string; title: string; detail?: string }[] }) {
  return <ol className="timeline">{items.map((it, i) => <li key={i}><time>{it.at}</time><strong>{it.title}</strong>{it.detail && <div>{it.detail}</div>}</li>)}</ol>;
}

// ---- Diálogos acessíveis: foco inicial, Esc, ciclo de Tab, devolução do foco ----
function useDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current; el?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab' || !el) return;
      const f = [...el.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prev?.focus(); };
  }, [onClose]);
  return ref;
}
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useDialog(onClose); const id = useId();
  return <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="drawer" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1}>
    <header><h2 id={id}>{title}</h2><button type="button" className="iconbtn" onClick={onClose} aria-label="Fechar painel"><X size={18} aria-hidden="true" /></button></header>{children}</div></div>;
}
export function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onCancel }: { title: string; children: ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  const ref = useDialog(onCancel); const id = useId();
  return <div className="overlay center"><div className="modal" role="alertdialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1}>
    <h2 id={id}>{title}</h2><div>{children}</div>
    <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn" onClick={onCancel}>Cancelar</button><button type="button" className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmLabel}</button></div></div></div>;
}

// ---- Toasts ----
type ToastFn = (message: string, kind?: 'ok' | 'err') => void;
const ToastCtx = createContext<ToastFn>(() => undefined);
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string; kind: 'ok' | 'err' }[]>([]);
  const push = useCallback<ToastFn>((message, kind = 'ok') => {
    const id = Date.now() + Math.random();
    setItems(p => [...p, { id, message, kind }]);
    setTimeout(() => setItems(p => p.filter(t => t.id !== id)), 5000);
  }, []);
  return <ToastCtx.Provider value={push}>{children}<div className="toasts" role="status" aria-live="polite">{items.map(t => <div key={t.id} className={`toast${t.kind === 'err' ? ' err' : ''}`}>{t.message}</div>)}</div></ToastCtx.Provider>;
}

/** component.breadcrumbs (candidato). Contrato de itens do Breadcrumb do site: label + (to|hash|href). */
export type Crumb = { label: string; href?: string };
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return <nav className="crumbnav" aria-label="Trilha de navegação"><ol>{items.map((c, i) => <li key={c.label}>{i < items.length - 1 && c.href ? <a href={c.href}>{c.label}</a> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{c.label}</span>}</li>)}</ol></nav>;
}
export function Footer() {
  return <footer className="foot"><p><strong>Modo local.</strong> Sem login, sem banco e sem rede; dados apenas neste navegador. Dados marcados SINTÉTICO são de demonstração.</p></footer>;
}

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return <div className="scope" role="note"><LockKeyhole size={18} aria-hidden="true" /><div><strong>{title}</strong> <span>{children}</span></div></div>;
}
