# Checkpoint — 14/11/2026, Trilha de carreira + B59 + SOT

## Escopo tecnicamente executado

- **Trilha de carreira**: novos agrupamentos derivados do SQLite M03, `7` eixos temáticos da Urgência e Emergência/`170` tópicos e `32` eixos de Enfermagem do Trabalho/`885` tópicos. 39 grupos, nenhum estágio profissional, credencial ou claim aprovado. PR #66, [Actions #43569708978](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43569708978) **success** estrutural.
- **B59**: 5 pares de URI entre M03 e Supabase desdobrados em **6 documentos M03 com SHA** e **7 snapshots Supabase com SHA**, dos quais nenhum apresenta hash de bytes igual entre ambientes. Um snapshot COFEN havia sido rejeitado por mudança visual não normativa. Nenhum alias promovido; detalhes em `b59/B59_SNAPSHOT_RECONCILIATION.md`.
- **SOT**: 9 Edge Functions estudadas por código: 3 públicas com função de health/diagnóstico ou 410, 6 protegidas por JWT e papéis. `deepseek-atomize` transmite `corpus_fragments.text_content` à API externa DeepSeek; a função não demonstra validação de `EXTERNAL_AI_TDM` por fonte/documento antes do outbound. **P0 rights/privacy HOLD**, FIND `FIND-CKO-SOT-EXTERNAL-AI-TDM-20261114` no PR #68.
- **Policy/QA**: política fail-closed para external-AI proposta, não implantada, em `SOT_EXTERNAL_AI_RIGHTS_PREFLIGHT_PROPOSED.json`. [Actions #43570231486](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43570231486) **success** de garantia documental que os bloqueios não foram inadvertidamente liberados.
- **PMO Mestre**: 6 novas linhas (2 conflitos, 2 HOLDs, 2 impactos) e 2 células em `PMO-013` atualizadas e conferidas. O PMO preserva 59 atividades; B18/B24 passaram a `IN_PROGRESS` **apenas por classificação de metadados**, sem promoção clínica ou profissional.

## Próximas ações com gates

1. **P0 direitos**: inspecionar políticas upstream ou adicionar preflight de autorização por documento/versão/uso `EXTERNAL_AI_TDM` antes da chamada DeepSeek. Sem permitir chamadas reais a textos restritos antes do gate.
2. **P0 B59**: versão, texto normativo e hash normalizado dos 3 candidatos mesma norma; manter Lei+Decreto como relação de escopo parcial, não alias 1:1.
3. **P0 infraestrutura**: ratificar ADR-CKO-002 sobre isolamento do SOT. Pilot e produção atuais não modificados.
4. **P0 Trilha de carreira**: ampliar o vínculo tópico→fonte→evidência→competência com trilhas profissionais exclusivamente quando existir normativo/ementa institucional; Centro Cirúrgico/CME ainda `HOLD_SOURCE`.
5. **QA**: revisão clínica/direitos, CI de produto e Vercel permanecem fora do escopo dos dois testes de documentação e fonte.
