const SCANNED_PATHS = new Set([
  'src/lib/auth/client.ts',
  'src/lib/auth/preview.ts',
  'src/lib/auth/server.ts',
]);

const PATTERNS = {
  'src/lib/auth/client.ts': [
    {
      signal: 'AUTH_ENABLED_BY_DEFAULT',
      pattern: /authEnabled\s*=\s*import\.meta\.env\.VITE_AUTH_ENABLED\s*!==\s*["']false["']/,
    },
  ],
  'src/lib/auth/preview.ts': [
    {
      signal: 'LITERAL_PREVIEW_OAUTH_SECRET',
      pattern:
        /PREVIEW_CLIENT_SECRET\s*=\s*(?:\r?\n\s*)?["']([^"'\r\n]{16,})["']/,
    },
  ],
  'src/lib/auth/server.ts': [
    {
      signal: 'AUTH_ENABLED_BY_DEFAULT',
      pattern: /authDisabled\s*=\s*env\(["']VITE_AUTH_ENABLED["']\)\s*===\s*["']false["']/,
    },
  ],
};

function scan(path, text, branch, blob) {
  return PATTERNS[path]
    .map(({ signal, pattern }) => {
      const match = pattern.exec(text);
      if (!match) return null;
      return {
        path,
        branch,
        blob,
        line: text.slice(0, match.index).split('\n').length,
        signal,
      };
    })
    .filter(Boolean);
}

export function auditSourceSecuritySignals(records, readBlob) {
  if (!Array.isArray(records) || typeof readBlob !== 'function') {
    throw new Error('INVALID_SECURITY_SIGNAL_INPUT');
  }

  const candidateSignals = [];
  const sourceSignals = [];
  let candidateVariantsChecked = 0;
  let sourceVariantsChecked = 0;

  for (const record of records) {
    if (!SCANNED_PATHS.has(record.path)) continue;
    if (record.candidateEntry?.type === 'blob') {
      candidateVariantsChecked++;
      candidateSignals.push(
        ...scan(
          record.path,
          readBlob(record.candidateEntry.oid),
          'CANDIDATE',
          record.candidateEntry.oid,
        ),
      );
    }
    for (const source of record.sourceEntries) {
      if (source.entry?.type !== 'blob') continue;
      sourceVariantsChecked++;
      sourceSignals.push(
        ...scan(record.path, readBlob(source.entry.oid), source.branch, source.entry.oid),
      );
    }
  }

  return {
    scope: [...SCANNED_PATHS].sort(),
    candidateVariantsChecked,
    sourceVariantsChecked,
    candidateSignals,
    sourceSignals,
    limitation:
      'Pattern-based review of auth configuration conflicts only; it does not prove a secret is active, revoked, or absent elsewhere.',
  };
}
