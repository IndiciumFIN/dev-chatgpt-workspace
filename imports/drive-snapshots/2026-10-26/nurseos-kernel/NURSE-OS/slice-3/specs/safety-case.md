# Safety Case Engine — Especificação (NOVO 09)

**Princípio:** "o agente passou nos testes" não é argumento de segurança. Assurance exige uma cadeia declarada:

```
CLAIM          — o que afirmamos sobre a segurança
  ↓
ARGUMENT       — por que a claim é verdadeira
  ↓
CONTROL       — qual mecanismo garante (sempre uma POL-…, nunca "boa prática")
  ↓
TEST / EVIDENCE — como provamos que o controle funciona (evidência assinada)
  ↓
RESIDUAL RISK  — o que sobra depois dos controles, e sua mitigação
  ↓
APPROVAL       — humano com autoridade clínica aceita o residual risk
```

## 2. Regras duras (POL-015)

1. Agente em **pilot** exige safety case com `approval_status` em [submitted, approved] (com claim, argument, controles e risco residual declarados).
2. Agente em **production** exige safety case **approved** por humano com autoridade clínica — jamais auto-aprovado.
3. Todo controle listado deve ser uma política ativa com asserção verificável — controle sem enforcement é violação da constituição (§1 do documento-mestre).
4. Risco residual `high` ou `unacceptable` bloqueia promoção até mitigação.
5. O safety case **expira**: mudança de modelo/CKO relevante (via Knowledge Evolution) o coloca em revisão automática.

## 3. Implementação atual (Fatia 3)
- Entidade `SafetyCase` (claim, argument, controls[], tests[], residual_risk + level, mitigations, approval_status, valid_until).
- POL-015 com asserção no pipeline: pilot → submitted/approved; production → approved.
- Exemplo real: caso do SAE Copilot — claim de que não altera prescrição nem causa dano medicamentoso; controles = POL-001/004/006/007/008; testes = evidências assinadas do pipeline; risco residual = citação de CKO desatualizado (mitigado por provenance + POL-011 + Knowledge Evolution); status = submitted, aguardando champion clínico — e o pipeline aceita pilot, mas **bloquearia produção**. O gate de humano é proposital.
