# Backup público v1.3.0 — controle de concorrência local

Escopo: exclusivamente backup v1.2.0. Nenhum GitHub ou banco remoto acessado.

## Alterações
- Registro de publicação exige `expectedRevision` para salvar e publicar; conflito de múltiplas abas falha de maneira fechada.
- Interface passa sua revisão observada para ambas as ações.
- Teste comportamental inclui dois conflitos negativos.
- Auditoria estrutural atualizada para nova assinatura.

## Evidência desta rodada
- `node --experimental-strip-types scripts/test-local-publication.mjs`: PASS.
- `node scripts/check-isolation.mjs`: 7/7 PASS.
- `node scripts/check-context-invariants.mjs`: 7/7 PASS.
- `node scripts/audit-surface-bindings-v2.mjs`: 23 contratos, 0 findings; não prova UI.
- `node scripts/test-surface-bindings-v2.mjs`: PASS.

## Bloqueios
- `npm ci` excedeu o tempo de execução disponível: build/typecheck não homologados nesta rodada.
- Sem capturas reais de `/admin`, `/assinante`, `/`: paridade visual pendente.
- Armazenamento local não é trilha inviolável; revisões verificadas no mesmo navegador não substituem controle transacional entre usuários.
- Sem integração remota, crosswalk ou aprovação de produção.
