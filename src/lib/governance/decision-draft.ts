/** A local review proposal is not a PMO transition or a signed Kernel admission. */
export type DecisionChoice = 'REVIEW' | 'REQUEST_CHANGES' | 'APPROVE_WITH_RESERVATIONS' | 'APPROVE';
export type DecisionInput = {
  workOrderId: string;
  choice: DecisionChoice;
  reason: string;
  caveats?: string;
  evidenceUrl?: string;
};
export type DecisionResult =
  | { ok: true; status: 'NOT_SUBMITTED'; promotionAllowed: false; text: string }
  | { ok: false; status: 'NOT_SUBMITTED'; promotionAllowed: false; errors: string[] };

export const DECISION_LABELS: Record<DecisionChoice, string> = {
  REVIEW: 'Revisar',
  REQUEST_CHANGES: 'Solicitar ajustes',
  APPROVE_WITH_RESERVATIONS: 'Aprovar com ressalvas',
  APPROVE: 'Aprovar',
};
const GITHUB_REPO = 'https://github.com/IndiciumFIN/dev-chatgpt-workspace/';
const ALLOWED = new Set<DecisionChoice>(['REVIEW', 'REQUEST_CHANGES', 'APPROVE_WITH_RESERVATIONS', 'APPROVE']);

export function buildDecisionDraft(input: DecisionInput): DecisionResult {
  const errors: string[] = [];
  const workOrderId = String(input.workOrderId ?? '').trim();
  const reason = String(input.reason ?? '').trim();
  const caveats = String(input.caveats ?? '').trim();
  const evidenceUrl = String(input.evidenceUrl ?? '').trim();
  if (!/^WO-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(workOrderId)) errors.push('WO inválida ou ausente.');
  if (!ALLOWED.has(input.choice)) errors.push('Decisão não reconhecida.');
  if (reason.length < 16 || reason.length > 1200) errors.push('Justificativa obrigatória: 16 a 1200 caracteres.');
  if (input.choice === 'APPROVE_WITH_RESERVATIONS' && caveats.length < 12) {
    errors.push('Informe as ressalvas com pelo menos 12 caracteres.');
  }
  if (caveats.length > 1200) errors.push('Ressalvas excedem 1200 caracteres.');
  if (evidenceUrl && (!evidenceUrl.startsWith(GITHUB_REPO) || /\s/.test(evidenceUrl))) {
    errors.push('Evidência deve ser um link do repositório GitHub do projeto.');
  }
  if ((input.choice === 'APPROVE' || input.choice === 'APPROVE_WITH_RESERVATIONS') && !evidenceUrl) {
    errors.push('Parecer favorável exige URL de evidência.');
  }
  if (errors.length) return { ok: false, status: 'NOT_SUBMITTED', promotionAllowed: false, errors };
  // Hide/clear reservations from all choices except explicit conditional approval.
  const effectiveCaveats = input.choice === 'APPROVE_WITH_RESERVATIONS' ? caveats : '';
  const label = DECISION_LABELS[input.choice];
  const text = [
    '## MINUTA DE PARECER — NÃO ENVIADA / NÃO ASSINADA',
    `**WO:** ${workOrderId}`,
    `**Proposta:** ${label}`,
    `**Justificativa:** ${reason}`,
    `**Ressalvas:** ${effectiveCaveats || 'Não registradas'}`,
    `**Evidência:** ${evidenceUrl || 'Não informada'}`,
    '**Status:** NOT_SUBMITTED (somente memória da interface)',
    '**Admissão Kernel:** NOT_VERIFIED',
    '**Efeito:** nenhum; não altera PMO, não autoriza merge, deploy nem homologação.',
    'Após revisão independente, registrar em canal autorizado com identidade, SHA e trilha verificável.',
  ].join('\n\n');
  return { ok: true, status: 'NOT_SUBMITTED', promotionAllowed: false, text };
}
