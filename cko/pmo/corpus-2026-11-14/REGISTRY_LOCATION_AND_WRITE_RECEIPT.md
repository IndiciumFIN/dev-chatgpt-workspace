# CKO — Cadastro oficial, localização e recibo M05 (14/11/2026)

## Fonte de controle (Google Sheets)

**PMO e Registry lógico existentes:** https://docs.google.com/spreadsheets/d/1vi129pgXWMZPFddxlMd5YemMEohumxqk714yCoGCVOg/edit  
**Escrita realizada apenas pela conexão editora autorizada, sem substituir abas, excluir registros ou alterar direitos.** A conexão secundária foi recusada (403), nenhuma alteração ocorreu naquela tentativa.

| Aba original | Linhas adicionadas | Intervalo exato | Papel |
|---|---:|---|---|
| SOURCE_REGISTER | 8 | A9:L16 | IDs de fonte M05, sendo 3 descobertas provisórias; fontes brasileiras MS pré-existentes foram reutilizadas |
| DOCUMENT_REGISTER | 8 | A2:N9 | Documento ECG/HA, AHA BLS candidato, ELSO/ISHLT e 2 documentos MS metadata-only |
| EVIDENCE_ATOMS | 4 | A2:M5 | Quatro IDs ATM com página/locator/hash, sem texto íntegro |
| CLAIM_LEDGER | 3 | A2:L4 | Três afirmações ECG CANDIDATE, sem clinical review |
| RIGHTS_REGISTER | 10 | A2:L11 | Direitos por fonte/documento em HOLD, nenhum liberado |
| CONFLICT_REGISTER | 8 | A2:L9 | Três achados M05 e dois conflitos curriculares UC08 |
| HOLD_HUMAN | 7 | A2:K8 | Direitos, revisão clínica, SCM, SBV, fontes de descoberta e UC08 |
| CHANGE_IMPACT | 7 | A2:N8 | Afetação de claims, links, currículos e estados candidatos |
| PMO_MASTER | 1 | A13:J13 | PMO-012 em andamento, com referências PRs 66/67/68 |
| REGISTRY_CATALOG | 2 | A10:J11 | Localização do Supabase e GitHub canônico |

**Total:** 56 linhas de dados operacionais + 2 registros de catálogo = **58 linhas novas**; todas conferidas por leitura de retorno. IDs do recorte verificados sem repetição. A contagem de linhas não representa fontes/claims clinicamente aprovados.

## Crosswalk de identidades M05
- Fonte existente do Ministério da Saúde `SRC-BR-MS` foi **reutilizada**, sem gerar fonte duplicada, para os documentos `DOC-CAND-M05-EXT-004` e `DOC-CAND-M05-EXT-005`.
- `SRC-AHA-BLS-2025` foi usado como ID histórico; a descoberta `CKO-SRC-M05-EXT-006` **não foi inserida como nova fonte**.
- `SRC-SBC-ECG-2022` → `DOC-abf0b50dde7e1c30` → quatro ATM → três `CKO-M05-ECG-00x`, todos candidatos e `PENDING_CLINICAL_REVIEW`.
- `SRC-SBC-HA-2025` → `DOC-25e47589bd1e4eb7`, com `CONFLICT-M05-SCM-SEMANTIC` e `CONFLICT-M05-HA-LICENSE` abertos.
- `CKO-SRC-M05-EXT-001..003` são **IDs temporários de descoberta**, não fontes qualificadas. Seus documentos `DOC-CAND-M05-EXT-001..003` não têm hash de snapshot nem direitos verificados.
- IDs de documento e snapshot da extração M03 não equivalem automaticamente a identidades Supabase; a reconciliação de PKs ainda está pendente.

## Supabase operacional — somente leitura, não sincronizado
Projeto existente: `Calculadoras-Smart` / `pgsybzggewhinaniybiy`. Consulta real de estrutura e `count(*)` em 14/11:

| Registro físico | PK/chave observada | Linhas |
|---|---|---:|
| `cko_evidence.sources` | `source_id` | 157 |
| `cko_evidence.snapshots` | `snapshot_id` | 84 |
| `cko_evidence.fragments` | `fragment_id` | 103 |
| `cko_evidence.claims` | `claim_id` | 41 |
| `cko_governance.documents` | `document_id` | 187 |
| `cko_governance.rights_records` | `rights_record_id` | 2 |
| `cko_validation.findings` | `finding_id` | 339 |
| `calculadoras_de_enfermagem.source_lineage` | coluna observada `target_source_id`, sem comprovação de PK | 61 |

