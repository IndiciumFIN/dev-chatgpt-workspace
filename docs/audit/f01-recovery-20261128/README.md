# CKO F01 — checkpoint de recuperação (2026-11-28)

Status: HOLD. F02–F14 bloqueadas. Este registro é um checkpoint de trabalho, não admissão canônica nem homologação. Base Git: 80f2e0946c53f5ec680378443ee474e3c71c4a86.

## Escopo e continuidade
Preservar as identidades existentes, reconciliar Supabase, Git e documentação, comprovar autoridade, dependências e evidências antes de alterar registros. Nenhuma migration remota, merge ou publicação é autorizada por este checkpoint.

## Evidências relatadas nas rodadas locais (a reperfazer)
- Backup lógico: 609 blocos, 418725 linhas; 566 tabelas de aplicação reconciliadas. Restauração e binários Storage pendentes.
- 44 camadas, 100 dependências, 1056 vínculos de etapas, 352 vínculos de auditoria.
- 1164 entidades, 45 tipos, 43 políticas; LABOR_TOOL e DEVICE_COHORT sem política própria.
- 281 UUIDs legados; preservar identidade e avaliar contrato antes de remediação.
- Dupla identidade layer_uuid/object_uuid: geradores independentes segundo migration histórica; confirmar consumidores.
- 1840 versões; 115 com predecessor; 112 hashes correspondentes, 2 divergentes, 1 ausente; 3 atestações não equivalem a resolução.
- 33 holds ativos MD; 35 referências de auditoria a reconciliar semanticamente; 1056 etapas sem vínculos de execução no catálogo.
- Pacotes locais: CKO_Admin_Baseline_Mestre_v1.0-RC1.zip, CKO_Documentacao_Consolidada_v1.0-RC2.zip, CKO_F01_Reperformance_Fisica_v0.4.zip, CKO_F01_Rastreabilidade_v0.5.zip, CKO_F01_Autoridade_Identidade_v0.6.zip, CKO_F01_Linhagem_Holds_v0.7.zip. Nomes são referências de continuidade, não confirmação de upload ou hashes.

## Segurança
Repositório público: não incluir dumps, dados auth/vault, credenciais, registros de usuários, binários privados, ou exportações não classificadas. Guardar evidência integral em armazenamento privado e publicar apenas projeções revisadas e manifestos seguros.

## Próximas ações
Reconciliar autoridade de cada hold, contratos de identidade e consumidores, referências de auditoria, bindings do pipeline e linhagem. Documentar impactos horizontal, vertical e transversal. Reexecutar testes e reconstruir documentação mestre. Não avançar F02 sem F01 integralmente homologada.
