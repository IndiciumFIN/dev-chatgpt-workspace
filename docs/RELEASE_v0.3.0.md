# WU-TRIB · Wave 03 — Triagem demonstrativa de achados

Data: 2026-11-08. WO candidata: `WUTRIB-WO-PLAN-010`. Ação: implementação de piloto com **dados fictícios**, sem login, ERP, API ou persistência Supabase.

## Objetivo verificável

Permitir ao auditor testar a gestão de investigação de cada diferença estrutural, sem simular aprovação fiscal. Funcionalidades: filtro de triagem, anotação por achado, estado local, dossiê JSON com histórico demonstrativo, CSV com status/nota neutralizados contra fórmulas.

## Modelo de estado

`PENDING`, `INVESTIGATING`, `NEEDS_EVIDENCE`, `REVIEW_NOTE`. `NOT_APPROVED`, `NOT_EVALUATED` e `HYPOTHESIS_NOT_CONFIRMED` são invariantes dos registros. Não existe `CONFIRMED`, `CLOSED`, `APPROVED` ou estado equivalente. Identidade não autenticada.

## Integridade, limites e segurança

Toda mudança de origem reinicializa o registro de triagem. Reexecução dos mesmos arquivos mantém notas dentro da aba atual. Recarregar fecha a sessão e elimina registros. O ledger não usa cookies, `localStorage`, IndexedDB, rede ou API. Máximo de 1.200 caracteres por anotação e 500 eventos por sessão demonstrativa. Texto de usuário é renderizado via `textContent`. CSV neutraliza possíveis fórmulas. Dossiê inclui aviso de ausência de assinatura e de valor fiscal.

## Gates

`npm run check` (cinco verificadores + testes Node) e `python tests/browser_e2e.py` (Chromium local por injeção, desktop/celular). Após commit, verificar CI do GitHub e HTTPS no Vercel para o mesmo SHA. NÃO promover quando CI ou preview falharem.

## Limites

O fluxo é demonstrativo, sem armazenamento durável, XSD, validação EFD oficial, regras tributárias homologadas ou integração Protheus. Não carregar dados empresariais reais no site público.
