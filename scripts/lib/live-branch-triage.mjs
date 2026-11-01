import { entryKey } from './branch-canonicalization.mjs';
import { triageCanonicalConflict } from './canonical-conflict-triage.mjs';

export function buildLiveBranchTriage(auditReport) {
  if (
    auditReport?.reportType !== 'READ_ONLY_BRANCH_CANONICALIZATION_INVENTORY' ||
    !Array.isArray(auditReport.records) ||
    !Array.isArray(auditReport.semanticI18n?.equivalent)
  ) {
    throw new Error('INVALID_LIVE_BRANCH_AUDIT');
  }

  const equivalentPaths = new Set(
    auditReport.semanticI18n.equivalent.map(record => record.path),
  );
  const conflicts = auditReport.records.filter(record => record.sourceVersionCount > 1);
  if (new Set(conflicts.map(record => record.path)).size !== conflicts.length) {
    throw new Error('DUPLICATE_CONFLICT_PATH');
  }

  const items = conflicts.map(record => {
    const triage = triageCanonicalConflict(record.path, {
      equivalent: equivalentPaths.has(record.path),
    });
    if (
      triage.candidateSource?.sourceBranch !== undefined &&
      triage.candidateSource.sourceBranch !== 'main' &&
      !record.sourceEntries.some(
        source => source.branch === triage.candidateSource.sourceBranch,
      )
    ) {
      throw new Error(`CANDIDATE_SOURCE_NOT_IN_CONFLICT:${record.path}`);
    }
    if (triage.candidateSource?.sourceBranch === 'main' && !record.baselineEntry) {
      throw new Error(`BASELINE_SOURCE_NOT_PRESENT:${record.path}`);
    }

    const sourceVersions = new Map();
    for (const source of record.sourceEntries) {
      const key = entryKey(source.entry) ?? 'DELETED';
      const branches = sourceVersions.get(key) ?? [];
      branches.push(source.branch);
      sourceVersions.set(key, branches);
    }
    if (sourceVersions.size !== record.sourceVersionCount) {
      throw new Error(`SOURCE_VERSION_COUNT_MISMATCH:${record.path}`);
    }

    return {
      ...triage,
      sourceVersionCount: record.sourceVersionCount,
      baselineEntry: record.baselineEntry,
      candidateEntry: record.candidateEntry,
      sourceVersions: [...sourceVersions].map(([version, branches]) => ({
        version,
        branches: branches.sort(),
      })),
      sourceEntries: record.sourceEntries.map(source => ({
        branch: source.branch,
        commit: source.commit,
        comparisonBaseCommit: source.comparisonBaseCommit,
        comparisonBaseEntry: source.comparisonBaseEntry,
        entry: source.entry,
      })),
    };
  });

  const byWorkOrder = {};
  const byDomain = {};
  for (const item of items) {
    if (item.proposedWo) byWorkOrder[item.proposedWo] = (byWorkOrder[item.proposedWo] ?? 0) + 1;
    byDomain[item.domain] = (byDomain[item.domain] ?? 0) + 1;
  }
  const counts = {
    total: items.length,
    semanticEquivalentNotAdmitted: items.filter(
      item => item.preliminaryDisposition === 'SEMANTIC_EQUIVALENT_NOT_ADMITTED',
    ).length,
    requiringReconciliation: items.filter(
      item => item.preliminaryDisposition === 'CONFLICT_REQUIRES_REVIEW',
    ).length,
    candidateWoMappings: items.filter(item => item.mappingStatus === 'CANDIDATE_WO_MAPPING').length,
    unresolvedWoMappings: items.filter(item => item.mappingStatus === 'WO_MAPPING_REQUIRED').length,
    candidateSourceSuggestions: items.filter(item => item.candidateSource !== null).length,
    formallyApproved: 0,
  };
  if (counts.total !== counts.semanticEquivalentNotAdmitted + counts.requiringReconciliation) {
    throw new Error('INCOMPLETE_LIVE_TRIAGE');
  }

  return {
    schemaVersion: '1.0.0',
    reportType: 'READ_ONLY_LIVE_BRANCH_CONFLICT_TRIAGE',
    auditGeneratedAt: auditReport.generatedAt,
    baseline: auditReport.baseline,
    candidate: auditReport.candidate,
    sourceBranchCount: auditReport.sourceBranches.length,
    counts,
    byWorkOrder: Object.fromEntries(
      Object.entries(byWorkOrder).sort(([a], [b]) => a.localeCompare(b)),
    ),
    byDomain: Object.fromEntries(
      Object.entries(byDomain).sort(([a], [b]) => a.localeCompare(b)),
    ),
    items: items.sort((a, b) => a.path.localeCompare(b.path)),
    releaseGate: 'HOLD_HUMAN',
    mainUpdated: false,
    limitations: [
      'WO labels and source suggestions are pre-triage only; they are not assignments or approvals.',
      'Semantic equivalence does not admit a source owner or approve translation content.',
      'Deleted source entries remain explicit and are never treated as permission to delete.',
      'No source branch merge, canonical promotion, or main update was performed.',
    ],
  };
}
