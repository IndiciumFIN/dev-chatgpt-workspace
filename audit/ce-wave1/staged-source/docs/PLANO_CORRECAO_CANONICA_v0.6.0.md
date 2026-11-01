# Correções canônicas propostas — pacote incremental v0.6.0

**Base:** `IndiciumFIN/dev-chatgpt-workspace` `integration/structural-overlay-20261101` @ `081c61ac6c6ea674934d1cad3c310e96476fc9a1`.
**Origem da auditoria:** CE Auditoria Global de Branches v0.5.0 (01-11-2026).
**Estado:** CANDIDATO; sem homologação, sem WO admitida verificada e SEM ALTERAÇÃO REMOTA.

## Contrato de aplicação

A entrega contém SOMENTE arquivos de código propostos como novos/alterados e esta documentação. **Não contém** corpus clínico, histórico de branches, traduções ou fontes sintéticas. `apply_patch.py` checa os Git blob SHA dos arquivos a substituir, o branch e a ascendência do commit de base. Por padrão só simula, sem escrever; `--apply` só escreve localmente, preservando backups externos ao repo, e não executa Git commit/push/merge, SQL, deploy ou DELETE.

Após aplicar, o Kernel legado perde intencionalmente a capacidade de autorizar execução; a implementação segura do Kernel no servidor ainda precisa ser conectada mediante WO validada. O utilitário de assinatura Ed25519 valida **integridade**, não autoriza ações, não executa policy engine e não verifica credenciais de usuários; por isso há HOLD real, não homologação artificial.

## Matriz de correção dos 12 FINDs

| FIND | Código entregue | Critério objetivo | Estado após aplicar |
| --- | --- | --- | --- |
| F01 Proteção main | `.github/main-protection-policy.example.json` | Configurar via UI/API com proprietário, revisão obrigatória e contextos reais de CI | **EXTERNO / HOLD**: JSON é EXEMPLO, não regra ativa |
| F02 Dois Kernels | `src/core/kernel/kernel.ts`, `gate.ts`, testes | API legada não pode conceder autorização local | **MITIGAÇÃO LOCAL**, unificação do backend ainda HOLD |
| F03 Assinaturas sintéticas | `signer.ts`, `findings.ts`, `policy-bundle.ts`, `crypto.server.ts` e teste | Proibido criar assinatura concatenada; Ed25519 verificável com chave externa | **MITIGAÇÃO LOCAL**, key management e autenticação ainda HOLD |
| F04 CI MEM | `scripts/governance/reconcile-mem-candidates.mjs`; gate CI | Recuperar 3 registros EXATOS da origem, validar blobs SHA e 87/48/HOLD | **REMEDIAÇÃO EXECUTÁVEL**, registros não copiados por este ZIP |
| F05 Triagem stale | `check-branch-audit-freshness.mjs` | HEAD e baseline devem coincidir, 0 aprovações artificiais | **GATE PROPOSTO**, auditoria deve ser reexecutada no HEAD após patch |
| F06 Visual | `attest-visual-capture.mjs` + workflow | 9 PNGs com SHA correto e prova do run; revisão separada | **CAPTURA CONTROLADA**, homologação visual HOLD |
| F07 Corpus | `inventory-branch-candidates.mjs` | 8.250 arquivos identificáveis, sem importar ou liberar | **INVENTÁRIO**, direitos e fontes HOLD |
| F08 i18n | `inventory-branch-candidates.mjs` | 1.092 staging identificáveis, sem publicar | **INVENTÁRIO**, revisão BCP47/tradução HOLD |
| F09 PR #29 revert | `release-readiness.mjs`, gates e instruções | Bloquear aprovação de reversão que retire controles | **EXTERNO / HOLD**: requer regra no GitHub e decisão owner |
| F10 Workflow auto-write | workflow `remediate-better-auth-candidate.yml` | `contents: read`, sem `git push`, `git commit` ou atualização implícita | **CORREÇÃO PROPOSTA**, requer testar workflow GitHub |
| F11 Revisão independente | `release-readiness.mjs`, testes | Sem aprovação humana/Kernel assinada => HOLD | **GATE PROPOSTO**, nenhuma aprovação simulada |
| F12 Snapshot volumoso | inventário por SHA/caminhos, docs de retenção | Evitar crescimento automático e organizar snapshots em artifact store | **DESIGN/HOLD**, nenhum arquivo grande removido |

## Sequência recomendada no Codespaces

