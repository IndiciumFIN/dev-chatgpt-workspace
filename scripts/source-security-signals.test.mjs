import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditSourceSecuritySignals } from './lib/source-security-signals.mjs';

const blob = value => ({ mode: '100644', type: 'blob', oid: value.repeat(40) });

test('reports literal preview credentials without copying their values into the report', () => {
  const credential = 'secret-value-that-must-not-leak';
  const result = auditSourceSecuritySignals(
    [
      {
        path: 'src/lib/auth/preview.ts',
        candidateEntry: blob('a'),
        sourceEntries: [
          { branch: 'source', entry: blob('b') },
        ],
      },
    ],
    oid =>
      oid === 'a'.repeat(40)
        ? 'export const PREVIEW_CLIENT_SECRET = process.env.SECRET ?? "";'
        : `export const PREVIEW_CLIENT_SECRET = "${credential}";`,
  );
  assert.equal(result.candidateSignals.length, 0);
  assert.equal(result.sourceSignals[0].signal, 'LITERAL_PREVIEW_OAUTH_SECRET');
  assert.equal(result.sourceSignals[0].line, 1);
  assert.equal(JSON.stringify(result).includes(credential), false);
});

test('reports source auth defaults that enable sign-in unless explicitly disabled', () => {
  const result = auditSourceSecuritySignals(
    [
      {
        path: 'src/lib/auth/client.ts',
        candidateEntry: blob('a'),
        sourceEntries: [{ branch: 'source', entry: blob('b') }],
      },
      {
        path: 'src/lib/auth/server.ts',
        candidateEntry: blob('c'),
        sourceEntries: [{ branch: 'source', entry: blob('d') }],
      },
    ],
    oid =>
      ({
        ['a'.repeat(40)]: 'export const authEnabled = import.meta.env.VITE_AUTH_ENABLED === "true";',
        ['b'.repeat(40)]: 'export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";',
        ['c'.repeat(40)]: 'const authDisabled = env("VITE_AUTH_ENABLED") !== "true";',
        ['d'.repeat(40)]: 'const authDisabled = env("VITE_AUTH_ENABLED") === "false";',
      })[oid],
  );
  assert.equal(result.candidateSignals.length, 0);
  assert.deepEqual(
    result.sourceSignals.map(signal => signal.signal),
    ['AUTH_ENABLED_BY_DEFAULT', 'AUTH_ENABLED_BY_DEFAULT'],
  );
  assert.equal(result.sourceVariantsChecked, 2);
});

test('ignores paths outside the narrow auth review scope', () => {
  const result = auditSourceSecuritySignals(
    [
      {
        path: 'package.json',
        candidateEntry: blob('a'),
        sourceEntries: [{ branch: 'source', entry: blob('b') }],
      },
    ],
    () => {
      throw new Error('UNEXPECTED_BLOB_READ');
    },
  );
  assert.equal(result.candidateVariantsChecked, 0);
  assert.equal(result.sourceVariantsChecked, 0);
});
