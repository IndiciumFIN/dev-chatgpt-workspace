# POL-NK-011 — Processo DTH: Desenvolvimento, Teste e Homologação (v1.0.0)

**Aprovada por:** diretriz do Leivis (2026-09-29 14:45): "tudo aqui inicia
por um único ID que é nosso bloqueante que é a OS, mas toda a lógica de
análises devem ter claros todos os impactos... temos um processo de
'desenvolvimento', teste e homologação."

## C1 — A OS é a porta única
Toda mudança de plataforma (código, política, gate, registro, função,
front-end, pin) nasce de UMA OS — o ID único e bloqueante. Sem OS não há
mudança (endosso de POL-NK-002/003; aqui formalizado como entrada do DTH).

## C2 — Matriz de impactos obrigatória
Toda mudança declara impactos: funções, gates, pipeline, registros, front-end,
migração e rollback (padrão da emenda, POL-NK-003 C8). Nada muda sem impactos
declarados e evidenciados.

## C3 — Ambientes do processo
`dev` (sandbox, instrumentos versionados no artifact register, checksum JCS)
→ `test` (pipeline de gates 100% PASS + provas específicas: drills, fuzz,
mutation quando aplicável; evidência assinada) → `staged`/homologação (kernel
valida e ASSINA; mudança aguarda HUMANO) → `approved` (aprovação humana
registrada) → `deployed` (publicação/pin/produção com deploy gate PASS e
baseline re-aprovada por ato de política).

## C4 — Registro DTH
registers/dth_changes.json: toda mudança tem entrada NK-CHG-NNNN com os_ref,
kind, impacts, status (enum fixo), test_evidence, kernel_approval,
human_approval. Transições de status via OS do kernel.

## C5 — Gate G14 bloqueante
Instrumento: check_links.gate_dth(). Valida: estrutura obrigatória por
entrada, enum de status, deployed exige aprovação KERNEL + HUMANA, e
cobertura: TODA função registrada como deployed no artifact register aparece
na matriz de impactos de alguma CHG. Função sem CHG = BLOCKED.

## C6 — Homologação é humana
O kernel valida e assina, mas NÃO homologa: produção exige aprovação humana
registrada na CHG (consistente com POL-NK-003: exclusão, emenda e agora
deploy são atos com autoridade humana).

state: Active; severity: blocking; enforcement_point: gate G14 (pipeline v0.7.2, 15 gates)
