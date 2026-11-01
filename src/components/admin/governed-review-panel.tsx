import { useState } from 'react';
import { ArrowUpRight, ClipboardCopy, ClipboardList, LockKeyhole, Search, ShieldAlert } from 'lucide-react';
import queue from '../../../registers/pmo/queue.v1.json';
import {
  buildDecisionDraft,
  DECISION_LABELS,
  type DecisionChoice,
  type DecisionResult,
} from '../../lib/governance/decision-draft';

import {
  evidenceSuggestions,
  searchEvidenceSuggestions,
  searchReviewWorkOrders,
  selectReviewEvidence,
} from '../../lib/governance/review-source-catalog';

const APPROVAL_RECORD_URL = 'https://github.com/IndiciumFIN/dev-chatgpt-workspace/blob/plan/pmokernel-finalization-20261031/registers/governance/approval-pmokernel-audit-20261031.v1.json';
const ISSUE_URL = 'https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25';
const decisions: DecisionChoice[] = ['REVIEW', 'REQUEST_CHANGES', 'APPROVE_WITH_RESERVATIONS', 'APPROVE'];
const statusLabels: Record<string, string> = {
  IN_PROGRESS: 'Em execução', QUEUED: 'Na fila', PAUSED: 'Pausada', HOLD_HUMAN: 'Aprovação humana pendente',
  DONE: 'Concluída com evidências', BLOCKED: 'Bloqueada',
};

/**
 * Human-readable candidate review UI. No backend exists for signing or posting
 * to GitHub. None of these buttons changes PMO or authorizes Kernel execution.
 */
