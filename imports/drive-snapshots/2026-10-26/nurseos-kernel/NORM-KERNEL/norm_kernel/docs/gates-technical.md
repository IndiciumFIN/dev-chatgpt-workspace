# Estrutura Técnica de Gates (v0.7.3 — 15 gates bloqueantes)

> Gerado sob OS; instrumento: pipeline.py (v0.7.3) + check_links.py + pins. Toda mudança de gate exige OS + política (POL-NK-011 DTH).

| # | Gate | O que verifica |
|---|---|---|
| G1 | `gate_atom_links` |  |
| G2 | `gate_dth` | G14 — POL-NK-011: processo DTH (desenvolvimento, teste, homologação). |
| G3 | `gate_field_norms` |  |
| G4 | `gate_lifecycles_and_tasks` | G12 — POL-NK-008: codificação no metamodelo + ledger de tasks. |
| G5 | `gate_materialization` | G8 — materialização (POL-NK-004): produção só com OS aceita de validação; |
| G6 | `gate_normative_layers` | G7 — cada campo com norma primaria + 6 camadas transversais base (POL-NK-002 Anexo III). |
| G7 | `gate_pin` |  |
| G8 | `gate_quality_iso8000` |  |
| G9 | `gate_universal_registration` | G9 — registro universal (POL-NK-005): NADA NASCE SOLTO. Todo artefato do |
| G10 | `gate_universals_canon` | G13 — POL-NK-009: cânone dos normativos universais + análise ponto a ponto |
| G11 | `gate_value_conformance` | G6 — conteúdo dos campos conforme composição/enum/padrão/faixa declarados |
| — | `PIN` | integridade do metamodelo por sha256 (drift = kernel não opera) |

## Como um gate nasce
OS → política com cláusula → função de gate em check_links.py → chamada no pipeline → evidência assinada. Gates são INSTRUMENTOS de política (POL-NK-001 C5): gate sem política é dívida; política sem gate é afirmação sem verificação.
