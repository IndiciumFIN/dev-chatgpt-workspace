# M07 — PostgreSQL descartável e concorrência do preflight

**Corte 14/11/2026.** Preflight externo de direitos para DeepSeek em **estado candidato**.

## Evidências verificadas
- [Actions #43572351313](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43572351313): Node.js mock reserva e revogação/concorrência **PASS**; o próprio teste comprova que o mock pode repetir outbound em chamadas sequenciais. Não representa exactly-once.
- [Actions #43572600708](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43572600708): Node.js e **PostgreSQL 16 descartável** PASS. Executou DDL candidata *apenas no serviço local do job*, com dados sintéticos; negou associação errada source↔document↔fragment, SHA sem arquivo e duas permissões admitidas ativas para a mesma operação. Conferiu revogação preservando histórico e ausência de SELECT em roles `anon/authenticated`.
- **Não foi criada** `corpus_external_ai_permissions` no projeto SOT; `deepseek-atomize` v5 continua implantada; proposta v6, `SCHEMA_HARDENED_PROPOSAL_DO_NOT_APPLY.sql` e testes no PR #68 não foram publicados.

## Falhas que impedem produção
- Sem claim/reserva transacional persistida nem chave de idempotência durável, a mesma autorização pode disparar duas vezes em retries. Documento `CONCURRENCY_AND_SCHEMA_BLOCKERS.md` mostra prova via mock; não é teste simultâneo em sessões reais.
- Revogação depois de iniciar outbound **não retira dados já enviados**. A ação deve ser explicitamente autorizada antes de qualquer envio, com auditoria e minimização.
- Revisão documental de direitos e privacidade de `EXTERNAL_AI_TDM`, titularidade/isolamento SOT, RLS com service-role, compatibilidade de dados, locks e rollback seguem sem aprovação.

## Próximo trabalho
`PXC-017` proposto, **não admitido no WBS de 59 tarefas**: criar reserva/claim atômico em PostgreSQL descartável, executar concorrência real de duas sessões e retries, provar exactly-once *claim* e política para revogação/timeout/falha; depois auditoria externa e decisão humana. Até isso, `HOLD_RELEASE`.

**PMO mestre**: `CONFLICT_REGISTER!A13:L13`, `HOLD_HUMAN!A13:K13`, `CHANGE_IMPACT!A14:N14` e `PMO_MASTER!H14` com gravação e leitura de retorno confirmadas. Nenhum merge main e nenhuma escrita no Supabase.
