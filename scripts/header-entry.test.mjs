#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shell = readFileSync('src/components/site/shell.tsx', 'utf8');
const login = readFileSync('src/routes/login.tsx', 'utf8');
const client = readFileSync('src/lib/auth/client.ts', 'utf8');

test('Entrar is always visible in the topbar and routes to /login', () => {
  assert.match(shell, /<Link to="\/login" className="utility-login" aria-label=\{chrome\.t\("enter"\)\}>/);
  assert.doesNotMatch(shell, /authEnabled\s*\?\s*<Link[^>]*className="utility-login"/);
});

test('header reuses canonical translations and existing styling', () => {
  assert.match(shell, /\{chrome\.t\("enter"\)\}/);
  assert.match(shell, /className="header-utility-end"/);
  assert.match(shell, /className="utility-login"/);
});

test('login remains gated by the real existing authentication switch', () => {
  assert.match(login, /if \(!authEnabled\) return/);
  assert.match(client, /export const authEnabled = import\.meta\.env\.VITE_AUTH_ENABLED === "true"/);
  assert.match(login, /A autenticação não está habilitada neste ambiente/);
  assert.match(login, /não inicia sessão nem concede acesso/);
});

test('disabled authentication cannot expose a fake sign-in form', () => {
  const disabled = login.indexOf('if (!authEnabled) return');
  const providers = login.indexOf('className="login-panel"');
  assert.ok(disabled > 0 && providers > disabled);
  assert.match(login, /role="status" aria-live="polite"/);
});
