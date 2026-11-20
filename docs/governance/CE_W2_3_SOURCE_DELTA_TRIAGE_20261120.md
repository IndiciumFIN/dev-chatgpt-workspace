# CE W2.3 — triagem de riscos sobre 480 deltas não reutilizáveis entre PR #32 e PR #36

**20/11/2026 — GitHub Workspace `main` — rastreamento sem promoção funcional.**

Origem imutável: [W2.2](/IndiciumFIN/dev-chatgpt-workspace/blob/main/registers/governance/ce-w2-2-pr32-pr36-shared-origin-20261120.v1.json) (Git blob `bcae37d1e74329ac853c2e77cc089bcf606f866d`). SHAs de origem: PR #32 `8c0c4b6f9c049bb5bf13de260074b5020b08a07d`, PR #36 `65486491dece96e107a1f3f5172a473d7421f14d`; baseline da comparação `d977c6ef1e142d4a5c9dd3dfc528912b44f3b031`. A leitura pontual do código atual foi realizada na `main@37c2050bec6faf63fcf44f94031fa13aa3b5c20c`.

## O que foi avançado

Todos os **480 caminhos** que diferem exclusivamente entre as duas origens foram classificados em **fila de risco por path**, com os Git blob SHAs das duas origens: **53 compartilhados divergentes**, **427 adicionais na PR #36**; nenhum objeto foi fundido ou homologado. A fila versionada está em [ce-w2-3-source-delta-triage-20261120.v1.json](../../registers/governance/ce-w2-3-source-delta-triage-20261120.v1.json). Teste [W2.3](../../scripts/ce-w2-3-source-delta-triage.test.mjs) confere cada uma das 480 linhas contra W2.2 e reprova falsa autorização de merge/closure.

| Prioridade | Itens | Tratamento |
| --- | ---: | --- |
| P0 | 43 | Segurança, Kernel/OPA, migrations, runner, CI e documentos normativos com risco de direitos |
| P1 | 120 | Contratos CKO, código, testes, dependências e interfaces |
| P2 | 317 | Ativos públicos, documentação e vestígios históricos; direitos ainda exigidos |

**P0/P1/P2 é triagem preliminar pela localização e extensão — não representa aprovação, severidade confirmada ou disposição final de conteúdo.** Todos os 480 itens permanecem com `PENDING_SEMANTIC_REVIEW`; `TRIAGED=false`, `SEALED=false`, `no_revisit=false`. Os 15.542 objetos idênticos continuam sujeitos à inspeção semântica compartilhada do W2.2; esta fila não os substitui.

## Quatro leituras de conteúdo e encaminhamento técnico

| Componente | Evidência direta | Decisão segura de momento |
| --- | --- | --- |
| `package.json` | PR32/PR36 fixam Better Auth `1.7.14`, enquanto `main@37c2050` fixa `1.7.15`; scripts de build/test divergentes | Preservar a main; só importar comandos mediante CI funcional |
| `src/core/governance/kernel.ts` | PR36 inclui fallback literal `approvedBy: "kernel"` e não possui o tratamento explícito `policy-denied` observado na main e na PR32. Isso é sinal de revisão, não prova de exploração | HOLD para avaliação independente de autorização/publicação |
| `migrations/0036_indice_do_banco.sql` | 115 linhas na PR32 e 275 na PR36, blobs `665f2ccc` e `411d7755`; arquivo ausente da main nesse path | Bloquear importação SQL ou escrita remota sem comparar migrações locais e remotas, colisões de basename, testes/rollback |
| `scripts/migration-plan.test.mjs` | A main já testa presença de migrations SQL na raiz; a PR36 tem asserção histórica de diretório vazio | Não reintroduzir o teste obsoleto |

Trata-se de análise focal sobre **quatro arquivos**, não de revisão semântica dos 480. Referências dos Git blobs e decisões intermediárias são preservadas no registro JSON.

## Próximo fluxo obrigatório

1. Revisar primeiro P0 por conteúdo/contrato, mantendo os commits de origem fixados; gerar decisão final por item com justificativa e testes.
2. Em SQL, cruzar com histórico Supabase Calculadoras-Smart **somente leitura**, sem executar DDL/DML; verificar diferenças de runner e colisões das famílias de migrations.
3. Em Kernel/OPA, validar política fail-closed, aprovador independente, proveniência, testes adversariais e autorização clínica.
4. Em `public/` e documentos, verificar licença e distribuição antes de admitir conteúdo, inclusive referências normativas.
5. Em Drive, manter evidências e nomes privados fora do repo público; publicar somente prova sanitizada. Comparar versão e SHA-256 de bytes quando autorizado.
6. Integrar na `main` somente lotes independentes aprovados, revalidar CI no novo SHA e atualizar o ledger por arquivo. Atingir `SEALED` só depois de prova de 100% do SHA de origem.

**Não executar merge geral, exclusão de branches, migração remota, deploy ou publicação clínica por força deste checkpoint.**
