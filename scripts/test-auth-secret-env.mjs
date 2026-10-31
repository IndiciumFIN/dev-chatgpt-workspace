#!/usr/bin/env node
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const preview=readFileSync('src/lib/auth/preview.ts','utf8');
const server=readFileSync('src/lib/auth/server.ts','utf8');
const client=readFileSync('src/lib/auth/client.ts','utf8');

test('preview OAuth credential is not committed as a literal',()=>{
  assert.doesNotMatch(preview,/PREVIEW_CLIENT_SECRET\s*=\s*["'][^"']{16,}["']/);
  assert.doesNotMatch(preview,/PREVIEW_CLIENT_SECRET\s*=\s*\n\s*["'][^"']{16,}["']/);
  assert.match(preview,/process\.env\.GROK_PREVIEW_CLIENT_SECRET\?\.trim\(\)\s*\?\?\s*""/);
});
test('server authentication is off unless explicitly enabled',()=>{
  assert.match(server,/const authDisabled = env\("VITE_AUTH_ENABLED"\) !== "true";/);
  assert.match(server,/!authDisabled && Boolean\(grokClientId && grokClientSecret\)/);
});
test('client login flag is consistent with explicit server opt-in',()=>{
  assert.match(client,/export const authEnabled = import\.meta\.env\.VITE_AUTH_ENABLED === "true";/);
});
test('server still requires valid provider credentials and refuses silent auth fallback',()=>{
  assert.match(server,/const grokClientSecret = env\("GROK_AUTH_CLIENT_SECRET"\) \?\? PREVIEW_CLIENT_SECRET;/);
  assert.match(server,/const grokOAuthPlugin = authConfigured/);
});
test('sign-in uses Better Auth 1.7 social client, not removed generic OAuth client',()=>{
  assert.match(client,/authClient\.signIn\.social\(/);
  assert.doesNotMatch(client,/signIn\.oauth2\(/);
  assert.doesNotMatch(client,/genericOAuthClient/);
});
