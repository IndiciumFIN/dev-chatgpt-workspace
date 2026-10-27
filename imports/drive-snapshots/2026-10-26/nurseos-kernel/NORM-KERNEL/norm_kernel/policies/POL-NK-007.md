# POL-NK-007 — Investigação Formal de Findings (v1.0.0)

**Status:** Active · **Severity:** blocking · **Aprovado por:** Leivis Lima (diretriz 2026-09-29)
**Gate:** G10-findings · **Registro:** registers/findings.json

## Enunciado

Finding não se apenas corrige: investiga-se. A correção sem investigação é
violação — precisa entender onde o processo nasceu errado, com fatos,
evidências e remediação documentada com aprovação DO KERNEL e DO HUMANO.

## Cláusulas

- **C1 Nascimento.** Finding nasce automático no bloqueio (G8/G9/deploy
  gate, POL-NK-006 C3) ou por OS. Todo bloqueio relevante vira finding —
  bloqueio sem finding é débita de auditoria.
- **C2 Protocolo 5W (investigação formal).** Cada finding documenta:
  (1) **What** — o fato observado vs. o esperado; (2) **Where born** — onde o
  processo nasceu errado (qual política/cláusula faltou ou falhou, em qual
  momento da evolução); (3) **Why** — causa-raiz com fatos e evidências
  (refs a OS/gates/records); (4) **Remediation** — o que foi feito, com OS
  refs e políticas alteradas; (5) **Prevention** — como o processo passa a
  impedir recorrência (nova cláusula/gate/invariante).
- **C3 Aprovação dupla para fechamento.** Fechamento exige aprovação do
  KERNEL (assinatura/gate) E do HUMANO (Leivis). Finding sem causa-raiz não
  fecha; finding sem remediação rastreável não fecha.
- **C4 Imutabilidade.** Findings nunca são apagados nem editados
  silenciosamente; correção = nova entrada de remediação com ref ao
  finding original.
- **C5 Lifecycle.** open → investigating → remediated → closed
  (dual approval). `closed` sem aprovações = G10 bloqueia o run.