1. Restaurar este ZIP fora do repositório, por exemplo em `~/ce-patch-v0.6.0/`.
2. Confirmar que a branch ativa é `integration/structural-overlay-20261101`. Antes de aplicar, abrir/validar uma WO canônica; este script **não pode comprovar admissão**.
3. Prévia: `python3 ~/ce-patch-v0.6.0/apply_patch.py --repo "$PWD"`.
4. Aplicação **somente local** (após a WO): `python3 ~/ce-patch-v0.6.0/apply_patch.py --repo "$PWD" --apply --work-order WO-CANONICA-VALIDADA` (substituir pelo identificador REAL; não inventar).
5. Recuperação de registros MEM (somente candidato, sem commit): `node scripts/governance/reconcile-mem-candidates.mjs --apply`. Confere o commit e os blobs Git, e valida os estados editoriais de HOLD. Verificar e comitar **apenas mediante aprovação própria** da WO.
6. Reexecutar `node scripts/test-curiosidades-mem.mjs` e `node scripts/test-curiosidades-source-alternatives.mjs`; depois `npm ci --ignore-scripts && npm run typecheck && npm test && npm run build:spa`.
7. Atualizar inventário ao HEAD da branch: `node scripts/audit-branch-canonicalization.mjs` (verificar flags com `--help` se disponíveis) e `node scripts/audit-live-branch-triage.mjs`; executar `node scripts/governance/check-branch-audit-freshness.mjs`. Os artefatos gerados não são aprovações.
8. Gerar comparativos por origem (requer ref remoto): `git fetch --no-tags origin` e `node scripts/governance/inventory-branch-candidates.mjs > /tmp/ce-branch-candidate-inventory.json`.
9. Captura visual no Actions; inspecionar `ci-provenance.json`, screenshots, testes reais e assinatura do revisor, sem confundir captura com homologação.
10. Configurar proteção da main na UI ou pela API do GitHub após confirmar os nomes reais dos checks; a configuração **não foi aplicada**. Não executar merge na PR #29 ou #30 até os gates estarem concluídos.

## Observações de revisão independente

- A mudança em `src/core/kernel/gate.ts` e no Kernel legado é deliberadamente **breaking** para qualquer consumidor que tente executar por status local. Deve permanecer bloqueado até a integração com backend confiável.
- `buildPolicyBundle()` agora retorna `draft` sem hash pseudoassinada. As políticas em produção exigem verificação criptográfica e status confiável, não promoção por este construtor.
- `signArtifact()` lança erro intencionalmente e deve ser substituído por serviço com proteção de chave, autenticação, autorização, auditoria e persistência da assinatura.
- A máquina `evaluateWorkOrder()` de `src/core/governance/kernel.ts` permanece uma admissão **local de pré-checagem** e NÃO dá acesso a ferramentas remotas. É necessário conectar o verificador autoritativo e vetar chamadas que não passem por ele.
- A verificação de Ed25519 valida assinatura/dados/expiração. Não decide conformidade normativa, não prova papel maker/checker e não substitui política de release.
- O arquivo `main-protection-policy.example.json` é uma referência; o status real das regras deve ser lido do GitHub antes de liberar produção. Ajustar checks para os contextos efetivamente emitidos pela Actions.
- Não há prova de completude sem teste no checkout real, reexecução de CI, WOs autorizadas, direitos de fonte, banco isolado, inspeção visual e revisão independente.

## Comandos de conferência do pacote antes de usar

- `python3 apply_patch.py --verify-package`
- `node --test scripts/governance/release-readiness.test.mjs`
- `node --experimental-strip-types --test src/core/kernel/crypto.server.test.ts`

**Importante:** os dois registros MEM ausentes **não foram fabricados nem substituídos por amostras**. O script os recupera bit a bit do commit-fonte imutável identificado pela auditoria.

### Complemento F07/F08/F12 — inventários e arquivos de evidências

O `inventory-branch-candidates.mjs` gera mapeamento por arquivo com branch, commit, Git blob OID, classificação, validação *sintática* BCP47 quando aplicável e `rights=NOT_ASSESSED`. Para os 8.250 arquivos de corpus, o SHA do objeto Git **não equivale ao SHA-256 da fonte externa original**, que permanece pendente. Não há importação de corpus, nem publicação i18n.

O script `archive-audit-candidate.mjs` permite preservar o registro histórico grande em um artifact do Actions com hash SHA256 do original e do arquivo GZIP, sem apagar arquivos governados. O workflow `ce-branch-audit-artifact.yml` só cria artefato temporário; mover dados antigos para um armazenamento externo e adotar política de retenção requer projeto, WO e autorização separados.
