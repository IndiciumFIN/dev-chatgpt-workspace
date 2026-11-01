# CE — Wave 9 | Kernel fail-closed e reconciliação seletiva de OPA

**Natureza:** evidência candidata e implementação em branch de integração. **HOLD_HUMAN**, sem autenticação de assinatura do Kernel e sem promoção da main.

## Autorização e autoridade

No diálogo de 2026-11-01, o proprietário solicitou **"seguir, autorizada"**. Interpretado como autorização humana para continuar **correções na branch candidata**, não como assinatura do Kernel, aceite clínico, permissão para ativar Supabase ou liberação da main. O processo oficial de FIND→política→validador→TASK→WO→admissão independente permanece obrigatório. Não criar autorização retroativa fictícia.

## Linha de base comprovada

- 28 branches totais, 27 fontes e `main=e9f7fe66075ebe5d7346072dc3a1b4934678c6de` no início desta rodada.
- PR #30 baseada em main e aberta; revisão formal independente ausente.
- Último auditor full-tree completo: [GitHub Actions #41282238492](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41282238492), no snapshot `4cde5a2`.
- Inventário nesse snapshot: 146 conflitos path/blob; 57 equivalências semânticas candidatas, 89 requerem revisão; 524 duplicações hash-idênticas, 27/27 branches de origem, 0 drift naquele runtime. Números não representam conflitos encerrados ou porcentagem de maturidade.
- Criticidades: 34 conflitos P0 na triagem, incluindo Kernel/segurança/CI.

## Alterações efetivamente commitadas na candidata

1. [`3f0b470`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/3f0b4701abfe75dfb08edc26baad54b6f5e7ed37): `src/core/kernel/signer.ts` não fabrica mais assinatura `kernel:...`; lança `TRUSTED_KERNEL_SIGNER_NOT_CONFIGURED`. `src/core/kernel/kernel.ts` deixou de emitir `approved` sem conformidade, assinatura e serviço de verificação. Saídas sem autoridade têm `signature=""` e `hold`, com exceção de rejeições explícitas. `evaluateCompliance` rejeita bundles normativos vazios, desconhecidos, inativos ou duplicados. Sete testes negativos em `src/core/kernel/kernel-security.test.ts`. Suite de verificação completa: [Actions #41282635683](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41282635683), **success**.
2. [`84c7633`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/84c76339dd146e87891b07c81e0216c69d31d355): alteração seletiva em `contracts/cko-governance/opa/kernel_admission.rego`: critérios de aceite não vazios/únicos e `approval.approved_at == manifest.approved_at`, comparando a versão histórica `feat/projection-unica-f0-suite-real`. Quatro testes negativos adicionados, fixture positiva atualizada. **Não** copiar automaticamente o restante do histórico sem ancestral comum.
3. [`fdca714`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/fdca714e2d040994c6c0ea3f0119bcbb20759943): correção do fixture negativo de campo ausente; união profunda anterior reintroduzia o campo excluído. OPA [Actions #41282840116](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41282840116) **success**.
4. [`1050c6f`](https://github.com/IndiciumFIN/dev-chatgpt-workspace/commit/1050c6f19180b1ec07a4a8b62b459214d10f2d7f): `src/core/kernel/gate.ts.canExecute` não pode conceder execução por status local `approved/homologated`; retorna `false` até existir verificador autenticado. Teste negativo adicional no `kernel-security.test.ts`.

## Delimitação e riscos abertos

- Mudanças em **candidate** e testes; sem merge, sem aplicação de DDL, sem alteração de segurança de main ou deploy.
- **Nenhuma assinatura real foi configurada**: este patch fecha falsos positivos, não implementa a autorização operacional do Kernel.
- A função legada `canExecute` deixa qualquer execução condicionada ao futuro gate autenticado. Revisar integrações dependentes antes de habilitar funcionalidades — a falha fechada é intencional.
- Não interpretar CI verde da candidata como homologação ou como 89 conflitos resolvidos. Permanecem licenciamento do corpus (0/8.250 evidenciadas), 44 problemas de estrutura, revisão clínica e reconciliação independente das fontes.
- O mapa de conflitos e a autoridade canônica são os que já existem em `registers/governance/main-migration-scope.v1.json`, `registers/pmo/queue.v1.json` e Issue #25. Este documento **não é registro alternativo nem decisão de merge**.
- Nova regressão total no HEAD após este arquivo deve ser consultada separadamente; nunca presumir resultados antes da conclusão.

## Próximos gates

1. CI do HEAD atual: OPA, PMO, Typecheck, `npm test`, build, corpus e auditor full-tree.
2. Revisão independente de alterações P0, em especial ausência de confiança externa e efeito do gate de execução fechado.
3. Governança FIND/policy/validator/TASK/WO e assinatura real do Kernel; testes negativos e contrato de revogação.
4. Apenas após admissão verificável, decidir por unidade de conflito o que promover na main.
