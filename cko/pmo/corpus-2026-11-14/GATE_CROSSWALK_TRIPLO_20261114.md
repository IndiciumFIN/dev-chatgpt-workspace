# Reconciliação das três matrizes históricas de gates — proposta, não homologada

**Data:** 2026-11-14. **Documento de referência:** `PLANO_INTEGRADO_PONTA_A_PONTA_20261114.md`.

## Origem das matrizes

- **Drive PMO Mestre**: aba `PMO_EXECUTION_GATES_G0_G9`. É o plano de execução clássico: G0 baseline, G1 perfil, G2 PMO, G3 universo, G4 **arquitetura isolada Supabase**, G5 aquisição APIs, G6 extração/IA, G7 validação, G8 conteúdo, G9 auditoria final.
- **Drive R04**: aba `R04_GATES_G0_G12_DRAFT`. Plano de preservação rigoroso: G0 baseline, G1 enumeração recursiva, G2 fixidez, G3 leitura estrutural, G4 identidade e direitos, G5 classificação, G6 canonização/atomização, G7 dedup/versões, G8 PMO/registry, G9 organização controlada, G10 **novo projeto/DeepSeek** somente com aprovação, G11 conteúdo, G12 auditoria 360.
- **GitHub PR #67**: `GATES.md`, G0 baseline, G1 inventário, G2 governança, G3 Trilha de carreira/ontologia, G4 fontes, G5 evidências, G6 editorial, G7 **integração**, G8 QA, G9 publicação e G10 handoff.

Os três usam os mesmos rótulos `G0, G1, ...` para objetos diferentes. **Qualquer evento que diga apenas "G4 PASS" é ambíguo e deve ser rejeitado.** Usar identificadores completos `DRIVE_EXEC:G4`, `R04:G10`, `GIT_CKO:G7` ou fases `PPxx`.

## Crosswalk funcional para orientar execução, sem declarar equivalência normativa

| Fase PP | PMO Mestre `DRIVE_EXEC` | Preservação `R04` | Candidato Git `GIT_CKO` | Evidência essencial |
|---|---|---|---|---|
| PP00 — Escopo/ADR | G0, G2, G4* | G0, G8, G10* | G0, G2, G7* | decisão de isolamento, ownership e escopo |
| PP01 — Inventário | G0, G1 | G0, G1 | G0, G1 | closure de pastas e 100% de objetos ou HOLD |
| PP02 — Preservação/extração | G1 | G2, G3 | G0, G1 | hash/CRC, parsing, manifests e pages |
| PP03 — Identidade e direitos | G1, G3, G7 | G4, G5, G7 | G1, G4 | source/document/authority, direitos |
| PP04 — Trilha de carreira | G3 | G5, G6, G8 | G3 | etapas de carreira propostas, UC/ementa fonte preservados, topics, specialties, ontologia |
| PP05 — Aquisição APIs | G5 | G3, G4, G10* | G4 | adapters e snapshots permitidos |
| PP06 — Atomização | G6 | G3, G6 | G5 | source span, atom, claim, prova |
| PP07 — Metamodelo e dicionários | G6, G7 | G6, G7, G8 | G3, G7 | schema diff, links, constraints |
| PP08 — Revisão científica | G7 | G4, G6, G7 | G5, G8 | revisão e conflicts por claim |
| PP09 — Content Factory | G8 | G11 | G6, G9 | conteúdo aprovado e projeções |
| PP10 — Infra/integração | G4* | G10* | G7 | ADR humano, RLS, segurança, rollback |
| PP11 — Testes/Auditoria | G7, G9 | G12 | G8 | QA 360, segurança clínica, CI |
| PP12 — Publicação/merge | G8, G9 | G9, G11, G12 | G9 | release manifest, aprovações e rollback |
| PP13 — Handoff/atualização | G9 | G12 | G10 | monitoração normativa, DR, logs |

`*` Requisitos de infraestrutura distintos: a orientação antiga exige um **ambiente Supabase novo e isolado**, enquanto o código atual e a revisão Git usam os objetos de `Calculadoras-Smart` em modo de análise. **Foi localizado o piloto `SOT-10-09-2026` do PMO-011: ativo, dez tabelas de corpus vazias na listagem e funções implantadas, mas dentro da mesma organização de `Calculadoras-Smart`.** Isso não satisfaz automaticamente o requisito histórico de nova organização isolada. Não há autorização declarada para provisionar nem migrar infraestrutura. Abrir ADR de escolha entre isolado, integração segura ou ambos como ambientes distintos. Não tornar um gate específico `PASS` em outra matriz por associação de fase.

## Regra de progressão
1. Anexar ID completo do gate, objeto, revisão de versão, evidência, responsável, tipo de aprovação e riscos.
2. Reconciliar os cadastros do Drive, os artefatos Git e a infraestrutura Supabase antes de escrever dados.
3. Proteger clínica/direitos/privacidade independentemente de checks técnicos.
4. Execução paralela permitida em documentação e testes read-only; promoção apenas após dependências de objeto.
5. `HOLD_HUMAN`, `WAITING_SOURCE` e `DRAFT` não convertem automaticamente para `PASS`.
6. Sob auditoria, uma única fase pode reportar estados diferentes para seus gates nas três matrizes; isso é esperado até ratificação formal.

**Estado atual:** crosswalk documentado para revisão. Os gates históricos não foram alterados e nenhuma aprovação foi presumida.
