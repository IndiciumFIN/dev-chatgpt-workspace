# CE — Wave 8 | Auditoria canônica executada (snapshot 2026-11-01)

**Natureza: evidência de auditoria, não registro canônico paralelo.**
**Gate:** `HOLD_HUMAN` · **Kernel admission:** `NOT_VERIFIED` · **merge/main:** `NOT_AUTHORIZED`.

## Fontes verificáveis

- CI audit full-tree: [GitHub Actions #41282007176](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/41282007176) — **completed / success**, commit auditado `27585c56e1331fdf563ec12671d39315b17b1a31`.
- ZIP de relatório completo: artifact GitHub Actions ID `13073497996`, nome `ce-main-migration-source-collision-report` (artefato com retenção de 30 dias, não perpetuado neste arquivo).
- Reconciliação PMO: artifact `13073701655` (`ce-pmo-fork-reconciliation`).
- Índice das 8.250 páginas em quarentena: artifact `13073264300` (`ce-source-corpus-candidate-index`).
- Histórico da correção: `28915b5` (manifesto atualizado 27 origens); `e8e26de` (exclusões D + null preservadas no validador); `89d50aa` (22 mapeamentos candidatos de WO); `27585c5` (correção sintática).
- FIND / discussão de causa raiz: [Issue #25](https://github.com/IndiciumFIN/dev-chatgpt-workspace/issues/25#issuecomment-6554543077).

## Resultado verificável, sem inferências de aprovação

| Medida | Valor |
|---|---:|
| Branches incluindo main | 28 |
| Branches de origem auditadas no runtime | **27/27** |
| Falhas de população e drift durante o runtime | **0** |
| Caminhos pendentes em fontes | 11.973 |
| Caminhos pendentes distintos | 10.912 |
| Colisões diferentes por blob Git | **146** |
| Caminhos duplicados com mesmo blob | 524 |
| Equivalências semânticas candidatas (alemão/i18n) | 57 |
| Conflitos substantivos ou fora da allowlist | 89 |
| Mapeamentos de WO **candidatos** | **146/146** |
| WOs sem mapeamento candidato | 0 |
| Aprovações canônicas formais | **0** |
| Páginas do corpus-fonte indexadas | 8.250/8.250 |
| Páginas estruturalmente válidas | 8.206 |
| Problemas estruturais | 44 |
| Textos vazios | 590 |
| Licenças com evidência no corpus | **0/8.250** |

**Importante:** os 57 itens semanticamente equivalentes não são autorização para descarte, merge, tradução final ou publicação. As 146 WOs são *candidaturas de mapeamento*, não work orders admitidas por um Kernel confiável.

## Correções auditadas

O auditor fallhou inicialmente em `INVALID_BLOB_LINEAGE` com cinco fontes de exclusão legítimas (`status=D`, `blob=null`) da branch revert da PR #29. O validador agora aceita o estado somente quando `D + null`, rejeita hash inválido e preserva a operação em `sources[].status`; testes negativos foram adicionados. O workflow seguinte expôs 22 conflitos sem WO. Todos foram mapeados **exclusivamente como candidatos** a WOs existentes. Uma falha de sintaxe foi detectada e corrigida antes do CI verde.

## Limitações e próximos gates

1. `registers/governance/main-migration-scope.v1.json` contém população atualizada, mas HEADs de suas fontes são **fotografia de consulta, não pinagem transacional**. Uma branch de planejamento e a própria branch candidata avançaram; não é possível exigir que o manifesto contenha o hash do seu próprio commit. A fonte de verdade de HEADs do runtime é `remoteBranchHeads` do relatório de cada execução, lido antes/depois pelo auditor.
2. Nenhum arquivo desses 146 conflitos foi eleito ou sobrescrito. Reconciliação humana, licenciamento, normativos e contratos clínicos continuam pendentes.
3. A PR #29 permanece regressiva para `WO-ADM-001`; sua reversão não foi aplicada.
4. Todo conteúdo com problema de licença/estrutura continua em quarentena; nada foi carregado no Supabase ou publicado.
5. A CI comprova o inventário read-only e seus validadores, **não** comprova integração fim a fim, Kernel admission, revisão independente ou prontidão da `main`.
6. O registro canônico continua sendo `registers/governance/main-migration-scope.v1.json`; o presente arquivo é somente evidência complementar. A PR #30 permanece `HOLD_HUMAN`.

_Evidência registrada na branch candidata, sem execução de migrations, deploy, autorização clínica ou merge._
