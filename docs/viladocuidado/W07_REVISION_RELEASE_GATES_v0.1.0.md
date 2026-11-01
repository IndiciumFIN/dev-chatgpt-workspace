# W07 — Fechamento candidato de integridade
Estado: SQL_PROPOSED / NOT_APPLIED / NOT_TESTED_IN_POSTGRES / KERNEL_HOLD

## Correções incorporadas na migration 0003
- `content_revisions`: múltiplas revisões append-only por objeto; gatilho impede UPDATE/DELETE.
- `release_review_gate`: somente admite `APPROVED` com evidência Kernel e revisões de segurança/acessibilidade com `PASS`, referindo o mesmo conteúdo.
- Gatilhos protegem revisões aprovadas contra UPDATE/DELETE.
- Schema privado, RLS em tabela nova e revogação de EXECUTE público das funções.

## Limitações importantes
- `content_objects` ainda tem `version` e `payload` mutáveis e exige adaptação do modelo de leitura/escrita para passar a usar `content_revisions` como fonte de verdade. Não permitir publicação enquanto coexistirem caminhos de escrita não auditados.
- Conferência de `kernel_evidence_ref` é estrutural (não valida assinatura nem validade da WO). Somente Kernel e auditoria autorizada podem reconhecer esse estado.
- Reviews criadas com `PASS` ainda requerem qualificação da evidência e proteção contra inserção fraudulenta pela camada de serviço.
- SQL smoke test verifica estrutura, não autorizações reais, concorrência, RLS ou política de conteúdo.
- A migration 0002 permanece candidata e não pode ser aplicada em produção. Executar em staging descartável somente após WO.

## Achados ainda abertos
FIND-VILA-DB-02 (leitura por revisão), -03 (hash real/rights assets), -04 (validadores JSONB), -05 (RLS runtime), -06 (privacidade infantil e retenção).
