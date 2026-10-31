/**
 * Read-only search over sources already versioned in the canonical PMO.
 * Search suggestions are NOT evidence validation or Kernel admission.
 */
export type ReviewWorkOrder = {
  id: string;
  title: string;
  status: string;
  criteria: string;
  next: string;
  owner: string;
  priority: string;
  evidence: readonly string[];
};
export type ReviewEvidenceOption = {
  id: string;
  label: string;
  url: string;
  origin: 'PMO' | 'GOVERNANCE';
  advisory: true;
};

const REPO_PREFIX = 'https://github.com/IndiciumFIN/dev-chatgpt-workspace/';
const APPROVAL_RECORD_URL = REPO_PREFIX +
  'blob/plan/pmokernel-finalization-20261031/registers/governance/approval-pmokernel-audit-20261031.v1.json';
const ISSUE_URL = REPO_PREFIX + 'issues/25';
const MAX_OPTIONS = 100;

/** Validate the parsed destination, not a raw prefix that URL traversal can escape. */
export function isCanonicalRepoEvidenceUrl(value: string): boolean {
  if (!value || /[\s\\]/.test(value) || /%(?:2e|2f|5c)/i.test(value)) return false;
  try {
    const parsed = new URL(value);
    const prefix = '/IndiciumFIN/dev-chatgpt-workspace/';
    return parsed.protocol === 'https:' && parsed.hostname === 'github.com' &&
      !parsed.username && !parsed.password && !parsed.port &&
      parsed.pathname.startsWith(prefix) && parsed.pathname.length > prefix.length &&
      !parsed.pathname.includes('//');
  } catch {
    return false;
  }
}

export function normalizeReviewSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

/** Search only the known work orders — never invent a record from typed text. */
export function searchReviewWorkOrders<T extends ReviewWorkOrder>(items: readonly T[], query: string): T[] {
  const normalized = normalizeReviewSearch(query);
  if (!normalized) return [...items];
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return items.filter(item => tokens.every(token =>
    normalizeReviewSearch([item.id, item.title, item.status, item.criteria, item.next, item.owner, item.priority].join(' ')).includes(token)
  ));
}

/** Suggestions are derived from the selected WO and explicitly scoped governance links. */
export function evidenceSuggestions(item: ReviewWorkOrder): ReviewEvidenceOption[] {
  const output: ReviewEvidenceOption[] = [];
  const seen = new Set<string>();
  function push(url: string, label: string, origin: ReviewEvidenceOption['origin']) {
    if (!isCanonicalRepoEvidenceUrl(url) || seen.has(url) || output.length >= MAX_OPTIONS) return;
    seen.add(url);
    output.push({ id: `evidence-${output.length + 1}`, label, url, origin, advisory: true });
  }
  item.evidence.forEach((url, index) => push(url, `Evidência PMO ${index + 1} · ${item.id}`, 'PMO'));
  if (['WO-ADM-001', 'WO-PMO-001', 'WO-HOM-001'].includes(item.id)) {
    push(APPROVAL_RECORD_URL, 'Aprovação documental do plano · sem admissão Kernel', 'GOVERNANCE');
    push(ISSUE_URL, 'Issue #25 · gaps PMO × Kernel ainda abertos', 'GOVERNANCE');
  }
  return output;
}

/** Filter a selected WO's actual source URLs, with stable ordering. */
export function searchEvidenceSuggestions(options: readonly ReviewEvidenceOption[], query: string): ReviewEvidenceOption[] {
  const normalized = normalizeReviewSearch(query);
  if (!normalized) return [...options];
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return options.filter(option => tokens.every(token =>
    normalizeReviewSearch(`${option.label} ${option.url} ${option.origin}`).includes(token)
  ));
}

/** A native selector must never choose a source from another WO. */
export function selectReviewEvidence(options: readonly ReviewEvidenceOption[], id: string): string | null {
  return options.find(option => option.id === id)?.url ?? null;
}
