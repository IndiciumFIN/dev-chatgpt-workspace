export function parseTreeEntries(raw) {
  const entries = new Map();
  for (const record of raw.toString('utf8').split('\0')) {
    if (!record) continue;
    const separator = record.indexOf('\t');
    if (separator < 0) throw new Error('MALFORMED_LS_TREE');
    const [mode, type, oid] = record.slice(0, separator).split(' ');
    if (!mode || !type || !/^[a-f0-9]{40,64}$/.test(oid ?? '')) {
      throw new Error('MALFORMED_LS_TREE_ENTRY');
    }
    entries.set(record.slice(separator + 1), { mode, type, oid });
  }
  return entries;
}

export function entryKey(entry) {
  return entry ? `${entry.mode}:${entry.type}:${entry.oid}` : null;
}

export function summarizePath({
  path,
  baselineEntry,
  candidateEntry,
  sourceEntries,
}) {
  if (!path || !Array.isArray(sourceEntries) || sourceEntries.length === 0) {
    throw new Error('INVALID_PATH_EVIDENCE');
  }
  const variants = new Map();
  for (const source of sourceEntries) {
    if (!source.branch || !/^[a-f0-9]{40,64}$/.test(source.commit ?? '')) {
      throw new Error('INVALID_SOURCE_LINEAGE');
    }
    if (
      !/^[a-f0-9]{40,64}$/.test(source.comparisonBaseCommit ?? '') ||
      (source.comparisonBaseEntry !== null &&
        typeof source.comparisonBaseEntry !== 'object')
    ) {
      throw new Error('INVALID_COMPARISON_BASE');
    }
    const key = entryKey(source.entry) ?? 'DELETED';
    const variant = variants.get(key) ?? [];
    variant.push(source);
    variants.set(key, variant);
  }
  const commonEntry = variants.size === 1 ? sourceEntries[0].entry : null;
  const commonKey = variants.size === 1 ? entryKey(commonEntry) ?? 'DELETED' : null;
  const candidateKey = entryKey(candidateEntry) ?? 'DELETED';

  return {
    path,
    baselineEntry,
    candidateEntry,
    sourceBranchCount: sourceEntries.length,
    sourceVersionCount: variants.size,
    sourceBranchesAgree: variants.size === 1,
    commonSourceEntry: variants.size === 1 ? commonEntry : null,
    candidateMatchesCommonSource:
      variants.size === 1 && candidateKey === commonKey,
    candidateMatchesAnySource: variants.has(candidateKey),
    sourceEntries: sourceEntries
      .map(({ branch, commit, comparisonBaseCommit, comparisonBaseEntry, entry }) => ({
        branch,
        commit,
        comparisonBaseCommit,
        comparisonBaseEntry,
        entry,
      }))
      .sort((a, b) => a.branch.localeCompare(b.branch)),
  };
}
