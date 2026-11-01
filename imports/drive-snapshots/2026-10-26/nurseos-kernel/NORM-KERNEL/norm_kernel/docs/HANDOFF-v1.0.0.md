# HANDOFF — NORM-KERNEL v1.0.0 (2026-09-29)

**Estado: Fase 0 (calibração) COMPLETA e FECHADA.** Sistema governado ponta a
ponta, 13 gates PASS, meta-audit CONFORM, deploy gate PASS, 5 findings
fechados com dupla aprovação. Backup completo anexado a este handoff.

## 1. Estado do sistema (verificado 2026-09-29)
| Dimensão | Valor |
|---|---|
| Metamodelo | anexo v1.4.0, pin `17530e3c…`, 90 campos + lifecycles codificados |
| Políticas | POL-NK-001..008 (Active; 001 v1.0.6, 002 v1.2) |
| Gates | G1..G12 + pin = 13 PASS (pipeline v0.7.0, EV-NK-0010/0011) |
| Banco | 10 fontes · 12 licenças · 6 docs · 10 átomos · 23 termos · 10 runs · 34+ OS — CONFORM |
| Findings | F-0001..0005 CLOSED (kernel + humano) |
| Front-end | normKernelRenderPage v0.1.4 — gerado, WCAG, OG, lifecycles visíveis |
| Débitas | ver §4 — nenhuma bloqueante para Fase 1 |

## 2. Entregáveis
- Página pública: função normKernelRenderPage (URL pública do builder)
- Documentação de sistemas: docs/system-documentation.md
- Processos: docs/processes.md · Playbook de fontes: docs/source_playbook.md
- Backlog: registers/backlog.json (15 normativos) · Ledger: registers/kernel_tasks.json
- Backup v1.0.0: **norm_kernel_v1.0.0_backup_2026-09-29.zip** (URL no chat; sha256 abaixo)

## 3. Como operar (receitas)
1. **Criar registro:** POST normKernelOrder `{os_id: "NK-OS-NNNN", requester:
   "superagent", order_kind: "create", entity_name, evidence_id, notes,
   payload_draft: {...SEM id...}}` — o kernel gera o id.
2. **Mudar metamodelo:** emenda (P-03) — documento NK-EMENDA + OS amendment
   + sua aprovação + cascata de re-pin.
3. **Rodar pipeline:** `python3 pipeline.py --os NK-OS-NNNN` (drift sem OS
   = bloqueio + finding automático).
4. **Auditar:** metaAudit → CONFORM? deployGate → PASS? G10 → findings ok?

## 4. Débitas declaradas (nenhuma escondida)
1. Endpoints a verificar: DOU/IN oficial, Planalto (sem API), MQD (versão), datatracker.
2. Recusas de OS ainda não geram task no ledger (G12 futuro).
3. Multi-átomo por linha; deôntica implícita; condicionais aninhadas; OCR.
4. axe/Lighthouse runtime (validação estática feita; browser headless débito).
5. Promote homolog→produção automático (hoje: deploy gate manual).
6. Validação léxica de strings do kernel; coerência nascimento×enum já coberta pelo G12.
7. Licença ISO pendente (NK-BL-0014 bloqueado); fonte FHIR própria (NK-BL-0015).
8. Strings com '(verificar)' em leis = Fase 0 debts, não fatos.

## 5. Próximos passos detalhados — FASE 1 (fatia de valor V1)
**Objetivo:** primeiro normativo REAL extraído, atomizado, publicado, com
rastreio ponta a ponta, sem quebrar nenhum gate.

**Passo 1 — Verificação de fontes (pré-requisito, ~1 sessão).**
1.1. Confirmar endpoint oficial DOU/IN (in.gov.br) e documentar no playbook.
1.2. Confirmar versão da API MQD e limites.
1.3. Registrar fonte HL7/FHIR própria se V6 avançar (NK-BL-0015).
*Critério de aceite:* playbook atualizado via OS; fontes sem '(verificar)' nos
itens que forem usados.

**Passo 2 — Primeiro job real (NK-BL-0001, RFC 2119).**
2.1. OS de job (P-04): cria NK-JOB-0001 + entry em extraction_jobs.json.
2.2. Download api-txt + sha256 IMEDIATO; tentativa registrada.
2.3. Parse → átomos (deôntica EXPLÍCITA: MUST/SHOULD/MAY) → NK-DOC-00002
     (id gerado pelo kernel) → transição draft→valid via OS.
2.4. Gates G1..G12 + deploy gate; run NK-RUN-NNNN via OS; evidência nova.
*Critério:* 13 gates PASS com conteúdo real; front-end exibe RFC 2119.

**Passo 3 — Primeira fatia V1 (portaria ANVISA via DOU).**
3.1. Item NK-BL-0003; OCR/escaneados tratados como tentativa declarada.
3.2. LGPD H11: dados pessoais em publicações — política de retenção ANTES.
*Critério:* portaria atomizada + citação canônica + licença KL-0001.

**Passo 4 — Endurecimento (paralelo).**
4.1. G12: recusas de OS como tasks no ledger (emenda menor).
4.2. axe/Lighthouse runtime via browser headless (gates PUBLISH).
4.3. Multi-átomo por linha (emenda POL-NK-002/atomizer).
*Critério:* cada item com evidência própria e OS.

**Passo 5 — Revisão humana (você).**
5.1. Aprovar emendas da Fase 1 (uma a uma, via P-03).
5.2. Fechar Fase 1 com evidência EV-NK-NNNN assinada (mesmo padrão da Fase 0).

## 6. Verdade sobre o conteúdo atual
Os 10 átomos e 23 termos vigentes são **fixtures de calibração sintéticos**
(SRC-CAL-FIXTURE, KL-0005) — NÃO são normas reais. O sistema que os governa é
real e provado; o conteúdo normativo real começa no Passo 2 da Fase 1.