export function GovernedReviewPanel() {
  const [workOrderId, setWorkOrderId] = useState(queue.items.find(item => item.status === 'HOLD_HUMAN')?.id ?? queue.items[0]?.id ?? '');
  const [woQuery, setWoQuery] = useState('');
  const [evidenceQuery, setEvidenceQuery] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [choice, setChoice] = useState<DecisionChoice>('REVIEW');
  const [reason, setReason] = useState('');
  const [caveats, setCaveats] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [feedback, setFeedback] = useState('Escolha uma atividade para consultar ou preparar um parecer. Não há nova aprovação obrigatória.');
  const selected = queue.items.find(item => item.id === workOrderId);
  const pendingDependencies = selected?.dependencies.filter(id => queue.items.find(item => item.id === id)?.status !== 'DONE') ?? [];
  const matchingWorkOrders = searchReviewWorkOrders(queue.items, woQuery);
  // Keep the selected option visible even if the current search filters it out.
  const visibleWorkOrders = selected && !matchingWorkOrders.some(item => item.id === selected.id)
    ? [selected, ...matchingWorkOrders] : matchingWorkOrders;
  const availableEvidence = selected ? evidenceSuggestions(selected) : [];
  const matchingEvidence = searchEvidenceSuggestions(availableEvidence, evidenceQuery);
  const selectedEvidence = availableEvidence.find(item => item.id === selectedEvidenceId);
  const visibleEvidence = selectedEvidence && !matchingEvidence.some(item => item.id === selectedEvidenceId)
    ? [selectedEvidence, ...matchingEvidence] : matchingEvidence;

  function changeWorkOrder(nextId: string) {
    if (!queue.items.some(item => item.id === nextId)) return;
    setWorkOrderId(nextId);
    setWoQuery('');
    setEvidenceQuery('');
    setSelectedEvidenceId('');
    setEvidenceUrl('');
    setReason('');
    setCaveats('');
    setResult(null);
    setFeedback('Nova WO selecionada. Campos do parecer anterior foram limpos para evitar associação de evidência incorreta.');
  }

  function chooseEvidence(id: string) {
    if (!id) {
      setSelectedEvidenceId('');
      setEvidenceUrl('');
      setResult(null);
      setFeedback('Fonte sugerida desmarcada. Informe uma URL do repositório ou escolha outra evidência.');
      return;
    }
    const url = selectReviewEvidence(availableEvidence, id);
    if (!url) {
      setFeedback('Fonte não encontrada entre as evidências da WO selecionada.');
      return;
    }
    setSelectedEvidenceId(id);
    setEvidenceUrl(url);
    setResult(null);
    setFeedback('Referência preenchida com URL do registro. Verifique o conteúdo: sugestão não é validação de evidência.');
  }

  function insertWoContext() {
    if (!selected) return;
    const context = `Contexto documentado em ${selected.id}: critério de aceite: ${selected.criteria}. Próximo passo registrado: ${selected.next}. Conferir evidências, condições e admissões antes de emitir o parecer.`;
    setReason(previous => [previous.trim(), context].filter(Boolean).join('\n').slice(0, 1200));
    setResult(null);
    setFeedback('Contexto da WO inserido para revisão; não é justificativa aprovada automaticamente.');
  }

  function selectDecision(value: DecisionChoice) {
    if (value !== 'APPROVE_WITH_RESERVATIONS') setCaveats('');
    setChoice(value);
    setResult(null);
    setFeedback(`Opção ${DECISION_LABELS[value]} selecionada. A ação prepara apenas uma minuta local.`);
  }
  function prepareDraft() {
    const candidate = buildDecisionDraft({ workOrderId, choice, reason, caveats, evidenceUrl });
    setResult(candidate);
    setFeedback(candidate.ok
      ? 'Minuta preparada nesta página. Não enviada, não assinada, sem alteração de status ou permissão.'
      : candidate.errors.join(' '));
  }
  async function copyDraft() {
    if (!result?.ok) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setFeedback('Minuta copiada. Revise-a antes de registrar manualmente em canal autorizado; copiar não aprova nem envia.');
    } catch {
      setFeedback('Não foi possível copiar. Selecione o texto da minuta para copiar manualmente.');
    }
  }

  return (
    <section className="ce-admin-panel ce-admin-review-panel" data-testid="pmo-governed-review" aria-labelledby="pmo-governed-review-heading">
      <div className="ce-admin-panel-heading">
        <div>
          <h2 id="pmo-governed-review-heading">Centro de revisão · PMO e homologação</h2>
          <p>Consulte o aceite já registrado e prepare novos pareceres, sem repetir sua aprovação nem contornar o Kernel.</p>
        </div>
        <span className="ce-admin-indicator ce-admin-indicator--warn">Admissão Kernel pendente</span>
      </div>
      <div className="ce-admin-review-evidence" role="note">
        <ClipboardList size={19} aria-hidden="true" />
        <div>
          <strong>Plano de continuidade: aprovação já registrada em 31/10/2026.</strong>
          <p>A aprovação documentada autoriza o registro e as verificações; <strong>não</strong> libera produção nem substitui assinatura do Kernel.</p>
          <a href={APPROVAL_RECORD_URL} target="_blank" rel="noopener noreferrer">Consultar aprovação e evidências <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
      </div>
      <div className="ce-commander-notice ce-commander-notice--compact" role="status">
        <ShieldAlert size={18} aria-hidden="true" />
        <p><strong>Liberação bloqueada:</strong> WO-HOM-001 permanece HOLD_HUMAN. Os botões abaixo preparam pareceres em memória, não alteram a fila, não gravam no GitHub e não executam homologação.</p>
      </div>
      <div className="ce-admin-review-search">
        <label className="ce-admin-field" htmlFor="review-wo-search">
          <span><Search size={15} aria-hidden="true" /> Pesquisar atividade do PMO <em>Por ID, título, responsável ou critério</em></span>
          <input id="review-wo-search" type="search" value={woQuery}
            onChange={event => setWoQuery(event.target.value)}
            placeholder="Ex.: homologação, segurança, WO-SEC" aria-describedby="review-wo-search-help" />
          <small id="review-wo-search-help" role="status">{matchingWorkOrders.length} de {queue.items.length} WOs correspondem à busca. Pesquisa local nos registros versionados.</small>
        </label>
        <label className="ce-admin-field" htmlFor="review-wo">
          <span>Selecionar ordem de trabalho <em>Obrigatório</em></span>
          <select id="review-wo" value={workOrderId} onChange={event => changeWorkOrder(event.target.value)} aria-describedby="review-wo-help">
            {visibleWorkOrders.map(item => <option key={item.id} value={item.id}>{item.id} · {item.title} ({statusLabels[item.status] ?? item.status})</option>)}
          </select>
          <small id="review-wo-help">Fonte: registers/pmo/queue.v1.json. A busca não cria nem altera WOs.</small>
        </label>
      </div>
      {matchingWorkOrders.length === 0 && <p role="status" className="ce-admin-detail-note">Nenhuma WO encontrada. Limpe a busca para consultar as opções existentes.</p>}
      {selected && (
        <div className="ce-admin-review-context" data-testid="review-dependencies">
          <p><strong>Estado:</strong> {statusLabels[selected.status] ?? selected.status} · <strong>Prioridade:</strong> {selected.priority} · <strong>Responsável:</strong> {selected.owner}</p>
          <p><strong>Critério de aceite:</strong> {selected.criteria}</p>
          <p><strong>Próxima ação registrada:</strong> {selected.next}</p>
          <p><strong>Dependências pendentes:</strong> {pendingDependencies.join(', ') || 'Nenhuma no PMO'} · <strong>Evidências na fila:</strong> {selected.evidence.length}.</p>
          <button type="button" className="ce-admin-btn" onClick={insertWoContext}>Inserir contexto da WO na justificativa</button>
          <small>Apenas auxílio de redação. Nenhum dado exibido prova admissão, cumprimento do critério ou homologação.</small>
        </div>
      )}
      <fieldset className="ce-admin-review-fieldset">
        <legend>Tipo de parecer a preparar</legend>
        <div className="ce-admin-review-actions">
          {decisions.map(value => (
            <button type="button" className="ce-admin-btn" aria-pressed={choice === value}
              key={value} onClick={() => selectDecision(value)}>{DECISION_LABELS[value]}</button>
          ))}
        </div>
      </fieldset>
      <label className="ce-admin-field" htmlFor="review-justification">
        <span>Justificativa para o parecer <em>Obrigatória</em></span>
        <textarea id="review-justification" value={reason} maxLength={1200} rows={3}
          onChange={event => { setReason(event.target.value); setResult(null); }}
          aria-invalid={reason.length > 0 && reason.trim().length < 16} />
        <small>16 a 1200 caracteres. Não inclua dados clínicos pessoais nem segredos.</small>
      </label>
      {choice === 'APPROVE_WITH_RESERVATIONS' && (
        <label className="ce-admin-field" htmlFor="review-caveats">
          <span>Ressalvas <em>Obrigatórias nesta opção</em></span>
          <textarea id="review-caveats" value={caveats} maxLength={1200} rows={2}
            onChange={event => { setCaveats(event.target.value); setResult(null); }}
            aria-invalid={caveats.length > 0 && caveats.trim().length < 12} />
        </label>
      )}
      <div className="ce-admin-review-search" data-testid="review-evidence-search">
        <label className="ce-admin-field" htmlFor="review-source-search">
          <span><Search size={15} aria-hidden="true" /> Pesquisar evidências registradas <em>Por título, URL ou origem</em></span>
          <input id="review-source-search" type="search" value={evidenceQuery}
            onChange={event => setEvidenceQuery(event.target.value)}
            placeholder="Ex.: CI, issue, aprovação documental" aria-describedby="review-source-help" />
          <small id="review-source-help" role="status">{matchingEvidence.length} de {availableEvidence.length} referências disponíveis para a WO. Sugestões locais; não há busca remota nem validação de links.</small>
        </label>
        <label className="ce-admin-field" htmlFor="review-evidence-option">
          <span>Selecionar evidência já registrada <em>Opcional</em></span>
          <select id="review-evidence-option" value={selectedEvidenceId} onChange={event => chooseEvidence(event.target.value)} aria-describedby="review-source-hint">
            <option value="">Escolha uma fonte sugerida ou informe manualmente</option>
            {visibleEvidence.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <small id="review-source-hint">Referências PMO da WO e, quando aplicável, registros de governança. Sempre confira o conteúdo antes de usar.</small>
        </label>
        {availableEvidence.length === 0 && <p className="ce-admin-detail-note">A WO não possui evidências sugeridas no catálogo atual. Isso não significa ausência de pendência ou aprovação.</p>}
        <label className="ce-admin-field" htmlFor="review-evidence">
          <span>URL da evidência no GitHub <em>Obrigatória para parecer favorável</em></span>
          <input id="review-evidence" value={evidenceUrl} type="url"
            placeholder="https://github.com/IndiciumFIN/dev-chatgpt-workspace/..."
            aria-describedby="review-evidence-help"
            onChange={event => {
              setEvidenceUrl(event.target.value);
              setSelectedEvidenceId('');
              setResult(null);
            }} />
          <small id="review-evidence-help">Preenchimento manual ou a partir da fonte selecionada. Outros repositórios e fontes externas não são admitidos nesta versão.</small>
        </label>
      </div>
      <div className="ce-admin-review-actions">
        <button type="button" className="ce-admin-btn ce-admin-btn--primary" onClick={prepareDraft}>
          <ClipboardList size={16} aria-hidden="true" /> Preparar minuta local
        </button>
        <a className="ce-admin-btn" href={ISSUE_URL} target="_blank" rel="noopener noreferrer">
          <ArrowUpRight size={16} aria-hidden="true" /> Consultar decisões no GitHub
        </a>
      </div>
      <p className="ce-commander-feedback" role="status" aria-live="polite">{feedback}</p>
      {result?.ok && (
        <div className="ce-admin-review-draft" data-testid="review-candidate-draft" role="region" aria-label="Minuta local não enviada">
          <strong>Minuta gerada — não enviada nem assinada</strong>
          <pre>{result.text}</pre>
          <div className="ce-admin-review-actions">
            <button type="button" className="ce-admin-btn" onClick={() => { setResult(null); setFeedback('Minuta reaberta para edição local, sem nenhuma decisão registrada.'); }}>Editar minuta</button>
            <button type="button" className="ce-admin-btn" onClick={copyDraft}><ClipboardCopy size={15} aria-hidden="true" /> Copiar minuta para revisão</button>
          </div>
        </div>
      )}
      <p className="ce-admin-detail-note"><LockKeyhole size={14} aria-hidden="true" /> Nenhuma decisão é persistida nesta interface. O fluxo definitivo exige autenticação, segregação de funções, registro imutável e validação da admissão pelo Kernel.</p>
    </section>
  );
}
