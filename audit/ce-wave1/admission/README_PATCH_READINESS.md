# CE Wave 3 — reconciliação 27 branches e scanner de aplicabilidade v0.6.4

**Status: `AUDIT_ONLY / HOLD_HUMAN`.** O scanner não gera assinaturas, não aprova ordens de trabalho, não altera Git e não aplica o patch.

## Escopo efetivamente verificado

- Todos os 27 HEADs existentes no GitHub foram auditados: 26 árvores de origem comparadas recursivamente com a integração (2.300 objetos Git não diretório no HEAD `8e90c5bcf98f071bf3c89e608642cce61fed0744`), sem truncamento. A matriz é um snapshot histórico ancorado nos SHAs ali registrados, não uma autorização de merge nem uma auditoria semântica de todas as relações.
- O catálogo v0.6.4 tem 35 destinos; no baseline auditado são **28 `ADD` e 7 `REPLACE`**, com zero drift nos sete blobs esperados. Nenhuma implementação ativa foi feita por este relatório.
- O script de revisão verifica SHA-256 dos 35 conteúdos sob `audit/ce-wave1/staged-source/`, hash SHA-256 fixado do `PATCH_MANIFEST.json`, SHA Git dos sete alvos existentes, caminhos inseguros/symlinks e checkout limpo no branch-alvo. Qualquer discrepância provoca erro e saída 2; a única saída bem-sucedida é um **plano de leitura, nunca autorização**.

## Execução de testes locais

```bash
node --test audit/ce-wave1/admission/verify-patch-readiness.test.mjs
node audit/ce-wave1/admission/verify-patch-readiness.mjs .
```

No segundo comando, usar o checkout completo e limpo de `integration/structural-overlay-20261101`. O scanner pode retornar `DRY_RUN_VALID_NO_EXECUTION`, com `kernelAdmission=NOT_CHECKED` e `writeAuthorized=false`. Um `--apply` é rejeitado deliberadamente; este código **não é um instalador**.

## Pendências materiais

1. Uma decisão real do Kernel que ligue FIND → política → validador → TASK → WO → assinatura/verificação em emissor confiável externo ao Git e ao próprio pedido.
2. Validar segregação maker/checker, escopo da decisão ao HEAD efetivo no momento da autorização e proteção da chave.
3. Aplicar os 35 arquivos por executor separado apenas após admissão verificada. `src/core/kernel/*` não pode se aprovar a si mesmo.
4. Revalidar build, testes e a PR #30 e obter revisão formal independente. Autorizar merge à `main` é gate separado e a branch ainda requer proteção.

O relatório e este script permanecem sob `audit/ce-wave1/` para não alterar o runtime, a CI, o Supabase ou a `main`.
