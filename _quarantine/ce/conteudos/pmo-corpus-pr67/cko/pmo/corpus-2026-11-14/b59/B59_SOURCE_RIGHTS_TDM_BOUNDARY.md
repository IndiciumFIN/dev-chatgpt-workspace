# B59 — Direitos históricos de texto normativo versus external AI TDM

**Conferido no arquivo original read-only** `/mnt/data/CKO_M03_recuperacao/validacao/canonical_corpus.sqlite`, tabelas `documents` e `source_rights_profiles`; nenhum conteúdo textual protegido exportado.

| M03 source_id | Documentos M03 | rights_gate_status | atomize_tdm_ai | rights_review_status |
|---|---|---|---|---|
| `SRC-ANVISA-RDC36-2013` | `DOC-d5d348a024e19b30` | DEFAULT_ACTIVE | ALLOWED_FOR_OFFICIAL_TEXT | AUDITED |
| `SRC-COFEN-736-2024` | `DOC-550c6f44b5147192`, `DOC-e71e2ec2f1ce7c5d`, `DOC-1bcaf6f5d0789e0b` | DEFAULT_ACTIVE | ALLOWED_FOR_OFFICIAL_TEXT | AUDITED |
| `SRC-MS-PNSP-529-2013` | `DOC-d47684df088a5152` | DEFAULT_ACTIVE | ALLOWED_FOR_OFFICIAL_TEXT | AUDITED |
| `SRC-BR-EXERCICIO-ENF` | `DOC-18188d843b74c972` | DEFAULT_ACTIVE | ALLOWED_FOR_OFFICIAL_TEXT | AUDITED |

Os campos históricos **`DEFAULT_ACTIVE`** e **`ALLOWED_FOR_OFFICIAL_TEXT`** registram o enquadramento feito para textos oficiais no corpus M03. **Não são concessões documentais individualizadas para transmitir texto, inclusive de fontes normativas, à API de terceiros**. A verificação do processamento externo exige finalidade explícita, provedor, integridade de versão, privacidade, aprovação humana e política de transferência — dados que não estão presentes no cadastro operacional SOT atual.

**Ações:** preservar os IDs e o status histórico; registrar os quatro casos como metadados de revisão `EXTERNAL_AI_TDM=NOT_VERIFIED`; não marcar aprovação nem revogar registros originais automaticamente. O novo contrato/validador candidato está no [PR #68](https://github.com/IndiciumFIN/dev-chatgpt-workspace/pull/68); seu schema SQL é **PROPOSTA NÃO APLICADA**. O workflow [#43571430279](https://github.com/IndiciumFIN/dev-chatgpt-workspace/actions/runs/43571430279) passou, apenas na camada de testes determinísticos.

A B59 permanece `IN_PROGRESS` quanto a versão, escopo e comparação textual; 0 aliases admitidos.
