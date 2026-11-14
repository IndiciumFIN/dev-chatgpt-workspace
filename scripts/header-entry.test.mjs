#!/usr/bin/env node
/** NCOS header/auth integration: assertions against the current governed AccountSlot contract. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync("src/components/site/shell.tsx", "utf8");
const nav = readFileSync("src/components/site/site-nav.tsx", "utf8");
const login = readFileSync("src/routes/login.tsx", "utf8");
const client = readFileSync("src/lib/auth/client.ts", "utf8");

const slotStart = nav.indexOf("export function AccountSlot(");
const slotEnd = nav.indexOf("function go(", slotStart);
const slot = nav.slice(slotStart, slotEnd);

test("topbar always mounts governed AccountSlot, not a stale unconditional login link", () => {
  assert.match(shell, /<AccountSlot className="utility-login"\s*\/>/);
  assert.ok(slotStart >= 0 && slotEnd > slotStart, "AccountSlot has a defined implementation");
  assert.match(slot, /<Link to=\{to\}/);
  assert.match(slot, /role === "admin"\s*\? "\/admin"\s*:\s*role === "subscriber"\s*\? "\/assinante"\s*:\s*"\/login"/);
  assert.match(slot, /if \(isPending \|\| \(user && !role\)\) return <span className="auth-skeleton"/);
  assert.match(slot, /const signedIn = Boolean\(user && role\)/);
});

test("header reuses existing design classes and localized account label", () => {
  assert.match(shell, /className="header-utility-end"/);
  assert.match(nav, /navLabel\("entrar", "Entrar", locale\)/);
  assert.match(slot, /className=\{\`\$\{className \?\? ""\}/);
});

test("login page gates real sign-in with the existing client auth switch", () => {
  assert.match(client, /export const authEnabled = import\.meta\.env\.VITE_AUTH_ENABLED === "true"/);
  assert.match(login, /\{authEnabled \? \(/);
  assert.match(login, /<SignInGate fallback=\{<SignInPanel \/>\}>/);
  assert.match(login, /<AuthOffPanel \/>/);
  assert.match(login, /<Navigate to="\/sessao" \/>/);
});

test("disabled authentication presents only a safe informational panel", () => {
  const offStart = login.indexOf("function AuthOffPanel()");
  const liveStart = login.indexOf("function SignInPanel()");
  assert.ok(offStart >= 0 && liveStart > offStart);
  const off = login.slice(offStart, liveStart);
  assert.match(off, /A autenticação está desligada neste ambiente/);
  assert.match(off, /Continuar sem entrar/);
  assert.match(off, /role="status" aria-live="polite"/);
  assert.doesNotMatch(off, /<form|signIn\(|signUp\(|GROK_PROVIDERS/);
  assert.match(login.slice(liveStart), /<form className="login-form" onSubmit=\{onEmail\}>/);
});