Essas contagens **não são equivalentes** aos 118 sources, 124 documents e 28.001 evidence atoms históricos da extração SQLite M03. Não fazer import/UPSERT por semelhança de títulos ou IDs sem crosswalk; `cko_governance.documents` contém outros tipos documentais e `cko_evidence.fragments` não é espelho integral do corpus local.

Outras tabelas operacionais observadas: `cko_evidence.source_accreditations` e `calculadoras_de_enfermagem.document_atomization`.

## GitHub e contratos preexistentes
- `contracts/cko-schemas/source.schema.json`, `claim.schema.json`, `audit_evidence.schema.json`, `find.schema.json` na `main`; contratos de projeção em `contracts/cko-editorial`.
- `registers/governance/find-register.v1.json`: registro global existente de FINDs, **três achados M05 anexados somente na branch do PR #68**, com `mutation_allowed=false` e `work_order=NOT_ADMITTED`.
- `registers/pmo/queue.v1.json` da `main` não foi modificado.
- PR #66: claims/atom provenance candidato; PR #67: governança e PMO; PR #68: direitos/FINDs e índice.
- `main` e produção não receberam commits, migrações nem publicações.

## Gates permanentes
`SOURCE/DOCUMENT/ATOM/CLAIM` da planilha são **registros de descoberta e reconciliação**, não promoção canônica nem autorização de uso. Licença por documento, vigência, autoridade, reavaliação clínica, rastreabilidade íntegra e admissão governada continuam em HOLD.

**Próximo controle:** reconciliar 15 linhas do SOURCE_REGISTER do Sheets com `cko_evidence.sources` (157 linhas) e com fontes SQLite M03 (118), sem assumir identidades coincidentes pelo nome. Registrar correspondências com `exact_id`, `alias`, `conflict`, `new_candidate` e decisões quando comprovadas.

## Crosswalk físico executado — checagem adicional em Supabase
Consulta `SELECT` somente leitura comparou todos os **15 SOURCE_ID** do Sheets, **8 DOCUMENT_ID**, **3 CLAIM_ID** e os **3 FIND_ID** da M05 às colunas respectivas de `cko_evidence.sources`, `cko_governance.documents`, `cko_evidence.claims` e `cko_validation.findings`: **0 correspondências exatas em 29 IDs**. Uma consulta parcial independente também confirmou 0/4 sources escolhidas. Isso **não** comprova que o conteúdo não exista no Supabase; demonstra ausência de chaves literais coincidentes no subconjunto verificado. Próximo passo B59: crosswalk por alias, URI, DOI, versão, SHA e autoridade, documentando decisões por registro. Não criar dados no banco por semelhança nominal.

O resultado foi registrado adicionalmente em `CONFLICT_REGISTER!A7:L7` (`CONFLICT-M05-SUPABASE-ID-CROSSWALK`) e `CHANGE_IMPACT!A7:N7` (`CHANGE-M05-06`), com leitura de retorno positiva.

## B59 — Reconciliação ampliada (14/11/2026)
O cruzamento 118 `M03.sources` × 157 `cko_evidence.sources` retornou **0 source_id exatos**, mas **cinco pares de URLs oficiais** compartilhados por quatro fontes M03. Três são candidatos a mesma norma; os dois restantes apontam para a Lei 7498/1986, enquanto o registro M03 agrupa lei e decreto (escopo parcial). O Supabase tem três grupos adicionais de URLs duplicadas dentro do domínio de enfermagem (COFEN 564, Lei 7498, Decreto 94406). Ver `b59/B59_METHOD_AND_DECISIONS.md` e tabelas CSV no PR #67.

**Escritas confirmadas no Sheets:** 15 células `SOURCE_REGISTER!L2:L16` com referência ao crosswalk, dois conflitos novos em `CONFLICT_REGISTER!A8:L9`, um impacto em `CHANGE_IMPACT!A8:N8`, e atualização pontual em `PMO_MASTER!H13`. **Total acumulado de novas linhas: 58** (além das 16 células atualizadas). O histórico anterior não foi sobrescrito. Nenhum direito ou claim foi liberado.
