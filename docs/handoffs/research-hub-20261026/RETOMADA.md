# Retomada governada — não executar automaticamente
**Status do handoff: ENCERRADO**, com as seguintes dependências *não resolvidas*.

1. Revisar [Issue #23](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/23). A solicitação **não** constitui WO admitida. Somente Kernel/PMO Control Service autorizado pode abrir e persistir a decisão.
2. Relacionar ao objeto canônico a WO de Research, FINDs e evidências; revisar `contracts/cko-schemas/work_order.schema.json`. Não apagar histórico de `validation_evidence`; preservar CI em recibo canônico e referências homologadas.
3. Reconciliar `feat/research-participation-layer-20261026` (PR #19, código candidato) e `fix/governed-activities-cli-20261026` (PR #13, somente reparo de gate PMO). Não fazer merge completo da PR #13. Em `package.json`, os oito comandos adicionados por duas frentes não colidem; rever alterações novas de branches antes de aplicação.
4. Recuperar ZIPs candidatos v0.1.5/6/7/8/9 pelo índice e SHA-256. Montador v0.1.7 falha fechado em divergência de Git blob; source-gate v0.1.8 complementa HEAD/remote/árvore; v0.1.9 corrige lista fechada de paths.
5. Após uma **WO real admitida e limitada à branch**, montar em árvore isolada, executar verificações de paridade, política, source-gate, lint, typecheck, build, testes unitários, CI global e Research no **mesmo SHA**, Chromium 360/768/1024/1440, revisão LGPD/ética, rollback.
6. Abrir novos FINDs quando falhar, não mudar gate para PASS artificialmente. Não habilitar participantes, autenticação forçada, banco remoto, OPA produtivo ou Vercel por inferência. Encaminhar para homologação humana independente.
7. Conferir URLs, licenças, conteúdo normativo e fronteiras por locale. Sem conteúdo clínico ou aprovação de pesquisa sem fonte legal aplicável.

## Critério de encerramento futuro da Issue #23
Decisão persistida do Kernel com escopo/assinatura, ou HOLD/FAIL formalmente resolvido pelo serviço autorizado. Não fechar o Issue porque o handoff documental deste turno está encerrado.

## O que não transferir
- Nenhuma aprovação por parte de agente ou commit.
- Nenhuma inferência de produção a partir de PASS de teste sintético.
- Nenhum merge da main, migração de banco ou falsa homologação.

## Reconstituição dos ZIPs a partir do Git

Baixar [archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip](archives/CKO_RESEARCH_HUB_TODOS_OS_PACOTES_20261026.zip) e extrair a pasta `pacotes/`. Conferir SHA-256 de cada ZIP contra `PACOTES-RECUPERACAO.json`, depois validar conteúdo (por exemplo `unzip -t`). Não executar automaticamente nenhum patch sem WO admitida. A presença no Git é somente backup.
