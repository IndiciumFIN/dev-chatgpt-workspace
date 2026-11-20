#!/usr/bin/env node
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shell = readFileSync("src/components/site/shell.tsx", "utf8");
const nav = readFileSync("src/components/site/site-nav.tsx", "utf8");
const login = readFileSync("src/routes/login.tsx", "utf8");
const client = readFileSync("src/lib/auth/client.ts", "utf8");

test("a topbar usa o slot de conta com rota por papel sem link incondicional privilegiado", () => {
  assert.match(shell, /<AccountSlot className="utility-login" \/>/);
  assert.match(nav, /const signedIn = Boolean\(user && role\)/);
  assert.match(nav, /role === "admin" \? "\/admin" : role === "subscriber" \? "\/assinante" : "\/login"/);
  assert.match(nav, /<Link to=\{to\}/);
  assert.match(nav, /\{signedIn \? label : navLabel\("entrar", "Entrar", locale\)\}/);
  assert.match(nav, /if \(isPending \|\| \(user && !role\)\) return <span className="auth-skeleton"/);
});

test("o cabeçalho mantém classe CSS e tradução canônica de entrada", () => {
  assert.match(shell, /className="header-utility-end"/);
  assert.match(shell, /<AccountSlot className="utility-login" \/>/);
  assert.match(nav, /navLabel\("entrar", "Entrar", locale\)/);
});

test("rota de login só renderiza provedor no ramo autenticado", () => {
  assert.match(login, /\{authEnabled \? \(/);
  assert.match(login, /<SignInGate fallback=\{<SignInPanel \/>\}>/);
  assert.match(login, /<AuthOffPanel \/>/);
  assert.match(client, /export const authEnabled = import\.meta\.env\.VITE_AUTH_ENABLED === "true"/);
  assert.doesNotMatch(client, /export const authEnabled = import\.meta\.env\.VITE_AUTH_ENABLED !== "false"/);
  assert.match(login, /A autenticação não está habilitada neste ambiente/);
});

test("autenticação desativada não oferece login fictício nem atalho de área restrita", () => {
  const disabled = login.slice(login.indexOf("function AuthOffPanel()"), login.indexOf("function SignInPanel()"));
  const enabled = login.slice(login.indexOf("function SignInPanel()"));
  assert.ok(disabled.startsWith("function AuthOffPanel()"), "painel desligado deve existir");
  assert.match(disabled, /role="status" aria-live="polite"/);
  assert.match(disabled, /não inicia sessão nem concede acesso/);
  assert.doesNotMatch(disabled, /<form\b|\.signIn|signIn\(|to: "\/assinante"/);
  assert.match(enabled, /<form className="login-form"/);
});
