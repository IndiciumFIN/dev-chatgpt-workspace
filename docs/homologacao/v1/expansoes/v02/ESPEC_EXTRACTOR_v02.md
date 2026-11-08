---
document_id: WUTRIB-DOC-EXP-V02-EXT
version: 0.2.0
status: DRAFT
wo: WUTRIB-WO-PLAN-018
owner_role: DATA_ARCHITECT
reviewer_role: INFORMATION_SECURITY_AND_FISCAL
approver_role: PRODUCT_OWNER
approved_by: NONE
approved_at: NONE
classification: INTERNAL
---

# EXP-001 — Extractor, manifesto, qualidade de fonte e quarentena

**Objetivo:** admitir fontes de forma reproduzível, tipada e somente leitura. Não supor que o Protheus tenha tabelas, campos ou layouts definidos sem snapshot autorizado, release e fonte oficial.

## Escopo do fluxo
1. **Autorização:** organização, filial, projeto/WO, operador, finalidade, base/permissões, classificação e escopo do período; sem autorização, `BLOCKED`.
2. **Descoberta:** registrar source_system, contract_version, tipo, `erp_release`, leiaute, charset, compressão e parâmetros de leitura; sem contrato, `BLOCKED`, não usar parser genérico permissivo.
3. **Captura:** arquivo original imutável, manifest de bytes e SHA-256 real; stream/chunks com contagem de linhas/records, rejeições e offsets. Não incluir conteúdo sensível em logs.
4. **Validação técnica:** integridade do arquivo, extensão/magic bytes, layout, encoding, tamanho, limites e contagem independente; conteúdo fiscal permanece `NOT_EVALUATED`.
5. **Projeção tipada:** preservar valor bruto, campo físico, tipo, precisão/escala, origem, chave externa e hierarquia registro/item; transformações em registro próprio com hash e versão.
6. **Qualidade:** definir linhas válidas/rejeitadas/quarentena, nulidade, duplicidade, gaps e cobertura. Uma extração incompleta não pode ser publicada como dataset íntegro.
7. **Publicação de candidato:** somente manifest + dataset imutável e `READY_FOR_REVIEW` quando todas as pré-condições técnicas se confirmarem. Sem operar contra ERP real nesta etapa.

## Contratos e formatos futuros
`DatasetManifest`: `datasetId, orgCode, branchCode, sourceContract, period, captureAt, sourceHash, rowCount, rejectedCount, schemaVersion, classification, fields, lineageParents, checksumVersion`. No uso de snapshots ERP, `erpRelease`, `sourceFieldCatalogRef`, `userScope` e prova de captura devem estar presentes.

**Origens candidatas:** XML NF-e com eventos; EFD ICMS/IPI por COD_VER/edição; CSV/TXT/XLSX de controladoria; snapshot Protheus SX2/SX3/SIX, SA1/SA2/SB1, SF1/SF2/SF3/SFT/SF4; TOTVS FISA170 por release. Essas fontes são candidatos, **não são conectores implementados**.

## Regras de integridade
- Reconciliação `bytes_lidos + bytes_nao_lidos == bytes_fonte` quando a API disponibiliza limites físicos; para linhas, `lidas = válidas + rejeitadas` com tratamento explícito de cabeçalhos/rodapés. Não confundir contagem física de linhas com número de registros de negócio.
- `status=BLOCKED` se a captura terminar parcialmente, se o checksum mudar, se faltar fonte obrigatória ou se a estrutura estiver fora da versão; `EMPTY_VALID` somente após comprovar arquivo íntegro e vazio segundo contrato.
- SHA do arquivo original distinto do digest semântico (normalizações não alteram o primeiro); timestamps fora do digest semântico reexecutável.
- Lote não entra em join, fiscal library ou dashboards finais quando estado técnico é `INCOMPLETE`, salvo investigação explicitamente sinalizada e sem conclusão.
- Segurança: não permitir XML DTD/ENTITY/XXE, zip bomb, path traversal ou expansão descontrolada; formato de origem validado por conteúdo e limiares autorizados.

## Casos de teste futuros (todos NOT_RUN)
`EXT02-01` arquivo válido com hash e contagem exatos; `EXT02-02` truncamento detectado; `EXT02-03` payload/encoding adversarial rejeitado; `EXT02-04` dicionário de campo divergente; `EXT02-05` reprocessamento idempotente; `EXT02-06` acesso a outra organização negado; `EXT02-07` arquivo sem dados mas tecnicamente completo; `EXT02-08` mudança de release ERP não prevista → HOLD.

## UX e riscos
Experiência de importação com escolha de origem, escopo, período, prévia de contrato, custo estimado, progresso com cancelamento seguro, tabela de rejeições e estado de quarentena. A mensagem deve diferenciar **arquivo vazio**, **arquivo incompleto** e **nenhum resultado após filtros**.

**Riscos P0:** perda silenciosa de dados e contaminação entre empresas/filiais. **Controles:** manifestação de fonte íntegra, autorização, reconciliação de cobertura, formato e quarentena. **Situação:** PLANNED; evidência de execução INEXISTENTE.
