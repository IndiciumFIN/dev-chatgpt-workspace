import { useState } from 'react';
import { Download, FileCheck2 } from 'lucide-react';
import review from '../../../registers/governance/r84-pmo-owner-decision-intake-20261031.v1.json';

/**
 * Local, non-binding preparation only. It never mutates the PMO queue, calls
 * a remote endpoint, authenticates an approver or asserts Kernel admission.
 */
export function PmoReviewIntake() {
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const selectedCount = review.decisions.filter(item => Boolean(choices[item.id])).length;

  function downloadDraft() {
    const selected = review.decisions
      .filter(item => Boolean(choices[item.id]))
      .map(item => ({
        decisionId: item.id,
        proposedChoice: choices[item.id],
        rationale: (justifications[item.id] ?? '').trim(),
        sourceRecordId: review.recordId,
        evidencePaths: item.evidencePaths,
        reviewState: 'UNSUBMITTED_LOCAL_DRAFT',
      }));
    if (!selected.length) {
      setMessage('Selecione pelo menos um encaminhamento para criar a minuta.');
      return;
    }
    const draft = {
      schemaVersion: '1.0.0',
      recordType: 'NON_BINDING_LOCAL_REVIEW_DRAFT',
      sourceRecordId: review.recordId,
      decisionProposals: selected,
      pendingOwnerDecisions: review.decisions.length,
      ownerIdentityVerified: false,
      checkerIdentityVerified: false,
      signatureVerified: false,
      kernelAdmission: 'NOT_VERIFIED',
      canonicalRevisionElected: false,
      workOrderChanged: false,
      eventReplayAuthorized: false,
      releaseGate: 'HOLD_HUMAN',
      nextStep: 'Submit as evidence for authenticated owner decision and independent checker; do not treat this file as approval.',
    };
    const data = new Blob([JSON.stringify(draft, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pmo-r84-minuta-nao-assinada.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setMessage('Minuta JSON gerada neste navegador. Não foi enviada, assinada, aprovada ou registrada no Kernel.');
  }

  return (
    <section className="ce-admin-panel" data-testid="pmo-decision-review" aria-labelledby="pmo-decision-review-heading">
      <div className="ce-admin-panel-heading">
        <div>
          <h2 id="pmo-decision-review-heading">Arbitragem PMO — quatro decisões pendentes</h2>
          <p>Revisão preparatória da divergência entre cinco filas. Nenhuma revisão foi eleita.</p>
        </div>
        <span className="ce-admin-indicator ce-admin-indicator--warn">HOLD_HUMAN</span>
      </div>
      <p className="ce-admin-detail-note">
        Este formulário prepara uma <strong>minuta local, não uma aprovação</strong>. A decisão válida exige identidade verificada,
        revisão independente e admissão assinada do Kernel. Os dados não são enviados nem persistidos.
      </p>
      <div className="ce-admin-review-list">
        {review.decisions.map((item, index) => (
          <fieldset key={item.id} className="ce-admin-review-item" data-review-id={item.id}>
            <legend><strong>{index + 1}. {item.subject}</strong> <small>{item.id}</small></legend>
            <p className="ce-admin-review-observation">{item.sourceObservation}</p>
            <label htmlFor={item.id + '-choice'}>Encaminhamento proposto</label>
            <select
              id={item.id + '-choice'}
              value={choices[item.id] ?? ''}
              onChange={event => {
                setChoices(prev => ({ ...prev, [item.id]: event.target.value }));
                setMessage('');
              }}
            >
              <option value="">Ainda não selecionado</option>
              {item.options.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
            </select>
            {item.options.find(option => option.code === choices[item.id]) && (
              <p className="ce-admin-review-observation">
                {item.options.find(option => option.code === choices[item.id])?.effect}
              </p>
            )}
            <label htmlFor={item.id + '-justification'}>Justificativa ou ressalvas (minuta)</label>
            <textarea
              id={item.id + '-justification'}
              rows={2}
              maxLength={1000}
              value={justifications[item.id] ?? ''}
              placeholder="Descreva evidências, condições e pontos que ainda exigem verificação."
              onChange={event => setJustifications(prev => ({ ...prev, [item.id]: event.target.value }))}
            />
            <p className="ce-admin-review-note">Estado oficial: {item.reviewState.replaceAll('_', ' ')}. Nenhum efeito na fila.</p>
          </fieldset>
        ))}
      </div>
      <div className="ce-admin-review-actions">
        <button type="button" className="ce-admin-btn" disabled={selectedCount === 0} onClick={downloadDraft}>
          <Download size={16} aria-hidden="true" /> Baixar minuta JSON ({selectedCount}/4)
        </button>
        <a
          href="https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/26"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileCheck2 size={16} aria-hidden="true" /> Consultar o dossiê no GitHub
        </a>
      </div>
      <p role="status" aria-live="polite" className="ce-admin-detail-note">{message || 'Sem decisão assinada; sem escrita remota.'}</p>
    </section>
  );
}
