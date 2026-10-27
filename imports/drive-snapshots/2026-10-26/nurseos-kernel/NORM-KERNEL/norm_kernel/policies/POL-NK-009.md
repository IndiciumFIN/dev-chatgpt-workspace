# POL-NK-009 — Cânone dos Normativos Universais e Análise Ponto a Ponto (v1.0.0)

**Aprovada por:** diretriz do Leivis (2026-09-29 14:38): "todas os normativos
universais de forma canônica e 100% extraído... o que não for aplicável
ficará evidenciado os motivos... status e evidência de nossas análises...
isso se torna bloqueante."

## C1 — Registro canônico obrigatório
Todo normativo UNIVERSAL referenciado pela plataforma (anexo de metamodelo,
políticas, processos, documentação) tem registro em
`registers/universals.json` (id NK-UNIV-NNNN) com: nome, aliases, tipo, fonte
registrada, licença KL, canon_status, evidência. Referência sem registro
canônico = run BLOCKED (G13).

## C2 — Análise ponto a ponto
Todo normativo com cânone completo tem análise POR ITEM (átomo/requisito):
`aplica | nao_aplica | parcial` + **motivo** + evidência. O que não é
aplicável fica EVIDENCIADO com o motivo e o critério — isso converte a
conformidade em **documentação com evidência** para o usuário final.
Nenhum item fica sem análise.

## C3 — Fontes alternativas para metadados
Normativo acessível apenas em METADADOS (ex.: ISO com KL pending_contract)
declara `alternative_source` com: o que é acessível, o que suporta a análise
(evidenciado), e o caminho de upgrade. Buscar alternativas completas que
sustentem as análises é obrigação contínua; a restrição licitória é
EVIDENCIADA, nunca escondida.

## C4 — Status honestos e universo explícito
Enum de canon_status: `canon_complete` (texto integral atomizado + análise
ponto a ponto) | `analysis_pending` (uso/uso previsto real, com
justificativa evidenciada e trabalho futuro declarado) |
`metadata_alternative` (C3). Pending sem justificativa = BLOCKED.
Fingir completude sem átomos = BLOCKED.

## C5 — Transições do cânone
Mudança de canon_status é transição por OS do kernel (POL-NK-002/POL-NK-008),
com evidência (ex.: licença ISO obtida → verificação → canon_complete).

## C6 — Gate bloqueante G13
Instrumento: `check_links.gate_universals_canon()` (pipeline v0.7.1, 14 gates).
Valida: estrutura obrigatória por entrada, enum de status, justificativa em
pendings, alternativa em metadados, doc_ref+átomos+pontos completos em
canon_complete, e cobertura: todo token universal referenciado no anexo
(LGPD, 9.610, WCAG, RFC 8785, RFC 2119, ISO 8000, IETF, 26514, 42010) tem
registro ativo. Sem cobertura = BLOCKED.

## C7 — Documentação viva
O registro + análises alimentam o front-end gerado: cada universal aparece
com status, fonte, licença e a análise (com motivos). Documentação de
decisões = valor para o usuário final.

state: Active; severity: blocking; enforcement_point: gate G13 (pipeline v0.7.1)
