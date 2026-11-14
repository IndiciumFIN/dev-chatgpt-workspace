# Protocolo de execução por especialistas — candidatos, não executados

Os nomes abaixo designam **papéis e contratos de entrega**, não agentes já instalados ou operando. A implementação deve reutilizar automações e agentes existentes do repositório após crosswalk.

| Papel | Entrada | Execução reprodutível | Saída | Veto |
|---|---|---|---|---|
| CKO-GitAudit | branch refs, PRs, main SHA | compare Git, paths, status checks | branch_inventory.csv + conflict ledger | não autoriza merge |
| CKO-DataQA | manifests, ZIP/hash, SQLite read-only | SHA-256, CRC, integrity_check, chaves únicas/FK | QA results + inventory | corrupção, dados ausentes |
| CKO-Authority | normas e diretrizes oficiais | snapshot com URL, data, versão e jurisdição | authority source ledger | norma desatualizada |
| CKO-Rights | fonte/licença e uso pretendido | matriz de permissões por operação | rights register | publicação sem licença |
| CKO-Curriculum | ementas institucionais | granularização com origem e collision detection | UC crosswalk | alteração de grade sem aprovação |
| CKO-Ontology | IDs, topics, specialization | many-to-many, alias/duplicate analysis | graph crosswalk | links sem base |
| CKO-Evidence | documento e atoms | source-span→claim, documento/versão | claim cards candidatos | trecho ausente |
| CKO-ClinicalReview | claim cards e diretriz vigente | revisão humana científica e de segurança | parecer assinado | risco ao paciente |
| CKO-Editorial | knowledge_atoms aprovados, contrato existente | projeções web/PDF/quiz/flashcard | conteúdo com lineage | duplicar template ou claim |
| CKO-Audit360 | relatórios de todos os gates | readback independente, no silent PASS | relatório auditado | gate sem evidência |
| CKO-PMOController | backlog, eventos e evidências | atualização determinística dependente de gate | status + forecast condicionado | autoproclamar aprovação |

## Definição de pronto por execução
- Entrada: IDs/version/hash, direito de consulta, escopo e dono.
- Saída: arquivo estruturado versionado e manifesto com observação, limite e estado.
- Teste: comando, timestamp, exit code e contagem verificáveis.
- Exceção: FIND rastreável + responsável + dependência; não se apaga silenciosamente.
- Aprovação: revisor humano separado do produtor para clínica, direitos e release.
- Rollback: trabalho candidato permanece na branch, sem push na `main` ou migração prod sem admissão.
- Progresso: métricas por atividade e gate, não percentual artificial de 'conteúdo pronto'.

**Nenhum desses papéis pode usar conteúdo de fonte restrita fora da permissão declarada.**
