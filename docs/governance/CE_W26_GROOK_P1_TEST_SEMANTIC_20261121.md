# W2.6-G2/T — Disposição semântica P1_TEST da `grook_10_26`

**Issue do lote:** [#109](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/109) · **Issue pai:** [#106](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/106) · **Fase:** DEVELOPMENT.

## Proveniência e resultado

- Origem histórica: `2eacacafd95c106e58a33372ee96bc6a6442439f` / árvore `d8de6c9a983e9ad4ecb95fb5aec68bd2389d0b8b`.
- Base atual revisada: main `0e7c391220570b50cd64860474dc5f3e0cecdb24`; árvore `b85336c6c640be4d9cbadd7ea0de235708555441`.
- Foram obtidos os **bytes dos dois lados** no GitHub para os três testes, conferidos seus SHAs de blob contra o inventário imutável W2.6-G1, e examinadas as assertivas removidas e acrescentadas.
- Os três arquivos **já estão na main** com as versões escolhidas; não houve importação de código histórico, alteração de regras de cálculo, dados clínicos ou DDL.
- Baseline verificável de `npm test` antes desta PR: workflow [`verify` #44898488975 PASS](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/44898488975) no commit acima. O teste específico do novo ledger deverá passar **também na CI desta PR**, e a integração só se conclui com CI posterior ao merge.
- O arquivo `registers/governance/ce-w26-grook-p1-test-disposition-20261121.v1.json` registra as duas versões e a decisão por arquivo; o verificador `scripts/ce-w26-grook-p1-test-disposition-verify.mjs` testa SHAs de origem e blob canônico no workspace, 48/48 objetos e `SEALED=0`; testes adversariais em `scripts/ce-w26-grook-p1-test-disposition.test.mjs`.

## Decisão por objeto

| Arquivo | Estado em DEV | Justificativa | Limitação |
|---|---|---|---|
| `scripts/admin-catalog.test.mjs` | `SUPERSEDED_WITH_PROOF` | Antes `area.frame` estava no contrato do kind; agora `frame` é atributo dos templates `area-assinante` e `area-admin`, conferido no teste e no modelo tipado | Não prova todas as funcionalidades administrativas |
| `src/lib/desk-boundary.test.ts` | `REJECTED_WITH_PROVENANCE` (antiga quota) | A regra histórica de exigir `>3` traduções publicadas é quantitativa, não evidência de validade; o teste atual exige `0` traduções/aliases publicados com idioma fora de `en/es/fr` ou corpo vazio | Não comprova existência, aprovação, direitos nem acurácia de traduções; não cobre os 19 idiomas globais |
| `src/lib/ecosystem-audit.test.ts` | `SUPERSEDED_WITH_PROOF` | A expectativa antiga de nenhum achado foi substituída por `I18N-ALT`, `I18N-HREFLANG`, `REG-RASCUNHO` como achados abertos, todos exigindo norma e evidência | Três achados continuam por resolver; teste aprovado não os homologa |

## Limites de conclusão

**3/48 (6,25%)** divergências receberam disposição semântica em desenvolvimento, **45/48 permanecem pendentes**, distribuídas em 13 de segurança, 6 clínicas, 16 runtime e 10 UI. **0/54** refs CE atuais têm `SEALED_FOR_RELEASE` (54 inclui refs novas), e não é legítimo converter **3 arquivos** em **uma branch fechada**. A branch `grook_10_26` ainda exige resolução dos 45 objetos e confirmação de consistência de suas dependências antes de `DEV_RECONCILED`.

Os direitos de terceiros, a integridade das fontes primárias, a segurança clínica, o OAuth histórico, o schema e RLS do Supabase, o deploy e a aprovação do proprietário **Cauê Zipfel** para release não foram verificados por esta atividade. A coordenação é de Leivis Lima; adendo vigente dispensa revisão humana independente como gate bloqueante **somente em DEV**. Nenhuma escrita remota de banco, deploy, aprovação clínica, branch delete ou `SEALED` ocorreu.

**Rollback:** PR que reverte apenas os registros/verificadores do lote; preservar o inventário histórico e as trilhas da PR. Próximo subgate: segurança de 13 objetos e contratos clínicos de 6, em lotes com teste diferencial e HOLD por evidência ausente.
