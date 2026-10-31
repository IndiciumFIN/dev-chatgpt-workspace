import { useState } from 'react';
import { GovernedReviewPanel } from './governed-review-panel';
import { ArrowUpRight, ClipboardCheck, FileClock, ListTodo } from 'lucide-react';
import queue from '../../../registers/pmo/queue.v1.json';
import candidates from '../../../registers/governance/imports/cko-coren-cofen-20261023/pending-candidates.v1.json';
import findRegistry from '../../../registers/governance/find-register.v1.json';

/** Projeção somente leitura: a fonte é o registro versionado no GitHub, não localStorage. */
export function PmoPanel() {
  const [filter, setFilter] = useState<'all' | 'active' | 'holds'>('all');
  const visible = queue.items.filter(item =>
    filter === 'all' || (filter === 'active' ? item.status === 'IN_PROGRESS' || item.status === 'QUEUED' : item.status === 'PAUSED' || item.status === 'HOLD_HUMAN'));
  const active = queue.items.filter(item => item.status === 'IN_PROGRESS').length;
  const pending = queue.items.filter(item => item.status === 'QUEUED').length;
  const statusLabels: Record<string, string> = {
    PAUSED: 'Pausada', IN_PROGRESS: 'Em execução', QUEUED: 'Na fila', HOLD_HUMAN: 'Aprovação humana',
    DONE: 'Concluída com evidência', BLOCKED: 'Bloqueada',
  };
  return <>
    <div className="ce-admin-stats ce-admin-stats--three" data-testid="pmo-summary">
      <div className="ce-admin-stat"><span className="ce-admin-stat-icon"><ListTodo size={19} aria-hidden="true" /></span><span className="ce-admin-stat-label">Ordens controladas</span><strong>{queue.items.length}</strong><small>Registro único versionado</small></div>
      <div className="ce-admin-stat"><span className="ce-admin-stat-icon"><ClipboardCheck size={19} aria-hidden="true" /></span><span className="ce-admin-stat-label">Em execução / aguardando</span><strong>{active} / {pending}</strong><small>Sem percentuais presumidos</small></div>
      <div className="ce-admin-stat"><span className="ce-admin-stat-icon"><FileClock size={19} aria-hidden="true" /></span><span className="ce-admin-stat-label">Revisão PMO</span><strong>#{queue.revision}</strong><small>Atualização: {queue.updatedOn}</small></div>
    </div>
    <GovernedReviewPanel />
    <section className="ce-admin-panel" data-testid="admin-pmo" aria-labelledby="admin-pmo-heading">
      <div className="ce-admin-panel-heading"><div><h2 id="admin-pmo-heading">Fila única de execução</h2><p>Atualizada por commits verificáveis. A visualização é leitura, não aprovação.</p></div></div>
      <div className="ce-admin-pmo-controls">
        <p>Protótipo administrativo congelado. A fila segue segurança, E2E, Design System, CKO, automação e homologação.</p>
        <label>Exibir <select value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
          <option value="all">Todas as ordens</option><option value="active">Em execução e na fila</option><option value="holds">Pausadas e aprovação humana</option>
        </select></label>
      </div>
      <ol className="ce-admin-pmo-list">
        {visible.map(item => <li key={item.id} className="ce-admin-pmo-item" data-work-id={item.id}>
          <div className="ce-admin-pmo-title"><span className="ce-admin-pmo-sequence">#{item.order}</span><div><h3>{item.title}</h3><small>{item.id} · {item.priority} · {item.owner}</small></div>
            <span className={item.status === 'IN_PROGRESS' ? 'ce-admin-indicator ce-admin-indicator--ok' : item.status === 'HOLD_HUMAN' ? 'ce-admin-indicator ce-admin-indicator--warn' : 'ce-admin-indicator ce-admin-indicator--neutral'}>{statusLabels[item.status] ?? item.status}</span></div>
          <details><summary>Critério, próxima ação e evidências</summary><p><strong>Critério de aceite:</strong> {item.criteria}</p><p><strong>Próximo passo:</strong> {item.next}</p><p><strong>Dependências:</strong> {item.dependencies.join(', ') || 'Nenhuma'}</p>
            {item.evidence.length ? <ul>{item.evidence.map((url, n) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">Evidência {n + 1} <ArrowUpRight size={13} aria-hidden="true" /></a></li>)}</ul> : <p>Nenhuma evidência anexada: não é PASS.</p>}</details>
        </li>)}
      </ol>
      <p className="ce-admin-detail-note"><strong>Fonte da verdade do PMO:</strong> <code>{queue.canonicalSource}</code>. Atualizações chegam após o commit e o novo build. Não existe gravação administrativa remota aqui.</p>
    </section>
    <section className="ce-admin-panel" data-testid="pmo-candidate-finds" aria-labelledby="pmo-find-heading">
      <div className="ce-admin-panel-heading"><div><h2 id="pmo-find-heading">Achados candidatos — CKO / COREN / COFEN</h2>
        <p>{candidates.items.length} registros ({candidates.items.filter(x => x.priority === 'P0').length} P0 e {candidates.items.filter(x => x.priority === 'P1').length} P1) · {findRegistry.candidate_batches.find(x => x.batch_id === 'CKO-COREN-COFEN-AUDIT-20261023')?.related_wo}</p></div></div>
      <p className="ce-admin-detail-note"><strong>Quarentena documental:</strong> estes FINDs não foram admitidos no Kernel. Falta o ZIP CKO integral; não há aprovação normativa nem liberação clínica.</p>
      <div className="ce-admin-pmo-list">
        {candidates.items.map(item => <details className="ce-admin-pmo-item" key={item.id} data-find-id={item.id}>
          <summary><strong>{item.id} · {item.priority} · {item.title}</strong></summary>
          <p><strong>Estado:</strong> {item.state} · <strong>Severidade:</strong> {item.severity}</p>
          <p><strong>Evidência registrada:</strong> {item.evidence}</p>
          <p><strong>Próxima ação:</strong> {item.next_action}</p>
          <p><strong>Aceite:</strong> {item.acceptance}</p>
          <p><strong>Responsável proposto:</strong> {item.owner}</p>
        </details>)}
      </div>
      <p className="ce-admin-detail-note"><a href="https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/main/docs/audits/AUDITORIA_PENDENCIAS_CKO_COREN_COFEN_20261023.md" target="_blank" rel="noopener noreferrer">Relatório de auditoria versionado</a> · <a href="https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/main/registers/governance/imports/cko-coren-cofen-20261023/pending-candidates.v1.json" target="_blank" rel="noopener noreferrer">Lote original (JSON)</a></p>
    </section>
    <section className="ce-admin-panel" aria-labelledby="pmo-log-heading">
      <div className="ce-admin-panel-heading"><div><h2 id="pmo-log-heading">Decisões e movimentações</h2><p>Eventos versionados para reconstruir a fila e justificar alterações.</p></div></div>
      <ol className="ce-admin-pmo-events">{queue.events.map(event => <li key={event.seq}><strong>{event.workId} · {statusLabels[event.to] ?? event.to}</strong><span>{event.date} — {event.reason}</span></li>)}</ol>
      <p className="ce-admin-detail-note">O registro não substitui controle de acesso por perfil, auditoria imutável de servidor ou revisão humana obrigatória.</p>
    </section>
  </>;
}
